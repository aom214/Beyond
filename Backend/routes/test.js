import express from "express";
const router=express.Router({mergeParams:true})
router.get("/test",(req,res)=>{
    const fullUrl = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
    res.send(`Full URL: ${fullUrl}`);
})

export default router