import multer from 'multer';
import path from 'path';
import ActivityModel from '../Models/Activity.models.js';
import upload_on_cloudinary from "../utils/cloudinary.js";
import fs from 'fs';

const allowedTopics = ["Archimedes", "Marie Curie", "Tesla", "Einstein"];
const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
const allowedVideoTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/webm'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join('uploads', 'temp');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

// 🧩 Multer filters (separate for image and video)
const videoFilter = (req, file, cb) => {
  const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/webm'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type, only video files are allowed!'), false);
  }
  cb(null, true);
};

const imageFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.mimetype)) {
    return cb(new Error('Invalid file type, only image files are allowed!'), false);
  }
  cb(null, true);
};

// Expose two different uploaders
const uploadVideo = multer({ storage, fileFilter: videoFilter });
const uploadImage = multer({ storage, fileFilter: imageFilter });
const checkActivitySubmissionStatus = async (req, res) => {
  try {
    const { userId, topic, activityNo } = req.params;

    if (!userId || !topic || !activityNo) {
      return res.status(400).json({ error: "Missing required parameters (userId, topic, activityNo)" });
    }

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({ error: `Invalid topic '${topic}'. Valid topics: ${allowedTopics.join(", ")}` });
    }

    // Check for both image and video
    const photo = await ActivityModel.findOne({ userId, topic, activityNo, activityType: 'photo' });
    const video = await ActivityModel.findOne({ userId, topic, activityNo, activityType: 'video' });

    const submitted = photo !== null || video !== null;

    res.status(200).json({
      submitted,
      details: {
        photoSubmitted: photo !== null,
        videoSubmitted: video !== null
      }
    });

  } catch (error) {
    console.error('Error checking activity submission:', error);
    res.status(500).json({ error: "Internal server error during activity check" });
  }
};

const uploadImageForActivity = async (req, res) => {
  try {
    const { userId, topic, activityNo } = req.params;
    console.log(userId)
    if (!userId || !topic || !activityNo) {
      return res.status(400).json({ error: "Missing required parameters (userId, topic, activityNo)" });
    }

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({ error: `Invalid topic '${topic}'. Valid topics: ${allowedTopics.join(", ")}` });
    }

    // Check if activity already exists
    const existingActivity = await ActivityModel.findOne({
      userId,
      topic,
      activityNo,
      activityType: 'photo'
    });

    if (existingActivity) {
      return res.status(400).json({ error: "Image for this activity number and topic already exists." });
    }

    const imageFile = req.file?.path;
    const mimeType = req.file?.mimetype;

    if (!imageFile) {
      return res.status(400).json({ error: "Image file is required" });
    }

    if (!allowedImageTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type. Please upload a valid image (jpg, png, webp)." });
    }

    const cloudUrl = await upload_on_cloudinary(imageFile, 'image');
    if (!cloudUrl) {
      return res.status(500).json({ error: "Error uploading image to Cloudinary" });
    }

    const newActivity = new ActivityModel({
      userId,
      topic,
      activityNo,
      activityType: 'photo',
      fileUrl: cloudUrl.url,
    });

    await newActivity.save();
    fs.promises.unlink(imageFile);
    res.status(200).json({ message: "Image uploaded successfully", data: newActivity });

  } catch (error) {
    console.error('Error uploading image:', error);
    res.status(500).json({ error: "Internal server error during image upload" });
  }
};
const uploadVideoForActivity = async (req, res) => {
  try {
    const { userId, topic, activityNo } = req.params;

    console.log(userId)

    if (!userId || !topic || !activityNo) {
      return res.status(400).json({ error: "Missing required parameters (userId, topic, activityNo)" });
    }

    if (!allowedTopics.includes(topic)) {
      return res.status(400).json({ error: `Invalid topic '${topic}'. Valid topics: ${allowedTopics.join(", ")}` });
    }

    // Check if activity already exists
    const existingActivity = await ActivityModel.findOne({
      userId,
      topic,
      activityNo,
      activityType: 'video'
    });

    if (existingActivity) {
      return res.status(400).json({ error: `Video for this activity number and topic already exists. ${userId}` });
    }

    const videoFile = req.file?.path;
    const mimeType = req.file?.mimetype;

    if (!videoFile) {
      return res.status(400).json({ error: "Video file is required" });
    }

    if (!allowedVideoTypes.includes(mimeType)) {
      return res.status(400).json({ error: "Invalid file type. Please upload a valid video (mp4, mkv, avi, webm)." });
    }

    const cloudUrl = await upload_on_cloudinary(videoFile, 'video');
    if (!cloudUrl) {
      return res.status(500).json({ error: "Error uploading video to Cloudinary" });
    }


    const posterImageUrl = cloudUrl.eager?.[0]?.url || null;

    const newActivity = new ActivityModel({
      userId,
      topic,
      activityNo,
      activityType: 'video',
      fileUrl: cloudUrl.url,
      posterImage: posterImageUrl
    });

    await newActivity.save();
    fs.promises.unlink(videoFile);
    res.status(200).json({ message: "Video uploaded successfully", data: newActivity });

  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: "Internal server error during video upload" });
  }
};



// 🧩 GET: Fetch all videos by topic
const getAllVideosByTopic = async (req, res) => {
  const { topic } = req.params;
  try {
    const activities = await ActivityModel.find({ topic, activityType: "video" })
      .select("activityNo fileUrl posterImage");

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({ error: "Error fetching videos" });
  }
};

// 🧩 GET: Fetch all images by topic
const getAllImagesByTopic = async (req, res) => {
  const { topic } = req.params;
  try {
    const activities = await ActivityModel.find({ topic, activityType: "photo" })
      .select("activityNo fileUrl");

    res.status(200).json({ activities });
  } catch (error) {
    console.error('Error fetching images:', error);
    res.status(500).json({ error: "Error fetching images" });
  }
};

export {
  uploadVideo, uploadImage,
  uploadImageForActivity, uploadVideoForActivity,
  getAllVideosByTopic, getAllImagesByTopic,
  checkActivitySubmissionStatus
};
