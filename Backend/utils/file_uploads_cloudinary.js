import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";
import path from "path"; 
import streamifier from "streamifier";

const file_uploads_cloudinary = async (file_url) => {
  try {
    // ✅ Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    if (!file_url) throw new Error("❌ File path is required");

    // ✅ Allowed File Types
    const allowedExtensions = [".pdf", ".doc", ".docx", ".txt"];
    const fileExtension = path.extname(file_url).toLowerCase();
    if (!allowedExtensions.includes(fileExtension)) {
      throw new Error(`❌ Unsupported file type: ${fileExtension}. Only ${allowedExtensions.join(", ")} are allowed.`);
    }

    const publicId = `uploads/${Date.now()}${fileExtension}`;

    // ✅ Ensure File Exists
    try {
      await fs.access(file_url);
    } catch (err) {
      throw new Error(`❌ File does not exist: ${file_url}`);
    }

    // ✅ Read File as Buffer
    const fileBuffer = await fs.readFile(file_url);

    // ✅ Upload to Cloudinary as a Stream
    const uploadStream = () => {
      return new Promise((resolve, reject) => {
        let stream = cloudinary.uploader.upload_stream(
          { 
            resource_type: "raw",
            public_id: publicId,
            type: "upload",
            overwrite: true,
            flags: "attachment", // ✅ Ensures download instead of preview
            secure: true // ✅ Forces HTTPS
          },
          (error, result) => {
            if (error) {
              console.error("❌ Cloudinary Upload Failed:", error);
              reject(error);
            } else {
              console.log("✅ Cloudinary Upload Success:", result.secure_url);
              resolve(result.secure_url);
            }
          }
        );
        streamifier.createReadStream(fileBuffer).pipe(stream);
      });
    };

    const uploadedUrl = await uploadStream();
    console.log("✅ Uploaded File URL:", uploadedUrl);

    return { secure_url: uploadedUrl };

  } catch (error) {
    console.error("❌ Cloudinary Upload Error:", error.message || error);
    return null;
  }
};

export default file_uploads_cloudinary;
