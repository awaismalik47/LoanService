const User = require("../models/userModel");
const AppError = require("../utilites/appError");
const catchAsync = require("../utilites/catchAsync");
const jwt = require("jsonwebtoken");



// generating Token
const generateToken = (id) => {
    return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
      expiresIn: process.env.JWT_EXPIRES_IN,
    });
  };

// create Send Token Function 
const createSendToken=(user,statusCode,res)=>{
    const token=generateToken(user._id);
    // send Token inside the Cookie
    const cookieOption={
      expiresIn:new Date(Date.now()+process.env.JWT_EXPIRES_IN_COOKIE),
      httpOnly:true,
    }
    if(process.env.NODE_ENV=== 'production'){
      cookieOption.secure=true
    }
    res.cookie('jwt',token,cookieOption);
    user.password=undefined
    res.status(statusCode).json({
      status:"Success",
      token,
      data:{
        user
      }
    })
  }


const signup = catchAsync(async (req, res, next) => {
    console.log("Inside the signUp Controller...");

    // Creating New User
    const newUser = await User.create({
      firstName: req.body.firstName,
      lastName:req.body.lastName,
      email: req.body.email,
      password: req.body.password,
      passwordConfirm: req.body.passwordConfirm,
      passwordChangeAt: req.body.passwordChangeAt,
      role: req.body.role,
    });
  
    // const token = generateToken(newUser._id);
    // res.status(201).json({
    //   status: true,
    //   token,
    //   data: {
    //     newUser,
    //   },
    // });
    createSendToken(newUser,201,res)
  });


  const signin = catchAsync(async (req, res, next) => {
    const { email, password } = req.body;
   
    // check if email and password exists
    if (!email || !password) {
      error = new AppError("Please provide Email and Password", 400);
      return next(error);
    }
    // check if user exists and password is correct
    // the + password will add the password field to user object
    // beacuse we have set the password as select false which will not return
    // the password to user .
    const user = await User.findOne({ email });
  console.log(password,user.password);
    if (!user || !(await user.passwordMatching(password, user.password))) {
      error = new AppError("Incorrect Email or Password !", 401);
      return next(error);
    }
    const token = generateToken(user._id);
    // send token if user and password is correct
    res.status(200).json({
      status: "success",
      token,
    });
  });


  module.exports={
    signup,
    createSendToken,
    signin,
  }