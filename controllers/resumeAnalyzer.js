const pdfParse = require('pdf-parse');
const Resume = require('../models/ResumeSchema.js');
const {GoogleGenerativeAI}= require('@google/generative-ai');
const {buildResumeAnalysisPrompt} = require('../utils/promptBuider.js');
const {buildResumeRetriever} = require('../rag/retreiver.js');
const API_KEY = process.env.GEMINI_API_KEY;
const genAi = new GoogleGenerativeAI(API_KEY);
const analyzeResume = async(req,res)=>{
  let cleanup=null;
    try{
        if(!req.file){
            return res.status(400).json({error:'Resume file is required'});
        }
        const resumeData=await pdfParse(req.file.buffer);
        const resumeText=resumeData.text;
        const jobDescription=req.body.jobDescription||"";
        const {retreiver,cleanup:_cleanup}=await buildResumeRetriever(resumeText,req.user.id);
        cleanup=_cleanup;
        const queries= [
          {q:jobDescription,k:8},                                          
          {q:"technical skills programming languages frameworks tools libraries",k:7}, 
          {q:"work experience projects achievements responsibilities",k:7},            
          {q:"education degree university certification courses",k:3},                 
          {q:"summary objective profile professional overview",k:3},                   
        ];
        const seen = new Set();
        const uniqueChunks = [];

        for (const {q,k} of queries) {
          if (!q.trim()) continue;
            const chunks = await retreiver(q, k);
            for (const chunk of chunks) {
              if (!seen.has(chunk.pageContent)) {
                seen.add(chunk.pageContent);
                uniqueChunks.push(chunk);
              }
            }
          }

        const prompt=buildResumeAnalysisPrompt(uniqueChunks,jobDescription);


        const model = genAi.getGenerativeModel({model:"gemini-2.5-flash-lite"});
        const response = await model.generateContent(prompt);
        console.log("Raw AI Output:", await response.response.text());
        const rawOutput = await response.response.text();
            const cleaned = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
            let parsed;
            try {
              parsed = JSON.parse(cleaned);
            } catch (parseError) {
              console.error("JSON parse error:", parseError);
              return res.status(500).json({ error: "Failed to parse AI output" });
            }
          const {job_keywords,matched_keywords,missing_keywords,resume_sections}=parsed;
          const keywordScore = job_keywords.length === 0 ? 0 : (matched_keywords.length / job_keywords.length) * 100;
          const sectionScore = resume_sections.length === 0 ? 0 : (resume_sections.length / 4) * 100;
          const overallScore = Math.round((keywordScore * 0.6) + (sectionScore * 0.4));
          const responseConfidence = jobDescription.length < 60 ? "low" : "high";
          const missing_penalty = Math.min(missing_keywords.length * 0.2,20);
          const finalScore = Math.min(
            Math.round(overallScore - missing_penalty),
            95
          );

          console.log("Final ATS Score:", finalScore);
      
          await Resume.create({
            userId:req.user.id,
            atsScore:finalScore,
            responseConfidence,
            missing_keywords,
            resumeText
          });
        res.status(200).json({
            atsScore:finalScore,
            matched_keywords,
            resume_sections,
            missing_keywords,
            responseConfidence
        });

    }
    catch(error){
        console.error("Error analyzing resume:",error);
    }
    finally{
        if(cleanup){
            cleanup();
        }
    }
}
const getAllResumes=async(req,res)=>{
  const userId=req.user.id;
  try{
    const resumes=await Resume.find({userId}).sort({createdAt:-1});
    res.status(200).json({resumes});
  }
  catch(error){
    console.error("Error fetching resumes:",error);
    res.status(500).json({error:"Failed to fetch resumes"});
  }
}
module.exports={analyzeResume,getAllResumes};