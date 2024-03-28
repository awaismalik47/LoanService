const express = require("express");
const router = express.Router();
const { signup,}=require('./../controller/authController')
  // ********* signUp User
  router.post('/signup',signup);