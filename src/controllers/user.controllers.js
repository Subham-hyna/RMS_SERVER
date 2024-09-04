import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/smtp.js";
import userVerificationTemplate from "../mailTemplates/userVerification.template.js";
import userCredentialsTemplate from "../mailTemplates/userCredentials.template.js"
import {ApiResponse} from "../utils/apiResponse.js"
import { sendToken } from "../utils/sendToken.js"
import crypto from "crypto";

export const registerOwner = asyncHandler( async(req,res,next) => {

    const { name, email, phoneNo, address, password } = req.body;

    if( [name,email,phoneNo,address,password].some((field) => field.trim() === "")){
        return next(new ApiError(400, "All fields are required"))
    }

    const userExist = await User.findOne({
        $or: [{ email }, { phoneNo }]
    })

    if(userExist){
        if(userExist.isUserVerified){
            return next(new ApiError(400,"User already exist for this email or registartion Number"))
        }
        else{
            const image = await uploadOnCloudinary(req.file.path)
            const avatar = {
              public_id : image.public_id,
              url : image.secure_url
            }
            await deleteFromCloudinary(userExist.avatar.public_id);
            const updatedUser = await User.findByIdAndUpdate(
                userExist._id,
                {
                    $set: {
                        name,
                        email,
                        phoneNo,
                        avatar,
                        password,
                        address
                    }
                },
                {
                    new: true
                }
            )

            const {verifyToken, OTP} = updatedUser.generateVerificationTokenAndOtp();
    
            await updatedUser.save({ validateBeforeSave: false });
          
            const VerificationLink = process.env.FRONTEND_URL+ "user/verify/" + verifyToken ;

            await sendEmail(updatedUser.email,"User Verification", userVerificationTemplate(updatedUser.name,VerificationLink,OTP))

            res.status(200).json(
                new ApiResponse(200,{user:updatedUser},"User Updated not verified")
            )
        }
    }else{
        const image = await uploadOnCloudinary(req.file.path)
        const avatar = {
          public_id : image.public_id,
          url : image.secure_url
        }
        const user = await User.create({
            name,
            email,
            phoneNo,
            avatar,
            password,
            address
        })

        const createdUser = await User.findById(user._id);

        if(!createdUser){
            return next(new ApiError(400,"Something went wrong while registering the user"));
        }

        const {verifyToken, OTP} = createdUser.generateVerificationTokenAndOtp();
    
            await createdUser.save({ validateBeforeSave: false });
          
            const VerificationLink = process.env.FRONTEND_URL + "user/verify/" +verifyToken ;

            await sendEmail(createdUser.email,"User Verification", userVerificationTemplate(createdUser.name,VerificationLink,OTP))

        res
        .status(201)
        .json(
            new ApiResponse(201,{user:createdUser},"User Created Successfully")
        )
    }

})

export const verifyOwner = asyncHandler( async(req,res,next) => {

    const {otp} = req.body;

    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      verificationToken
    })

    if(!user){
        return next(new ApiError(400,"Verification Link is invalid"))
    }

    if(user.verificationOTP !== otp){
        return next(new ApiError(400,"OTP is invalid"))
    }

    const verifiedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $unset:{
                verificationOTP: 1,
                verificationToken: 1
            },
            $set:{
                isUserVerified: true
            }
        },
        {
            new: true
        }
    )

    await sendEmail(verifiedUser.email,"Account Credentials",userCredentialsTemplate(verifiedUser.name,verifiedUser.email,verifiedUser.phoneNo,"password",process.env.FRONTEND_URL));

    res.status(201).json(
        new ApiResponse(201,{},"You are successfully Verified. Account Credentials have been set via email")
    )
})

export const loginOwner = asyncHandler( async(req,res,next) => {

    const { email, phoneNo, password } = req.body;

    if((!email && !phoneNo) || !password){
        return next(new ApiError(400, "All fields are required"))
    }

    const user = await User.findOne({
        $or:[{ email },{ phoneNo }]
    }).select("+password")

    if(!user){
        return next(new ApiError(400,"User doesn't exist"));
    }

    if(!user.isUserVerified){
        return next(new ApiError(400,"User not verified. Check your mail for verification"))
    }

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        return next(new ApiError(400,"Invalid user credentials"));
    }

    sendToken(user,200,res,"Logged In Successfully");
})

export const logoutOwner = asyncHandler( async(req,res,next) => {
    await User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1 
            }
        },
        {
            new: true
        }
    )

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("LMS_accessToken", options)
    .clearCookie("LMS_refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged Out"))
})