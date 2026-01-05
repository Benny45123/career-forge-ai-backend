const User =require('../models/userSchema');
const crypto=require('crypto');
const OTPVerify=require('../models/OTPVerificationSchema');
const nodemailer=require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
const { error } = require('console');
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;
const transporter=nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.APP_EMAIL,
        pass:process.env.EMAIL_PASS
    }
});
const registerUser=async(req,res)=>{
    const {name,email,password}=req.body;
    if(!name||!email||!password){
        return res.status(400).json({message:"Please fill all the fields"});
    }
    const restExisting=await User.findOne({email});
    if(restExisting){
        return res.status(400).json({message:"User already exists"});
    }
    const hashedPassword=await bcrypt.hash(password,12);
    const newUser=new User({
        name:name,email:email,password:hashedPassword,verified:false
    });
    newUser.save().then((result)=>{
        SendOtp({userId:result._id,name,email,res})
        // res.status(201).json({message:"User registered successfully"});
}).catch((err)=>{
    return res.status(500).json({message:"Something went wrong"});
});
}
const loginUser=async(req,res)=>{
    const {email,password}=req.body;
    if(!email||!password){
        return res.status(400).json({message:"Please fill all the fields"});
    }
    const isUser=await User.findOne({email});
    if(!isUser){
        return res.status(400).json({message:"User does not exist"});
    }
    const isPasswordCorrect=await bcrypt.compare(password,isUser.password);
    if(!isPasswordCorrect){
        return res.status(400).json({message:"Invalid credentials"});
    }
    const token=jwt.sign({id:isUser._id,name:isUser.name,email:isUser.email},SECRET_KEY,{expiresIn:"2h"});
    // res.status(200).json({token,user: {id:User._id,name:User.name,email:User.email}});
    res.cookie('token',String(token),{
        httpOnly:true,
        sameSite:"none",
        secure:true,
        maxAge:2*60*60*1000,
    });
    res.status(200).json({message:"Login successful"});
}
const authenticateToken=(req,res,next)=>{
    // const authHeader=req.headers['authorization'];
    // const token=authHeader && authHeader.split(' ')[1];
    const token=req.cookies.token;
    if(!token){
        return res.status(401).json({message:"Access denied (no token provided)"});
    }
    try{
        const decoded=jwt.verify(token,SECRET_KEY);
        req.user=decoded;
        next();
    }
    catch(err){
        return res.status(403).json({message:"Invalid token"});
    }
}
const userSearch=async (id)=>{
    const user=await User.findById(id).select('-password');
    return user;
}
const SendOtp=async ({userId,user,email,res})=>{
    try{
    if(!email){
        res.status(404).json({message:"User not found"});
    }
    const otp=crypto.randomInt(100000,999999).toString();
    const hashedOtp=await bcrypt.hash(otp,12);
    const otpRecord=new OTPVerify({
        userId,
        otp: hashedOtp,
        createdAt:Date.now(),
        expiresAt:Date.now()+(6*60*1000),//6 minutes
    })
    await otpRecord.save();
    await transporter.sendMail({
        from: `Career-Forge-AI <${process.env.APP_EMAIL}`,
        to: email,
        subject: "Your OTP Verification code for Career-Forge-AI SignUp",
        html:`
        <h2>Thank You for using our app Career-Forge-AI</h2>
        <p>Your OTP is :</p>
        <h1>${otp}</h1>
        <p>Valid For only 5 minutes</p>
        `,
    });
    res.json({status:"Pending..",message:"Sent OTP to mail",data:{email,user}});
}
catch(err){
    res.json({err,status:"Failed.."})
    console.log("error",err);

}
}
const verifyOTP=async (req,res)=>{
    try{
    const {userId,otp}=req.body;
    if(!userId || !otp){
        throw new error("Empty details are not allowed");
    }
    else{
        const userOTPRecords=await OTPVerify.find({userId});
        if(userOTPRecords.length<=0){
            res.status(404).json("OTPS not found");
        }
        else{
            const {expiresAt}=userOTPRecords[0];
            const hashedOtp=userOTPRecords[0].otp;
            if (expiresAt<=Date.now()){
                await OTPVerify.deleteMany({userId});
                throw new Error("Otp is expired");
            }
            else{
                const validOtp=await bcrypt.compare(otp,hashedOtp);
                if(!validOtp){
                    throw new Error("Invalid Otp  try again ..")
                }
                await User.findByIdAndUpdate(userId,{verified:true});
                await OTPVerify.deleteMany({userId});
                res.status(201).json({Message:"User Authenticated success"});
            }
            
        }
    }
}
catch (err){
    console.log("Error",err);
    res.status(500).json("Error",err);
}
}
module.exports={registerUser,loginUser,authenticateToken,userSearch,verifyOTP};