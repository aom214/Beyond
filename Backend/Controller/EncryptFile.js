import { Friend } from "../Models/Friend.models.js";
import fileencryption from "../utils/fileencryption.js"
import filedecryption from "../utils/filedecryption.js"
import upload_on_cloudinary from "../utils/cloudinary.js";
import { FileModel } from "../Models/File.models.js";
import { scryptSync, createDecipheriv } from "crypto";
import axios from "axios"
import fs from "fs"


const EncryptFile=async(req,res)=>{

    const {algo,key}=req.body
    console.log(algo,key)
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

export {EncryptFile}