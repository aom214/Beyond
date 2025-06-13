import express from "express";
import { upload } from "../Middleware/multer.js";
import { 
  uploadImageForActivity, 
  uploadVideoForActivity,
  getAllVideosByTopic, 
  getAllImagesByTopic 
} from "../Controller/Activity.controller.js";

const router = express.Router();

router.post('/:userId/:topic/:activityNo/Image', upload.single('file'), uploadImageForActivity);
router.post('/:userId/:topic/:activityNo/Video', upload.single('file'), uploadVideoForActivity);
router.get('/:userId/:topic/Video', getAllVideosByTopic);
router.get('/:userId/:topic/Image', getAllImagesByTopic);

export default router;
