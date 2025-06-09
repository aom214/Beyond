import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

const upload_on_cloudinary = async (file_url) => {
  try {
    // Cloudinary configuration
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    if (!file_url) throw new Error("File path is required");

    // Upload the video to Cloudinary and generate a thumbnail using the 'eager' parameter
    const uploadResult = await cloudinary.uploader.upload(file_url, {
      resource_type: "video", // Uploading a video file
      public_id: `uploads/${Date.now()}`, // Unique public ID for the video
      eager: [{ width: 320, height: 180, crop: "fit" }] // Generate a thumbnail during upload
    });

    // Return the upload result (which includes the video URL and public_id)
    return uploadResult;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export default upload_on_cloudinary;
