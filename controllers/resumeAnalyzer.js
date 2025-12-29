const pdfParse = require('pdf-parse');
const Resume = require('../models/ResumeSchema.js');
const {GoogleGenerativeAI}= require('@google/generative-ai');
const { create } = require('../models/userSchema.js');
const API_KEY = process.env.GEMINI_API_KEY;
const genAi = new GoogleGenerativeAI(API_KEY);
const analyzeResume = async(req,res)=>{
    try{
        if(!req.file){
            return res.status(400).json({error:'Resume file is required'});
        }
        const resumeData=await pdfParse(req.file.buffer);
        const resumeText=resumeData.text;
        const jobDescription=req.body.jobDescription||"";
        const prompt = `SYSTEM ROLE:
You are a professional Applicant Tracking System (ATS) resume analyzer used by hiring platforms.
Your task is to analyze resumes strictly for ATS-style parsing and keyword relevance.

You are NOT a scoring system.
You are NOT allowed to calculate percentages or scores.
You are NOT allowed to explain your reasoning.

----------------------------------------------------

INPUTS YOU WILL RECEIVE:
1. Resume text (plain extracted text from PDF or DOCX)
2. Job description text

Both inputs may contain:
- Inconsistent formatting
- Bullet points
- Line breaks
- Noise such as headers, footers, icons, or symbols
- Short or long job descriptions

----------------------------------------------------

YOUR TASKS:

1. JOB KEYWORD EXTRACTION
- Identify the most important skills, tools, technologies, frameworks, methodologies, and role-specific terms from the job description.
- Normalize keywords:
  - Merge synonyms (e.g., "JS" → "JavaScript")
  - Use canonical names (e.g., "Node" → "Node.js")
- Avoid soft skills unless explicitly critical.
- Avoid duplicate or overlapping keywords.
- Limit the list to the most relevant and impactful keywords.

2. MATCHED KEYWORDS
- From the extracted job keywords, identify which ones are explicitly present in the resume text.
- Match case-insensitively.
- Consider simple variations (plural, tense).
- Do NOT infer skills that are not clearly stated.

3. MISSING KEYWORDS
- From the extracted job keywords, list those that are NOT found in the resume text.
- Do not invent new skills.
- Do not include keywords that were never in the job keyword list.

4. RESUME SECTION CLASSIFICATION
- Detect which of the following standard ATS sections are present in the resume:
  - summary
  - skills
  - experience
  - education
- A section is considered present if its content is clearly identifiable.
- Do not assume sections if they are ambiguous.

5. FORMATTING ISSUES DETECTION
- Identify ATS-unfriendly formatting indicators based on resume text patterns:
  - tables
  - icons
  - images
  - columns
- Only include an issue if there is reasonable textual evidence.
- Do not guess or over-report issues.

----------------------------------------------------

OUTPUT REQUIREMENTS (VERY IMPORTANT):

- Return ONLY a single valid JSON object.
- Do NOT include explanations.
- Do NOT include markdown formatting.
- Do NOT include percentages, scores, or commentary.
- Do NOT include additional keys.
- Do NOT include trailing commas.
- All values must be arrays of lowercase strings.
- Use consistent, normalized naming.

----------------------------------------------------

OUTPUT FORMAT (EXACT):

{
  "job_keywords": [],
  "matched_keywords": [],
  "missing_keywords": [],
  "resume_sections": [],
  "formatting_issues": []
}

----------------------------------------------------

FAIL-SAFE RULES:
- If the job description is very short, extract only obvious keywords.
- If no formatting issues are detected, return an empty array for "formatting_issues".
- If a section is not clearly present, do not include it.
- Never return null values.

----------------------------------------------------

BEGIN ANALYSIS USING THE PROVIDED INPUTS.
----------------------------------------------------
RESUME TEXT:
${resumeText}
----------------------------------------------------
JOB DESCRIPTION:
${jobDescription}
`;

        const model = genAi.getGenerativeModel({model:"gemini-2.5-flash-lite"});
        const response = await model.generateContent(prompt);
        console.log("Raw AI Output:", await response.response.text());
        const rawOutput = await response.response.text();
        const {job_keywords,matched_keywords,missing_keywords,resume_sections,formatting_issues}=JSON.parse(rawOutput);
        const keyWordScore = (job_keywords.length===0) ? 0 : (matched_keywords.length/job_keywords.length)*100;
        const sectionScore = (resume_sections.length===0) ? 0 : (resume_sections.length/4)*100; 
        const formattingScore= 100 - (formatting_issues.length * 25);
        const overallScore = (keyWordScore * 0.5) + (sectionScore * 0.3) + (formattingScore * 0.2);
        const minjdLengthForKeywords=60;
        let responseConfidence="high";
        if(jobDescription.length<minjdLengthForKeywords){
            responseConfidence="low";
        }
        res.status(200).json({
            overallScore,
            missing_keywords,
            responseConfidence
        });
      Resume.create({
        userId:req.user.id,
        atsScore:overallScore,
        responseConfidence,
        missing_keywords,
        resumeText
      })
    }
    catch(error){
        console.error("Error analyzing resume:",error);
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