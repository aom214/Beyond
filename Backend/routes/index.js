import express from "express"
import testrouter from "./test.js"
import userrouter from "./user.routes.js"
const router=express.Router({ mergeParams: true })

router.use("/t1",testrouter)
router.use("/user",userrouter)

export default router