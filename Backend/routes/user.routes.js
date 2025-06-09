import express from "express"
import { get_all_requests_received, get_all_users_not_frineds, get_user_jwt, Login, Logout, profile, Register, request_accepts, request_declines, request_friend, test , otp_verify} from "../Controller/User.controller.js"
import upload from "../Middleware/multer.js"

import getUser from "../Middleware/getUser.js"

import friend_router from "./friends.routes.js"

import { decrypt_file, receive_File } from "../Controller/file.controller.js"
import { EncryptFile } from "../Controller/EncryptFile.js"
import { DecryptFile } from "../Controller/DecryptFile.js"

const router = express.Router()

router.post("/Register",upload.single("profile_photo"),Register)

router.post("/Login",Login)

router.post("/:username/Verify_Otp",otp_verify)

router.post("/GetUser",getUser,get_user_jwt)

router.post("/Logout",getUser,Logout)

router.get("/get_all_non_friends",getUser,get_all_users_not_frineds)

router.get("/get_all_requests",getUser,get_all_requests_received)

router.get("/request/:user_id",getUser,request_friend)


router.post("/request/:request_id/accept",getUser,request_accepts)
router.post("/request/:request_id/decline",getUser,request_declines)

router.use("/friends",friend_router)

router.get("/AllFiles",getUser,receive_File)

router.get("/AllFiles/:fileId/decrypt",getUser,decrypt_file)


router.get("/Notifications",getUser,get_all_requests_received)

router.get("/profile",getUser,profile)



router.post("/EncryptFile",upload.single("encrypt_file"),getUser,EncryptFile)
router.post("/DecryptFile",upload.single("decrypt_file"),getUser,DecryptFile)

// router.get("/friends/:user2Id/files/share",upload.single("shared_file"),getUser,shareFile)
export default router