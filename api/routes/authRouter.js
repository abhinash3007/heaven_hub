const express=require("express");
const { signup, signin,google,signOut } = require("../controllers/authController");
const route=express.Router();

route.post("/signup",signup);
route.post("/signin", signin);
route.post("/google", google);
route.get("/signout", signOut);


module.exports=route;