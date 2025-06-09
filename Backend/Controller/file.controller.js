import { Friend } from "../Models/Friend.models.js";
import fileencryption from "../utils/fileencryption.js"
import filedecryption from "../utils/filedecryption.js"
import upload_on_cloudinary from "../utils/cloudinary.js";
import { FileModel } from "../Models/File.models.js";
import { scryptSync, createDecipheriv } from "crypto";
import axios from "axios"
import fs from "fs"


const shareFile=async(req,res)=>{
    const user=req.user;
    if(!user){
        return res.status(400).json({"error":"login first to share this file"})
    }
    const {user2Id}= req.params
    if(!user2Id){
        return res.status(400).json({"error":"user id is required"})}
    console.log(user)
    console.log(`user1:- ${user._id}, user2:-${user2Id}`)
    const is_friends = (await Friend.findOne({userId1:user,userId2:user2Id}) || await Friend.findOne({userId1:user2Id,userId2:user}))
    console.log(is_friends)
    if(!is_friends){
        return res.status(400).json({"error":"you want to be a friend to share file"})
    }
    const file_multer_url= req.file?.["path"]
    console.log("multer path")
    console.log(file_multer_url)
    if(!file_multer_url){
        return res.status(400).json({"error":"file is required"})
    }

    //file output url calculation:-- 

    let z=""
    let i=file_multer_url.length - 1
    for (i; i >= 0; i--){
        if (file_multer_url[i]=="."){
            z += file_multer_url.slice(0, i);  
            z+="output"
            break
        }
    }
    console.log(i)
    if(z==""){
        await fs.promises.unlink(file_multer_url);
        return res.status(400).json({"error":"no file extension"});
    }
    const output_encrypted_url=z+"new_file"

    await fileencryption(file_multer_url,output_encrypted_url)
    // await filedecryption(output_encrypted_url,z+"newfile"+file_multer_url.slice(i))
    //upload on cloudinary:--
    const cloud_url = await upload_on_cloudinary(output_encrypted_url)
    console.log(cloud_url)
    // await filedecryption(cloud_url.url,z+"newfile"+file_multer_url.slice(i))
    console.log(cloud_url.url)
    // await filedecryption(cloud_url.url,z+"new+main_file"+file_multer_url.slice(i))

    console.log("uploaded encrypted file to cloudinary")


    // return res.status(200).json({"file":cloud_url})

    if(!cloud_url){
        return res.status({"error":"error in uploading file to cloudinary"})
    }

    const new_file= new FileModel({
        senderId:user._id,
        receiverId:user2Id,
        fileUrl:cloud_url.url,
        fileKey:"0000",
        file_type:file_multer_url.slice(i)
    })
    await new_file.save();
    return res.status(200).json({"file":new_file})
}



const receive_File = async (req, res) => {
    const user = req.user;
    if (!user) {
        return res.status(400).json({ "error": "Login first to share this file" });
    }

    try {
        const new_file = await FileModel.find({ "receiverId": user._id }).populate("senderId")
            .sort({ createdAt: -1 }); // Sorting in descending order (newest first)

        return res.status(200).json({ "file": new_file });
    } catch (error) {
        return res.status(500).json({ "error": "Server error" });
    }
};

const decrypt_file=async(req,res)=>{
    const user=req.user;
    if(!user){
        return res.status(400).json({"error":"login first to share this file"})
    }
    const {fileId}=req.params
    if(!fileId){
        return res.status(400).json({"error":"cannot get file id from url"})
    }
    const get_file=await FileModel.findById(fileId)
    const get_file_url=get_file?.fileUrl

    if(!get_file_url){
        return res.status(400).json({"error":"cannot get file for decryption"})
    }
    
    const outputFilePath="newfile"+get_file.file_type

    try {
        const password = "0000";
        const algorithm = "aes-192-cbc";
        let key = scryptSync(password, "salt", 24);
        let iv = Buffer.alloc(16, 0);
  
        // Fetch file from Cloudinary (as binary)
        const response = await axios.get(get_file_url, { responseType: "arraybuffer" });
        const encryptedBuffer = Buffer.from(response.data);
  
        // Create decipher
        const decipher = createDecipheriv(algorithm, key, iv);
  
        // Decrypt data
        const decryptedBuffer = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);
  
        // Save decrypted file locally
        fs.writeFileSync(outputFilePath, decryptedBuffer);
        console.log(`Decryption complete: ${outputFilePath}`);

      } catch (error) {
        console.error("Decryption failed:", error);
        return res.status(400)}

       if(!outputFilePath){
        return res.sttaus(400).json({"error":"cannot get outfi;e path"})
       }

       const main_file_url= await upload_on_cloudinary(outputFilePath)


       return res.status(200).json({"file":main_file_url})}

export {shareFile, decrypt_file, receive_File }