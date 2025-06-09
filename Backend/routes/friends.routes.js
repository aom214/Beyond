import express from "express"
import { view_friends } from "../Controller/friend.controller.js"
import getUser from "../Middleware/getUser.js"
import { shareFile } from "../Controller/file.controller.js"
import upload from "../Middleware/multer.js"
const router=express.Router({ mergeParams: true })

router.get("/",getUser,view_friends)

router.post("/:user2Id/files/share",upload.single("shared_file"),getUser,shareFile)

export default router