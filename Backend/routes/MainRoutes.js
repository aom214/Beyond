import express from "express";
import { upload } from "../Middleware/multer.js";
import { 
  uploadImageForActivity, 
  uploadVideoForActivity,
  getAllVideosByTopic, 
  getAllImagesByTopic,
  checkActivitySubmissionStatus// <-- ✅ import the new controller here
} from "../Controller/Activity.controller.js";

const router = express.Router();

router.post('/:userId/:topic/:activityNo/Image', upload.single('file'), uploadImageForActivity);
router.post('/:userId/:topic/:activityNo/Video', upload.single('file'), uploadVideoForActivity);
router.get('/:topic/Video', getAllVideosByTopic);
router.get('/:topic/Image', getAllImagesByTopic);

// ✅ Add your new GET route
router.get('/:userId/:topic/:activityNo', checkActivitySubmissionStatus);

export default router;
