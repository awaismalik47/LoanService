const AppError = require("../utilites/appError");
const catchAsync = require("../utilites/catchAsync");


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
    return;
    // Creating New User
    const newUser = await User.create({
      name: req.body.name,
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

  module.exports={
    signup,
    createSendToken,
  }