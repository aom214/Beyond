import { Friend } from "../Models/Friend.models.js";
import { User } from "../Models/User.models.js";
const view_friends= async(req,res)=>{
    const curr_user=req.user;
    if(!curr_user){
        return res.status(400).json({"error":"you need to login first to access this"})
    }
    const curr_user_friends = await Friend.find({
        $or: [
            { userId1: curr_user._id },
            { userId2: curr_user._id }
        ]
    })
    .populate("userId1 userId2")
    .lean();
    
    // Extract friend details
    const friendsData = curr_user_friends.map(friend =>
        friend.userId1._id.toString() === curr_user._id.toString() ? friend.userId2 : friend.userId1
    );
    
    console.log(friendsData); // List of full friend objects
    
    
    return res.status(200).json({"friends":friendsData})
}

export {view_friends}