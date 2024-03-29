const mongoose = require('mongoose');
const validator= require('validator');
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    firstName: {
      type: String,
      required: [true, 'First Name can not be Empty'],
    },
    lastName: {
        type: String,
        required: [true, 'Last Name can not be Empty'],
    },
    email: {
      type: String,
      required: [true, 'Email can not be Empty'],
      unique: true,
      validate: [validator.isEmail, 'Please provide a valid Email'],
      lowercase: true, // Place 'lowercase' here
    },
    role: {
      type: String,
      enum: ['admin', 'user', 'guide', 'leader-guide'],
      default: 'user',
    },
    password: {
      type: String,
      required: [true, 'Password is Required'],
    //   minlength: [8, 'A password must be greater than 8'],
    },
    passwordConfirm: {
      type: String,
      required: [true, 'Confirm password is Required'],
      validate: {
        validator: function (el) {
          return el === this.password;
        },
        message: 'Confirm password should be the same as the password',
      },
    },
    passwordChangeAt: {
      type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active:{
      type:Boolean,
      default:true,
      select:true
    }
  });


  userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
      return next();
    } else {
      // Hash the password with a cost of 12
      this.password = await bcrypt.hash(this.password, 12);
      // Not storing confirm password into the database
      this.passwordConfirm = undefined;
    }
  });

  
  userSchema.methods.passwordMatching = async function (
    loginPassword,
    userPassword
  ) {
    return await bcrypt.compare(loginPassword, userPassword);
  };


const User = mongoose.model('Users', userSchema);
module.exports = User;