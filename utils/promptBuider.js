// utils/promptBuilder.js

// const buildCoverLetterPrompt = (relevantChunks, jobDescription, skillsFocus, recruiterName, recruiterDesignation, companyName) => {
//     // Assemble context from only the most relevant resume sections
//     const resumeContext = relevantChunks
//       .map((c, i) => `[Resume Section ${i + 1}]:\n${c.pageContent}`)
//       .join('\n\n');
  
//     return `You are a highly experienced HR writer and cover-letter specialist.
  
//   ====================================================================
//   📄 RELEVANT RESUME SECTIONS (retrieved for this job):
//   ${resumeContext}
//   ====================================================================
  
//   💼 JOB DESCRIPTION:
//   ${jobDescription}
//   ====================================================================
  
//   🎯 SKILLS TO HIGHLIGHT (only if in resume):
//   ${skillsFocus}
//   ====================================================================
  
//   👤 RECRUITER: ${recruiterName}, ${recruiterDesignation} at ${companyName}
//   ====================================================================
  
// [WRITING INSTRUCTIONS]
// 1. STRUCTURE:
//    - OPENING: A high-impact "hook" connecting the candidate's background to ${companyName}.
//    - THE CORE (Experience & Projects): In the middle paragraphs, synthesize the candidate's professional experience and key projects. Do not just list them; explain the "how" and "why."
//    - THE EXTRA EDGE: Explicitly highlight how their proficiency in ${skillsFocus}—evidenced by what they have actually built—gives them a competitive advantage for this specific role.
//    - CLOSING: A call to action that focuses on solving the company's problems.

// 2. STYLE & TONE:
//    - Narrative flow: Professional, confident, and achievement-oriented.
//    - Evidence-based: Use metrics, technologies, and specific project names from the source data.
//    - NO symbols: Avoid all special characters like *, #, &, or bullet points. Use plain text only.

// 3. STRICT LIMITS: 
//    - No hallucinations: If a project or metric isn't in the source data, do not invent it.
//    - Word count: 300-400 words.
//    - Salutation: "Dear ${recruiterName || 'Hiring Manager'},"
//    - Sign-off: End exactly with "Sincerely," (no signature, no name).

// [OUTPUT FORMAT]
// Return ONLY a JSON object:
// {
//   "coverLetter": "...",
//   "email": "extracted from resume or empty string",
//   "phone": "extracted from resume or empty string",
//   "linkedin": "extracted from resume or empty string",
//   "role": "extracted job title",
//   "name": "candidate full name from resume"
// }`;
//   };
const buildCoverLetterPrompt = (relevantChunks, jobDescription, skillsFocus, recruiterName, recruiterDesignation, companyName) => {
  const resumeContext = relevantChunks
    .map((c, i) => `[Resume Section ${i + 1}]:\n${c.pageContent}`)
    .join('\n\n');

  return `You are an elite Executive Career Consultant writing a cover letter for a candidate.

====================================================================
📄 SOURCE DATA (RESUME CHUNKS):
${resumeContext}
====================================================================

💼 TARGET ROLE & MISSION:
${jobDescription}
====================================================================

🎯 CORE STACK & FOCUS:
${skillsFocus}
====================================================================

👤 RECRUITER: ${recruiterName}, ${recruiterDesignation} at ${companyName}
====================================================================

[WRITING INSTRUCTIONS]
1. PERSPECTIVE: You MUST write in the FIRST PERSON ("I", "me", "my"). Do not refer to the candidate by name in the body of the letter. 

2. STRUCTURE:
 - OPENING: A high-impact hook. Instead of "I am applying for...", start with a statement about your technical philosophy or how your background in AI/Engineering aligns with ${companyName}'s specific mission.
 - THE CORE (Experience & Projects): Synthesize your professional experience and key projects (like CampusConnect or Gov-Transparency-RAG). Explain the "how" (tech used) and the "why" (the impact/result).
 - THE EXTRA EDGE: Explicitly highlight how your proficiency in ${skillsFocus}—proven by specific systems you have built—solves a problem described in the Job Description.
 - CLOSING: A confident call to action focused on contributing to the team's goals.

3. STYLE & TONE:
 - Voice: Professional, engineering-focused, and confident. 
 - Evidence-based: Use metrics, technologies, and specific project names from the source data.
 - NO symbols: Avoid all special characters like *, #, &, or bullet points. Use plain text only.

4. STRICT LIMITS: 
 - No hallucinations: Only use data provided in the resume chunks.
 - Word count: 300-400 words.
 - Salutation: "Dear ${recruiterName || 'Hiring Manager'},"
 - Sign-off: End exactly with "Sincerely," (no signature, no name).

[OUTPUT FORMAT]
Return ONLY a JSON object:
{
"coverLetter": "...",
"email": "extracted from resume",
"phone": "extracted from resume",
"linkedin": "extracted from resume",
"role": "extracted job title",
"name": "candidate full name from resume"
}`;
};
  
