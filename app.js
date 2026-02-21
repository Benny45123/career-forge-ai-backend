const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require( "dotenv");
const { registerUser, loginUser ,authenticateToken,userSearch,verifyOTP,resendOtp} = require("./services/Authentication.js");
const app = express();
const cookieParser=require('cookie-parser');
const coverLetterRoute = require("./routes/coverLetterRoute.js");
const resumeRoute = require("./routes/ResumeCheckerRoute.js");
const rateLimit = require("express-rate-limit");
app.use(express.json());
dotenv.config();
app.use(cors({
    origin : ['https://careerforge-ai-next.vercel.app','https://careerforge-ai-next-git-main-beazawada-bennyhinns-projects.vercel.app','https://careerforge-ai-next-nlqbubr0b-beazawada-bennyhinns-projects.vercel.app'],
    methods:['GET','POST'],
    credentials:true
}));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI).then(console.log("Connected to MongoDB")).catch((err) => console.log(err));

const authlimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // limit each IP to 10 requests per windowMs
    message: "Too many auth requests from this IP, please try again after 15 minutes"
});
app.set('trust proxy', 1); // trust first proxy

app.post('/api/register',registerUser);
app.post('/api/login',authlimiter,loginUser);
app.post('/api/verify-otp',verifyOTP);
app.post('/api/resend-otp',resendOtp);
app.use(authenticateToken);
app.use('/api/cover-letter',coverLetterRoute.router);
app.use('/api/resume/',resumeRoute.router);
app.get('/api/user',async (req,res)=>{
    try{
    const userId=req.user.id;
    const user=await userSearch(userId);
    res.status(200).json({user:{id:user._id,name:user.name,email:user.email}});
    }
    catch(err){
        res.status(500).json({message:"Something went wrong"});
    }
    
});
app.post('/api/logout',(req,res)=>{
    res.clearCookie('token',{
        httpOnly:true,
        sameSite:"none",
        secure:true,
    });
    res.status(200).json({message:"Logout successful"});
})
app.get('/api',(req, res) => {
    res.send('API is running...');
})
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});