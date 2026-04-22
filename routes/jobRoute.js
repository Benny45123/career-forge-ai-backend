const express=require("express");
const multer=require("multer");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const upload = multer({ storage: multer.memoryStorage() });
const {getJobRecommendations}=require("../controllers/jobController.js");
const serviceLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, 
    max: 1, 
    message: "Too many generation requests from this IP, please try again after 24 hours"
});
router.post("/recommend-jobs",serviceLimiter,upload.single('resume'),getJobRecommendations);
module.exports={router};