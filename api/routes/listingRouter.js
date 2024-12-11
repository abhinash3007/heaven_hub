const express=require('express');
const {createListing,deleteListing,updateListing,getListing,getListings}=require('../controllers/listingController');
const {veifyToken}=require('../utils/verifyUser')
const route=express.Router();

route.post('/create',veifyToken , createListing);
route.delete('/delete/:id',veifyToken , deleteListing);
route.post('/update/:id',veifyToken , updateListing);
route.get('/get/:id' , getListing);
route.get('/get' , getListings);

module.exports=route;