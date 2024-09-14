import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { USER_ROLES } from "../constants.js";
import crypto from "crypto";

const userSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    phoneNo: {
        type: String,
        required: true,
        trim: true,
        unique: true
    },
    avatar: {
        public_id: {
          type: String,
        },
        url: {
          type: String,
        }
    },
    password: {
      type: String,
      required: [true, "Please Enter Your Password"],
      minLength: [6, "Password should be greater than 6 characters"],
      select: false,
    },
    refreshToken: {
        type: String,
        select: false
    },
    address: {
       line1: { 
        type: String,
        required: true
        },
       line2: { 
        type: String,
        required: true
        },
       pincode: { 
        type: String,
        required: true
        },
       state: { 
        type: String,
        required: true
        },
    },
    role: {        
        type: String,
        required: true,
        enum : USER_ROLES,
        default: 'OWNER'
    },
    isOwner:{
        type: Boolean,
        default: true
    },
    employeeOf:{
        type: Schema.Types.ObjectId,
        ref: 'Shop'
    },
    salary:{
        type: String,
    },
    salaryReceived:{
        type: Date
    },
    saleId:{
        type: String
    },
    dateOfJoining: {
        type: Date,
    },
    isUserVerified: {
        type: Boolean,
        default: false
    },
    verificationToken: String,
    verificationOTP: String,
    resetPasswordToken: String,
    resetPasswordExpire: Date
},
{
    timestamps: true
})

userSchema.pre("save", async function(next){
    if(!this.isModified("password")) return next();

    this.password = await bcrypt.hash(this.password, 10)
    next();
})

userSchema.methods.isPasswordCorrect = async function(password){
    return await bcrypt.compare(password, this.password)
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY
        }
    )
}
userSchema.methods.generateRefreshToken = function () {
    return jwt.sign(
        {
            _id: this._id
        },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY
        }
    )
}

userSchema.methods.generateVerificationTokenAndOtp = function () {

  const verifyToken = crypto.randomBytes(20).toString("hex");

  this.verificationToken = crypto
    .createHash("sha256")
    .update(verifyToken)
    .digest("hex");

  let digits = '0123456789'; 
  let OTP = ''; 
  let len = digits.length 
  for (let i = 0; i < 6; i++) { 
      OTP += digits[Math.floor(Math.random() * len)]; 
  } 

  this.verificationOTP = OTP;

  return {verifyToken, OTP};
}

userSchema.methods.getResetPasswordToken = function () {

    const resetToken = crypto.randomBytes(20).toString("hex");
  
    this.resetPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
  
    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
  
    return resetToken;
};
  

export const User = model("User", userSchema)