import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },
  topic: {
    type: String,
    required: true,
    enum: ["Archimedes", "MarieCurie", "Tesla", "Einstein"], // You can expand this list easily
  },
  activityType: {
    type: String,
    required: true,
    enum: ["photo", "video"], // Valid values: photo or video
  },
  activityNo: {
    type: Number,
    required: true,
  },
  fileUrl: {
    type: String,
    required: true,
  },
  posterImage: {  // more conventional to camelCase in JS
    type: String,
    required: function() { return this.activityType === "video"; }, // Only required for videos
  }
}, { timestamps: true });

const ActivityModel = mongoose.model("Activity", ActivitySchema);
export default ActivityModel;
