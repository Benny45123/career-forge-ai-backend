const express=require("express");
const multer=require("multer");
const {generateCoverLetter,getUserCoverLetters}=require("../controllers/coverLetter.js");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const upload = multer({ storage: multer.memoryStorage() });
const serviceLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, 
    max: 3, 
    message: "Too many generation requests from this IP, please try again after 2 hours"
});
router.post("/generate-cover-letter",serviceLimiter,upload.single('resume'),generateCoverLetter);
router.get("/user/cover-letters",getUserCoverLetters);
module.exports={router};