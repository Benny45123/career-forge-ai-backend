const { buildResumeRetriever } = require('../rag/retreiver.js'); // Your existing RAG logic
const axios = require('axios');
const {GoogleGenerativeAIEmbeddings}=require('@langchain/google-genai')
const { TaskType } = require('@google/generative-ai');
const queryEmbedder = new GoogleGenerativeAIEmbeddings({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-embedding-001",
  taskType: TaskType.RETRIEVAL_QUERY,
});
const cosineSim = (a, b) => {
  const dot = a.reduce((s, v, i) => s + v * b[i], 0);
  const mA = Math.sqrt(a.reduce((s, v) => s + v * v, 0));
  const mB = Math.sqrt(b.reduce((s, v) => s + v * v, 0));
  return dot / (mA * mB);
};

const fetchAndRankJobs = async (resumeText, targetRole, userId) => {
  let cleanup = null;
  try {
    // 1. Initialize your existing RAG tool
    const { retreiver, cleanup: _cleanup } = await buildResumeRetriever(resumeText, userId);
    cleanup = _cleanup;

    // 2. Fetch Jobs (Using Serper or SerpApi)
    const platforms = '(site:linkedin.com/jobs OR site:unstop.com/jobs OR site:wellfound.com/jobs)';
    const excludedKeywords = '-"no longer accepting" -"position closed" -"expired" -"filled"';
    const searchQuery = `${platforms} "${targetRole}" "Remote" ${excludedKeywords}`;

    const response = await axios.get('https://serpapi.com/search', {
      params: { 
        q: searchQuery, 
        api_key: process.env.SERP_API_KEY, 
        num: 20, 
        tbs: "qdr:w" // Keeps results fresh (past 7 days)
      }
    });

    const organicResults = response.data.organic_results || [];

    const scoredJobs = await Promise.all(
      organicResults.map(async (result) => {
        const jobTitle = result.title;
        const rawSnippet = result.snippet || '';
        const lowerSnippet = rawSnippet.toLowerCase();
        
        // Expiry filter to save embedding costs
        if (lowerSnippet.includes("no longer accepting") || lowerSnippet.includes("expired")) return null;

        // 2. RAG Analysis & Semantic Ranking
        const relevantChunks = await retreiver(`${jobTitle} ${rawSnippet}`, 5);
        const resumeContext = relevantChunks.map(c => c.pageContent).join(" ");

        const [resumeVec, jobVec] = await Promise.all([
          queryEmbedder.embedQuery(resumeContext),
          queryEmbedder.embedQuery(`${jobTitle} ${rawSnippet}`)
        ]);
        
        const score = Math.round(cosineSim(resumeVec, jobVec) * 100);

        // 3. Platform-Specific Extraction
        const isUnstop = result.link.includes('unstop.com');
        const isWellfound = result.link.includes('wellfound.com');

        // Extracting company name more accurately for these platforms
        let companyName = "Direct Hire";
        if (isUnstop) {
            // Unstop titles usually look like "Job Title in [City] at [Company]"
            const match = jobTitle.match(/at\s+([^|]+)/i);
            companyName = match ? match[1].trim() : "Unstop Partner";
        } else if (isWellfound) {
            // Wellfound titles usually look like "[Company] hiring [Role]"
            companyName = jobTitle.split('hiring')[0].trim();
        } else {
            const match = jobTitle.match(/(?:at|hiring)\s+([^|-]+)/i);
            companyName = match ? match[1].trim() : "LinkedIn Partner";
        }

        const skillList = ["React", "Node.js", "Python", "GenAI", "LLM", "RAG", "MLOps", "Azure", "Docker", "Next.js", "LangGraph"];
        const detectedSkills = skillList.filter(skill => 
          lowerSnippet.includes(skill.toLowerCase()) || jobTitle.toLowerCase().includes(skill.toLowerCase())
        );

        return {
          title: jobTitle.split(/[-|]|hiring/)[0].trim(),
          company: companyName,
          applyUrl: result.link,
          matchScore: score,
          snippet: rawSnippet,
          location: lowerSnippet.includes('remote') ? 'Remote' : 'Remote / Hybrid',
          postedAt: result.date || 'New',
          logo: result.favicon,
          skills: detectedSkills.slice(0, 4),
          source: isUnstop ? 'Unstop' : (isWellfound ? 'Wellfound' : 'LinkedIn'),
          matchReason: score > 80 ? "Perfect technical match" : "Good requirement overlap"
        };
      })
    );
    console.log("Scored Jobs",scoredJobs);

    const activeScoredJobs = scoredJobs
      .filter(job => job !== null)
      .sort((a, b) => b.matchScore - a.matchScore);
    console.log(`Fetched ${activeScoredJobs.length} active jobs after filtering.`);

    return { jobs: activeScoredJobs };
  } catch (error) {
    console.error('Ranking Error:', error);
    throw error;
  } finally {
    if (cleanup) cleanup();
  }
};

module.exports = { fetchAndRankJobs };
