import multer from 'multer';
import path from 'path';
import ActivityModel from '../Models/Activity.models.js';
import upload_on_cloudinary from "../utils/cloudinary.js"; // Function for uploading to Cloudinary
import fs from 'fs';

// Multer setup for video file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/videos'); // Store videos in 'uploads/videos' folder
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`); // Unique file name using timestamp
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/webm']; // Allowed video formats
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type, only video files are allowed!'), false);
  }
  cb(null, true);
};

const upload = multer({ storage, fileFilter });

// Controller function for sharing/uploading a video for a specific activity
const uploadVideoForActivity = async (req, res) => {
  const { activityNumber } = req.params; // Get the activity number from the URL
  if (!activityNumber) {
    return res.status(400).json({ "error": "Activity number is required" });
  }

  const videoFile = req.file?.path; // Path of the uploaded file
  if (!videoFile) {
    return res.status(400).json({ "error": "Video file is required" });
  }

  try {
    // Upload the video to Cloudinary
    const cloudUrl = await upload_on_cloudinary(videoFile);
    if (!cloudUrl) {
      return res.status(400).json({ "error": "Error uploading file to Cloudinary" });
    }

    // Extract the poster image URL (thumbnail) from the 'eager' array
    const posterImageUrl = cloudUrl.eager[0]?.url; // Get the video thumbnail URL from Cloudinary

    // Save video and poster image URLs in the database
    const newActivity = new ActivityModel({
      fileUrl: cloudUrl.url, // Cloudinary URL of the uploaded video
      activityNo: activityNumber, // The activity number from the URL
      activityType: "Archimedes", // Default activity type
      file_type: path.extname(videoFile), // File extension (e.g., .mp4)
      poster_image: posterImageUrl, // Poster image URL (thumbnail)
    });

    await newActivity.save();

    // Clean up the local file after uploading to Cloudinary
    fs.promises.unlink(videoFile);

    return res.status(200).json({ "file": newActivity });
  } catch (error) {
    console.error('Error uploading video:', error);
    return res.status(500).json({ "error": "Error during video upload" });
  }
};


const getAllActivities = async (req, res) => {
  try {
    // Fetch all activities from the database
    const activities = await ActivityModel.find({}).sort({ createdAt: -1 }); // Optionally, sort by createdAt to get the most recent first

    if (activities.length === 0) {
      return res.status(404).json({ message: 'No activities found' });
    }

    // Return the activities data
    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ error: 'Server error while fetching activities' });
  }
};


export { upload, uploadVideoForActivity , getAllActivities};
