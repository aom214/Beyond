import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  fileUrl: {
    type: String,
    required: true,
  },
  activityNo: {
    type: Number,
    required: true,
  },
  activityType: {
    type: String,
    required: true,
    default: "Archimedes", // Default activity type is "Archimedes"
  },
  file_type: {
    type: String,
    required: true,
  },
  poster_image:{
    type:String,
    required:false
  }
}, { timestamps: true });

const ActivityModel = mongoose.model("Activity", ActivitySchema);
export default ActivityModel;
