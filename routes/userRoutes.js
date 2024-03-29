const express = require("express");


const router= express.Router();

const { signup, signin }=require('./../controller/authController')

  // ********* signUp User
router.route( '/signup' ).post(signup)

  // *********** singin User **************
router.route( '/signin' ).post(signin);

  module.exports= router;