// utils/promptBuilder.js

const buildCoverLetterPrompt = (relevantChunks, jobDescription, skillsFocus, recruiterName, recruiterDesignation, companyName) => {
    // Assemble context from only the most relevant resume sections
    const resumeContext = relevantChunks
      .map((c, i) => `[Resume Section ${i + 1}]:\n${c.pageContent}`)
      .join('\n\n');
  
    return `You are a highly experienced HR writer and cover-letter specialist.
  
  ====================================================================
  📄 RELEVANT RESUME SECTIONS (retrieved for this job):
  ${resumeContext}
  ====================================================================
  
  💼 JOB DESCRIPTION:
  ${jobDescription}
  ====================================================================
  
  🎯 SKILLS TO HIGHLIGHT (only if in resume):
  ${skillsFocus}
  ====================================================================
  
  👤 RECRUITER: ${recruiterName}, ${recruiterDesignation} at ${companyName}
  ====================================================================
  
[INSTRUCTIONS]
1. NARRATIVE FLOW: Open with a hook, show (don't just tell) achievements using the provided resume sections, and close with a confident call to action.
2. TAILORING: Connect the candidate's ${skillsFocus} specifically to the company's mission in the job description.
3. DATA-DRIVEN: Use metrics/numbers from the resume sections if available.
4. STRICT LIMITS: 
   - No "hallucinations": Use ONLY provided data.
   - Aim for 300-400 words.
   - Start with "Dear ${recruiterName || 'Hiring Manager'},"
   - no special symbols like *,&,etc or formatting in the output.
   - end with Sincerely, thats it no name or signature with good formatting.

[OUTPUT FORMAT]
Return ONLY a JSON object:
{
  "coverLetter": "...",
  "email": "extracted from resume or empty string",
  "phone": "extracted from resume or empty string",
  "linkedin": "extracted from resume or empty string",
  "role": "extracted job title",
  "name": "candidate full name from resume"
}`;
  };
  
  const buildResumeAnalysisPrompt = (relevantChunks, jobDescription) => {
    const resumeContext = relevantChunks
      .map((c, i) => `[Section ${i + 1}]:\n${c.pageContent}`)
      .join('\n\n');
  
    return `You are a professional ATS resume analyzer.
  
  RELEVANT RESUME SECTIONS:
  ${resumeContext}
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  Return ONLY valid JSON (no markdown):
  {
    "job_keywords": [],
    "matched_keywords": [],
    "missing_keywords": [],
    "resume_sections": [],
    "formatting_issues": []
  }`;
  };
  
  module.exports = { buildCoverLetterPrompt, buildResumeAnalysisPrompt };