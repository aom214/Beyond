import mongoose from "mongoose";
const notificationSchema = mongoose.Schema({
    sender:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    receivers:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true
    },
    file:{
        type:Boolean,
        required:true
    }
},{timestamps:true})

export const Notification = mongoose.model("Notification",notificationSchema)