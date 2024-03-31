const User = require('../models/userModel');
const AppError = require('../utilites/appError');
const catchAsync = require('../utilites/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail=require('./../utilites/email')



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
      status:'Success',
      token,
      data:{
        user
      }
    })
  }


const signup = catchAsync(async (req, res, next) => {
    console.log('Inside the signUp Controller...');

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
      error = new AppError('Please provide Email and Password', 400);
      return next(error);
    }
    // check if user exists and password is correct
    // the + password will add the password field to user object
    // beacuse we have set the password as select false which will not return
    // the password to user .
    const user = await User.findOne({ email });
  console.log(password,user.password);
    if (!user || !(await user.passwordMatching(password, user.password))) {
      error = new AppError('Incorrect Email or Password !', 401);
      return next(error);
    }
    const token = generateToken(user._id);
    // send token if user and password is correct
    res.status(200).json({
      status: 'success',
      token,
    });
  });


  // ***** Forget Password
// ***** Forget Password
const forgetPassword = catchAsync(async (req, res, next) => {
  // check if email exists or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new AppError("No User belongs to this email", 404);
    return next(error);
  }
  // generate the random token
  const resetToken = user.createPasswordResetToken();
await user.save({validateBeforeSave:false});
  // Send Token via Email
  const resetUrl = `${req.protocol}
://${req.get("host")}/api/v1/loanService/resetPassword/${resetToken}`;
const message = `Forget Password ? submit a PATCH request with your new password and
password Confirm to ${resetUrl}.\nif you did not forget the password, please ignore !`;
console.log('Reset URl',resetUrl);
  try {
    await sendEmail({
      email: user.email,
      subject: "Your token will be expired with in 10 minutes",
      message,
    });
    res.status(200).json({
      status: "success",
      message: "token send to email successFully !",
    });
  } catch (error) {
    user.createPasswordResetToken = undefined;
    user.passwordResetExpires = undefined;
    const err = new AppError("Error sending Email try Again !", 500);
    next(err);
  }
});
const resetPassword = catchAsync(async (req, res, next) => {
// get user based on the token
// First i need to hased the token i am getting from params
const hasedtoken=crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
    console.log(hasedtoken)
// finding user and checking the token expiration
const user=await User.findOne({
  passwordResetToken:hasedtoken,
  passwordResetExpires:{$gt:Date.now()}
})
//  if user does not exists....
if(!user){
  const error=new AppError('Password Reset Token Expires or Invalid',400);
  return next(error)
}
// If user exists than update the values 
user.password=req.body.password;
user.passwordConfirm=req.body.passwordConfirm;
user.passwordResetToken=undefined;
user.passwordResetExpires=undefined;
// using save not update because this will run the validation again while 
// updating the user 
await user.save();
const token = generateToken(user._id);
// sending token again
res.status(200).json({
  status:"success",
  token
})
});
  

  module.exports={
    signup,
    createSendToken,
    signin,
    forgetPassword,
    resetPassword,
  }