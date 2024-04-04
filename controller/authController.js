const User = require('../models/userModel');
const AppError = require('../utilites/appError');
const catchAsync = require('../utilites/catchAsync');
const jwt = require('jsonwebtoken');
const sendEmail = require('./../utilites/email')



// generating Token
const generateToken = (id) => {
  return jwt.sign({ id: id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const signup = catchAsync(async (req, res, next) => {
  console.log('Inside the signUp Controller...');

  // Creating New User
  const newUser = await User.create({
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm,
    passwordChangeAt: req.body.passwordChangeAt,
    role: req.body.role,
  });

  const token = generateToken(newUser._id);
  res.status(201).json({
    status: true,
    token,
    data: {
      newUser,
    },
  });
});


const signin = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // check if email and password exists
  if (!email || !password) {
    error = new AppError('Please provide Email and Password', 400);
    return next(error);
  }
  const user = await User.findOne({ email });
  console.log(password, user.password);
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
const forgetPassword = catchAsync(async (req, res, next) => {
  // check if email exists or not
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    const error = new AppError("No User belongs to this email", 404);
    return next(error);
  }
  // generate the random token
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });
  // Send Token via Email
  
});

// Email verification 
const emailVerification = catchAsync(async (req,res,next) => {
  
})

// Reset Password
const resetPassword = catchAsync(async (req, res, next) => {
  // get user based on the token
  // First i need to hased the token i am getting from params
  const hasedtoken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');
  console.log(hasedtoken)
  // finding user and checking the token expiration
  const user = await User.findOne({
    passwordResetToken: hasedtoken,
    passwordResetExpires: { $gt: Date.now() }
  })
  //  if user does not exists....
  if (!user) {
    const error = new AppError('Password Reset Token Expires or Invalid', 400);
    return next(error)
  }
  // If user exists than update the values 
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  // using save not update because this will run the validation again while 
  // updating the user 
  await user.save();
  const token = generateToken(user._id);
  // sending token again
  res.status(200).json({
    status: "success",
    token
  })
});


module.exports = {
  signup,
  signin,
  forgetPassword,
  resetPassword,
}