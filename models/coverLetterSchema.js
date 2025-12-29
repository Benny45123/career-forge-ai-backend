const mongoose=require('mongoose');
const coverLetterSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    generatedLetter:{
        type:String,
    },
    email:{
        type:String,
    },
    phone:{
        type:String,
    },
    linkedin:{
        type:String,
    },
    role:{
        type:String,
    },
    name:{
        type:String,
    },
    createdAt:{
        type:Date,
        default:Date.now
    }
});
const CoverLetter=mongoose.model('CoverLetter',coverLetterSchema);
module.exports=CoverLetter;