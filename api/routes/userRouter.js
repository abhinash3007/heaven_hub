const express=require("express");
const { updateUserInfo,deleteUser,getUserListing,getUser} = require("../controllers/userController");
const route=express.Router();
const { verifyToken } = require("../utils/verifyUser");

route.get("/test",(req,res)=>{
    res.send("hello world");
});
route.post("/update/:id",verifyToken, updateUserInfo);
route.delete("/delete/:id",verifyToken, deleteUser);
route.get('/listings/:id',verifyToken,getUserListing);
route.get('/:id',verifyToken,getUser);

module.exports=route;