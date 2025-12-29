const User =require('../models/userSchema');
const bcrypt = require('bcryptjs');
const jwt=require('jsonwebtoken');
require('dotenv').config();
const SECRET_KEY=process.env.SECRET_KEY;
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
        name:name,email:email,password:hashedPassword
    });
    newUser.save().then(()=>{
        res.status(201).json({message:"User registered successfully"});
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
module.exports={registerUser,loginUser,authenticateToken,userSearch};