const pdfParse = require('pdf-parse');
const { fetchAndRankJobs } = require('../services/jobService');

const getJobRecommendations = async (req, res) => {
  try {
    const resumeData = await pdfParse(req.file.buffer);
    const { targetRole } = req.body; // e.g. "React Developer"
    const userId = req.user.id;
    const jobs = await fetchAndRankJobs(resumeData.text, targetRole,userId);
    res.status(200).json({ jobs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
};

module.exports = { getJobRecommendations };