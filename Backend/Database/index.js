import mongoose from "mongoose"
const db_connect = async()=>{
    try {
        const mongoURL=`mongodb+srv://aomk:Aom11122002@beyondbox.xgv5f4l.mongodb.net/?retryWrites=true&w=majority&appName=BeyondBox`
        const connection=await mongoose.connect(mongoURL);
        console.log("MongoDB Connected...");
    } catch (error) {
        console.log("get error:- ", error.message);
        process.exit(1);
    }
}
export default db_connect