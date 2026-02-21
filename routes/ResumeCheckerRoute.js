const express=require("express");
const multer=require("multer");
const {analyzeResume,getAllResumes}=require("../controllers/resumeAnalyzer.js");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const upload = multer({ storage: multer.memoryStorage() });
const serviceLimiter = rateLimit({
    windowMs: 2 * 60 * 60 * 1000, // 2 hours
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many generation requests from this IP, please try again after 2 hours"
});
router.post("/analyze-resume",serviceLimiter,upload.single('resume'),analyzeResume);
router.get("/user/resumes",getAllResumes);
module.exports={router};
