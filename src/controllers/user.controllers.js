import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { deleteFromCloudinary, uploadOnCloudinary } from "../utils/cloudinary.js";
import { sendEmail } from "../utils/smtp.js";
import userVerificationTemplate from "../mailTemplates/userVerification.template.js";
import waiterCredentialsTemplate from "../mailTemplates/waiterCredentials.template.js"
import ownerCredentialsTemplate from "../mailTemplates/ownerCredentials.template.js"
import { passwordResetMail} from '../mailTemplates/passwordReset.template.js'
import {ApiResponse} from "../utils/apiResponse.js"
import { sendToken } from "../utils/sendToken.js"
import crypto from "crypto";

export const registerOwner = asyncHandler( async(req,res,next) => {

    const { name, email, phoneNo, line1, line2, pincode, state, password } = req.body;

    if( [name,email,phoneNo,password].some((field) => field.trim() === "")){
        return next(new ApiError(400, "All fields are required"))
    }

    const userExist = await User.findOne({
        $or: [{ email }, { phoneNo }]
    })

    const address = {
        line1,
        line2,
        pincode,
        state
    }

    if(userExist){
        if(userExist.isUserVerified){
            return next(new ApiError(400,"User already exist for this email or Phone Number"))
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
                        name,
                        email,
                        phoneNo,
                        avatar,
                        address
                },
                {
                    new: true
                }
            ).select("+password");

            const {verifyToken, OTP} = updatedUser.generateVerificationTokenAndOtp();
    
            updatedUser.password = password;
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

export const verifyUser = asyncHandler( async(req,res,next) => {

    const {otp} = req.body;

    const verificationToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      verificationToken
    }).select("+password")

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
                isUserVerified: true,
            }
        },
        {
            new: true
        }
    )

    if(verifiedUser.role === "WAITER"){
        let password = '';
        const str = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' +
            'abcdefghijklmnopqrstuvwxyz0123456789@#$';
     
        for (let i = 1; i <= 8; i++) {
            let char = Math.floor(Math.random()
                * str.length + 1);
     
            password += str.charAt(char)
        }

        verifiedUser.password = password;
        verifiedUser.dateOfJoining = Date.now();

        await verifiedUser.save({validateBeforeSave: false})

        await sendEmail(verifiedUser.email,"Account Credentials",waiterCredentialsTemplate(verifiedUser.name,verifiedUser.email,verifiedUser.saleId,password,process.env.FRONTEND_URL));
    }
    else{
        await sendEmail(verifiedUser.email,"Account Credentials",ownerCredentialsTemplate(verifiedUser.name,verifiedUser.email,verifiedUser.phoneNo,process.env.FRONTEND_URL));
    }

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

export const logoutUser = asyncHandler( async(req,res,next) => {
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

export const getCurrentUser = asyncHandler(async(req,res,next)=>{
    res.status(200).json(
        new ApiResponse(200,{user:req.user},"User fetched successfully")
    )
})

export const changeCurrentPassword = asyncHandler(async(req,res,next) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(req.user?._id).select("+password")
    const isPasswordCorrect = await user.isPasswordCorrect(oldPassword)

    if (!isPasswordCorrect) {
        throw new ApiError(400, "Invalid old password")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"))

})

export const updateAvatar = asyncHandler(async(req,res,next) => {
    
    if(!req.file){
        return next(new ApiError(400,"Please select a file"))
    }

    const user = await User.findById(req.user?._id);
    await deleteFromCloudinary(user.avatar.public_id);


    const image = await uploadOnCloudinary(req.file.path);

    const avatar = {
        public_id: image.public_id,
        url: image.secure_url
    }

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        {
            $set:{
                avatar
            }
        },
        {
            new: true
        }
    )

    if(!updatedUser){
        return next(new ApiError(401,"Avatar not uploaded"))
    }

    res
    .status(201)
    .json(
        new ApiResponse(201,{user: updatedUser},"Avatar Updated successfully")
    )
})

export const updateOwnerDetails = asyncHandler(async(req,res,next)=>{
    const {name, email, phoneNo, line1, line2, pincode, state} = req.body;

    const user = await User.findById(req.user._id);

    if(!user){
        return next(new ApiError(404,"User Not Found"))
    }

    const address = {
        line1,
        line2,
        pincode,
        state
    }

    const updatedUser = await User.findByIdAndUpdate(
        req.user._id,
        {
            name: name || user.name,
            email: email || user.email,
            phoneNo: phoneNo || user.phoneNo,
            address: address || user.address
        },{
            new: true,
            validateBeforeSave: true
        }
    ) 

    res.status(201).json(
        new ApiResponse(201,{user:updatedUser},"User updated")
    )
})

export const forgotPassword = asyncHandler( async(req,res,next) => {

    const user = await User.findOne({ email: req.body.email , 
        isUserVerified: true});
  
    if (!user) {
      return next(new ApiError(404,"User not found"));
    }
  
    const resetToken = user.getResetPasswordToken();
    
    await user.save({ validateBeforeSave: false });
  
    const resetPasswordUrl = process.env.FRONTEND_URL + "user/reset-password/" + resetToken ;
  
    try {
      await sendEmail(user.email , "Password Reset" , passwordResetMail(user.name , resetPasswordUrl));
  
      res.status(200).json(
        new ApiResponse(201,{},`Email send to ${user.email} successfully`)
      );
    } catch (error) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
  
      await user.save({ validateBeforeSave: false });
  
      return next(new ApiError(500,error.message));
    }
  });

export const resetPassword = asyncHandler(async (req, res, next) => {

    const { password, confirmPassword } = req.body;

    if(!password || !confirmPassword ){
        return next(new ApiError(400, "Fill up al the fields"))
    }

    if ( password !== confirmPassword ) {
        return next(new ApiError(400,"Password does not password"));
    }

    const resetPasswordToken = crypto
      .createHash("sha256")
      .update(req.params.token)
      .digest("hex");
  
    const user = await User.findOne({
      resetPasswordToken,
      isUserVerified: true,
      resetPasswordExpire: { $gt: Date.now() },
    });
  
    if (!user) {
      return next(
        new ApiError(
          400,
          "Reset Password Token is invalid or has been expired"
        )
      );
    }
  
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
  
    await user.save({validateBeforeSave: false});
  
    sendToken(user, 200, res , "Logged In successfully");
  });