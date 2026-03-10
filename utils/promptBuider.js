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

  return `SYSTEM ROLE:
You are a professional ATS (Applicant Tracking System) resume analyzer.
Your ONLY job is keyword and section analysis. Nothing else.

----------------------------------------------------
RELEVANT RESUME SECTIONS:
${resumeContext}
----------------------------------------------------
JOB DESCRIPTION:
${jobDescription}
----------------------------------------------------

YOUR TASKS:

1. JOB KEYWORD EXTRACTION
- Extract the most critical skills, tools, technologies, frameworks, and role terms from the job description.
- Normalize: "JS" → "javascript", "Node" → "node.js", "Mongo" → "mongodb"
- Lowercase all keywords.
- No duplicates. No soft skills unless explicitly required.

2. MATCHED KEYWORDS
- From job keywords, find which ones explicitly appear in the resume sections above.
- Match case-insensitively.
- Do NOT infer. Only include if clearly present.

3. MISSING KEYWORDS
- From job keywords, list those NOT found in the resume sections.
- Do not invent keywords.

4. RESUME SECTION DETECTION
- Detect which of these 4 sections are clearly present:
  - "summary"
  - "skills"
  - "experience"
  - "education"
- Only include if clearly identifiable. Never guess.

----------------------------------------------------
STRICT OUTPUT RULES:
- Return ONLY valid JSON. No markdown. No explanation. No extra keys.
- All values are arrays of lowercase strings.
- No null values. Use empty arrays if nothing found.

OUTPUT FORMAT (EXACT):
{
  "job_keywords": [],
  "matched_keywords": [],
  "missing_keywords": [],
  "resume_sections": []
}`;
  };
  
  module.exports = { buildCoverLetterPrompt, buildResumeAnalysisPrompt };