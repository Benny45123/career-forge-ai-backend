const pdfParse = require('pdf-parse');
const {buildResumeRetriever} = require('../rag/retreiver.js');
const CoverLetter = require('../models/coverLetterSchema.js');
const {GoogleGenerativeAI}= require('@google/generative-ai');
const {buildCoverLetterPrompt,buildResumeAnalysisPrompt} = require('../utils/promptBuider.js');
const API_KEY = process.env.GEMINI_API_KEY;
const generateCoverLetter = async (req, res) => {
    console.log(req.body);
    let cleanup=null;
    try{
        const { jobDescription,
            skillsFocus,
            recruiterName,
            recruiterDesignation,
            companyName } = req.body;
        if (!req.file) {
            return res.status(400).json({ error: 'Resume file is required' });
        }
        const resumeData = await pdfParse(req.file.buffer);
        const resumeText = resumeData.text;
        const {retreiver,cleanup:_cleanup}=await buildResumeRetriever(resumeText,req.user.id);
        cleanup=_cleanup;
        const jobQuery = `${jobDescription} ${skillsFocus}`;
        let jobChunks = await retreiver(jobQuery);
        const contactQuery = "name email phone linkedin contact information";
        let contactChunks = await retreiver(contactQuery);
        const seen = new Set();
        const allChunks = [];
        for(const chunk of [...jobChunks, ...contactChunks]){
            const text = chunk.pageContent;
            if(!seen.has(text)){
                seen.add(text);
                allChunks.push(chunk);
            }
        }
        const prompt=buildCoverLetterPrompt(allChunks,jobDescription,skillsFocus,recruiterName,recruiterDesignation,companyName);
        const ai = new GoogleGenerativeAI( API_KEY );
        const model = ai.getGenerativeModel({model:"gemini-2.5-flash-lite"});
        const response = await model.generateContent(prompt);
        console.log("Raw AI Output:", await response.response.text());
        const rawOutput = await response.response.text();
        const cleanedOutput = rawOutput.replace(/```json/g, "").replace(/```/g, "").trim();
        let parsedOutput;
        try {
            parsedOutput = JSON.parse(cleanedOutput);
        }
        catch (parseError) {
            console.error("Error parsing AI output as JSON:", parseError);
            return res.status(500).json({ error: "Failed to parse AI output" });
        }
        const {coverLetter,email,phone,linkedin,role,name}=parsedOutput;
            const saved=await CoverLetter.create({
                userId:req.user.id,
                generatedLetter:coverLetter,
                email,
                phone,
                linkedin,
                role,
                name
            });
            res.status(200).json({
                coverLetter,
                email,
                phone,
                linkedin,
                role,
                name,
                id:saved._id
            });
    }
    catch(error){
        console.error("Error generating cover letter:",error);
        res.status(500).json({error:"Failed to generate cover letter"});
    }
    finally{
        if(cleanup){
            cleanup();
        }
    }
}
const getUserCoverLetters=async (req,res)=>{
    try{
        const userId=req.user.id;
        const userName=req.user.name;
        const email=req.user.email;
        const letters=await CoverLetter.find({userId}).populate("userId","name email").sort({createdAt:-1});
        res.status(200).json({coverLetters:letters,user:{id:userId,name:userName,email}});
    }
    catch(err){
        console.error("Error fetching cover letters:",err);
        res.status(500).json({error:"Failed to fetch cover letters"});
    }
}
module.exports={generateCoverLetter,getUserCoverLetters};