const mongoose = require("mongoose");
const resumeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    atsScore: {
        type: String,
        required: true 
    },
    responseConfidence:{
        type: String,
        required: true
    },
    missing_keywords: {
        type: [String],
        required: true
    },
    resumeText: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});
const Resume = mongoose.model("Resume", resumeSchema);
module.exports = Resume;