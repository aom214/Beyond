import mongoose from "mongoose"
import bcrypt from "bcryptjs"
const FileSchema = new mongoose.Schema({
    senderId:{type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receiverId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    fileUrl:{
        type:String,
        required:true 
    },
    fileKey:{
        type:String,
        required:true 
    },
    open:{
        type:Boolean,
        default:false,
        required:true
    },
    file_type:{
        type:String,
        required:true,
    }
},{"timestamps":true})


FileSchema.pre("save",async function(next){
    try {
        if (!this.isModified("filekey")) return next();
        const salt_rounds=parseInt(process.env.SALT_ROUNDS)
        this.password=await bcrypt.hash(this.password,salt_rounds)
        next();
    } catch (error) {
        return next(error)
    }
})



export const FileModel=mongoose.model("File",FileSchema)


