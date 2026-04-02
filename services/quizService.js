const { buildResumeRetriever } = require('../rag/retreiver');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const generateQuiz = async (resumeText, jobDescription, userId) => {
  let cleanup = null;

  try {
    const { retreiver, cleanup: _cleanup } = await buildResumeRetriever(resumeText, userId);
    cleanup = _cleanup;

    // Retrieve skills AND projects separately
    const skillChunks  = await retreiver("technical skills frameworks tools languages", 4);
    const projectChunks = await retreiver("projects built developed created implemented", 4);
    const expChunks    = await retreiver("work experience responsibilities achievements", 3);

    const seen = new Set();
    const allChunks = [];
    for (const chunk of [...skillChunks, ...projectChunks, ...expChunks]) {
      if (!seen.has(chunk.pageContent)) {
        seen.add(chunk.pageContent);
        allChunks.push(chunk);
      }
    }

    const context = allChunks.map((c, i) => `[Section ${i+1}]:\n${c.pageContent}`).join('\n\n');

    const prompt = `You are a senior technical interviewer.
    
Based ONLY on the resume sections below and the job description, generate exactly 10 interview questions.

RESUME SECTIONS:
${context}

JOB DESCRIPTION:
${jobDescription}

RULES:
- Mix question types: 3 technical (from skills), 4 project-based (from projects), 3 behavioral
- For project questions, reference the actual project name from the resume
- Each question must have a model answer based on the resume
- Difficulty: mix easy (3), medium (4), hard (3)

Return ONLY valid JSON:
{
  "questions": [
    {
      "id": 1,
      "type": "technical | project | behavioral",
      "difficulty": "easy | medium | hard",
      "question": "...",
      "hint": "one line hint",
      "modelAnswer": "ideal answer based on resume"
    }
  ]
}`;

    const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = ai.getGenerativeModel({ model: "gemini-2.5-flash-lite" });
    const response = await model.generateContent(prompt);
    const raw = response.response.text().replace(/```json/g,"").replace(/```/g,"").trim();
    return JSON.parse(raw);

  } finally {
    if (cleanup) await cleanup().catch(console.error);
  }
};

const evaluateAnswer = async (question, userAnswer, modelAnswer) => {
  const prompt = `You are a strict technical interviewer evaluating a candidate's answer.

Question: ${question}
Candidate's answer: ${userAnswer}
Model answer: ${modelAnswer}

Evaluate strictly and return ONLY valid JSON:
{
  "score": <0-10>,
  "feedback": "2-3 sentence specific feedback",
  "strengths": ["what they got right"],
  "improvements": ["what they missed or could improve"],
  "verdict": "strong | acceptable | weak"
}`;

  const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = ai.getGenerativeModel({ model: "gemma-3-1b-it" });
  const response = await model.generateContent(prompt);
  const raw = response.response.text().replace(/```json/g,"").replace(/```/g,"").trim();
  return JSON.parse(raw);
};

module.exports = { generateQuiz, evaluateAnswer };