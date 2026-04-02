const express=require("express");
const multer=require("multer");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const upload = multer({ storage: multer.memoryStorage() });
const {startQuiz,submitAnswer,finishQuiz}=require("../controllers/quizController.js");
const serviceLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, 
    max: 2, 
    message: "Too many generation requests from this IP, please try again after 24 hours"
});
router.post("/generate-quiz",serviceLimiter,upload.single('document'),startQuiz);
router.post("/submit-answer",submitAnswer);
router.post("/finish-quiz",finishQuiz);
module.exports={router};