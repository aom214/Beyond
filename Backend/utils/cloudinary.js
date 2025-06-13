import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises';

const upload_on_cloudinary = async (file_url, resourceType = "auto") => {
  try {
    // Cloudinary configuration
    cloudinary.config({
      cloud_name: process.env.CLOUD_NAME,
      api_key: process.env.API_KEY,
      api_secret: process.env.API_SECRET,
    });

    if (!file_url) throw new Error("File path is required");

    const uploadOptions = {
      resource_type: resourceType, // dynamic resource type
      public_id: `uploads/${Date.now()}`
    };

    // If it's video, also generate eager thumbnail
    if (resourceType === "video") {
      uploadOptions.eager = [{ width: 320, height: 180, crop: "fit" }];
    }

    const uploadResult = await cloudinary.uploader.upload(file_url, uploadOptions);

    return uploadResult;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    return null;
  }
};

export default upload_on_cloudinary;
