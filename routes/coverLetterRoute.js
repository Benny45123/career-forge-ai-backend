const express=require("express");
const multer=require("multer");
const {generateCoverLetter,getUserCoverLetters}=require("../controllers/coverLetter.js");
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
router.post("/generate-cover-letter",upload.single('resume'),generateCoverLetter);
router.get("/user/cover-letters",getUserCoverLetters);
module.exports={router};