import mongoose from "mongoose"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
const User_Schema=new mongoose.Schema({
    firstName:{
        type:String,
        trim:true,
        maxlength:20,
        minlength:2,
        required:[true,"firstname is required"]
    },
    lastName:{
        type:String,
        trim:true,
        maxlength:20,
        minlength:2,
        required:[true,"lastname is required"]
    },
    email:{
        type:String,
        trim:true,
        unique:true,
        match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
        required:true
    },
    username:{
        type:String,
        trim:true,
        minlength:[4,"username should contains min 4 characters"],
        maxlength:[15,"username should contains min 4 characters"],
        unique:[true,"must be unique"],
        required:[true,"username is required"]
    },
    password:{
        type:String,
        minlength:[8,"must be of min 8 characters"],
        required:[true,"password must be required"],
    },
    profilePhoto:{
        type:String,
        required:false,
    },
    refreshToken:{
        type:String,
        required:false
    },
    accessToken:{
        type:String,
        required:false
    },
    authenticated_otp: {
        type: Boolean,
        default: false
      },
})

User_Schema.methods.GenerateAccessToken=async function(){
    try {
        const token = await new Promise((resolve, reject) => {
            jwt.sign({id:this._id,username:this.username,email:this.email}, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }, (err, token) => {
            if (err) reject(err);
              resolve(token);
            });
        });
        return token;
    } catch (error) {
        console.log("jwt_access_token_error:- "+error.message)
        throw error
    }
}
User_Schema.methods.GenerateRefreshToken=async function(){
    try {
        console.log(process.env.REFRESH_TOKEN_EXPIRY)
        const token = await new Promise((resolve, reject) => {
            jwt.sign({id:this._id}, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }, (err, token) => {
            if (err) reject(err);
              resolve(token);
            });
        });
        return token;
    } catch (error) {
        console.log("jwt_refresh_token_error:- "+error.message)
        throw error
    }
}

User_Schema.methods.is_password_correct=async function(pass){
    const is_true = await bcrypt.compare(pass,this.password)
    return is_true
}

User_Schema.pre("save",async function(next){
    try {
        if (!this.isModified("password")) return next();
        const salt_rounds=parseInt(process.env.SALT_ROUNDS)
        this.password=await bcrypt.hash(this.password,salt_rounds)
        next();
    } catch (error) {
        return next(error)
    }
})
export const User=mongoose.model("User",User_Schema)