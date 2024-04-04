const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');


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
      default:false,
      select:true
    }
  });


  userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
      return next();
    } else {
      // Hash the password with a cost of 12
      this.password = await bcrypt.hash(this.password, 12);
      // Not storing confirm password into the database
      this.passwordConfirm = undefined;
      }
  });

  
  userSchema.methods.passwordMatching = async function (loginPassword,userPassword) {
    return await bcrypt.compare(loginPassword, userPassword);
  };


  userSchema.methods.createPasswordResetToken = function () {
    // Create a plain text token
    const resetToken = crypto.randomBytes(32).toString('hex');
    console.log('password Reset Token Plain', resetToken);
    // encrypt the token
    this.passwordResetToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    console.log('password Reset Token', this.passwordResetToken);
    const currentTimeUTC = Date.now(); // Get current time in UTC
    const currentTimePKT = new Date(currentTimeUTC + 5 * 60 * 60 * 1000); // Add 5 hours for Pakistan Standard Time
  
    // Add 10 minutes to the PKT time
    currentTimePKT.setMinutes(currentTimePKT.getMinutes() + 10);
    this.passwordResetExpires = currentTimePKT;
    return resetToken;
  };


const User = mongoose.model('Users', userSchema);
module.exports = User;