//   const buildResumeAnalysisPrompt = (relevantChunks, jobDescription) => {
//     const resumeContext = relevantChunks
//     .map((c, i) => `[Section ${i + 1}]:\n${c.pageContent}`)
//     .join('\n\n');

//   return `SYSTEM ROLE:
// You are a professional ATS (Applicant Tracking System) resume analyzer.
// Your ONLY job is keyword and section analysis. Nothing else.

// ----------------------------------------------------
// RELEVANT RESUME SECTIONS:
// ${resumeContext}
// ----------------------------------------------------
// JOB DESCRIPTION:
// ${jobDescription}
// ----------------------------------------------------

// YOUR TASKS:

// 1. JOB KEYWORD EXTRACTION
// - Extract the most critical skills, tools, technologies, frameworks, and role terms from the job description.
// - Normalize: "JS" → "javascript", "Node" → "node.js", "Mongo" → "mongodb"
// - Lowercase all keywords.
// - No duplicates. No soft skills unless explicitly required.

// 2. MATCHED KEYWORDS
// - From job keywords, find which ones explicitly appear in the resume sections above.
// - Match case-insensitively.
// - Do NOT infer. Only include if clearly present.

// 3. MISSING KEYWORDS
// - From job keywords, list those NOT found in the resume sections.
// - Do not invent keywords.

// 4. RESUME SECTION DETECTION
// - Detect which of these 4 sections are clearly present:
//   - "summary"
//   - "skills"
//   - "experience"
//   - "education"
// - Only include if clearly identifiable. Never guess.

// ----------------------------------------------------
// STRICT OUTPUT RULES:
// - Return ONLY valid JSON. No markdown. No explanation. No extra keys.
// - All values are arrays of lowercase strings.
// - No null values. Use empty arrays if nothing found.

// OUTPUT FORMAT (EXACT):
// {
//   "job_keywords": [],
//   "matched_keywords": [],
//   "missing_keywords": [],
//   "resume_sections": []
// }`;
//   };
const buildResumeAnalysisPrompt = (resumeContext, jobDescription) => {
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
- Extract critical skills, tools, technologies, frameworks, and role terms from the job description.
- Normalize: "JS" → "javascript", "Node" → "node.js", "Mongo" → "mongodb"
- Lowercase all keywords. No duplicates.

2. MATCHED KEYWORDS
- From job keywords, find which ones explicitly appear in the resume sections above.
- Match case-insensitively. Do NOT infer.

3. MISSING KEYWORDS
- From job keywords, list those NOT found in the resume sections.

4. RESUME SECTION DETECTION
- Detect which of these 6 sections are clearly present:
  - "summary"
  - "skills"
  - "experience"
  - "projects"
  - "certifications"
  - "education"
- Only include the exact string from the list above if that section is clearly identifiable in the provided resume context.

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