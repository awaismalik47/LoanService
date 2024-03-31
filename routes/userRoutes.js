const express = require("express");


const router= express.Router();

const { signup, signin, forgetPassword, resetPassword }=require('./../controller/authController')

  // ********* signUp User
router.route( '/signup' ).post(signup)

  // *********** singin User **************
router.route( '/signin' ).post(signin);

// ******** Forget Password ************

router.route('/forgetPassword').post(forgetPassword);

// ******** Reset Password ************

router.route('/resetPassword/:token').patch(resetPassword);

  module.exports= router;