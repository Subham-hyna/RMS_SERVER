import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {User} from "../models/user.model.js";
import {Shop} from "../models/shop.model.js";
import crypto from 'crypto'; 
import userVerificationTemplate from "../mailTemplates/userVerification.template.js";
import { sendEmail } from "../utils/smtp.js";
import { sendToken } from "../utils/sendToken.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const addEmployee = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email, line1, line2, pincode, state, salary } = req.body;
    const{ shopId } = req.params

    if (!name || !phoneNo || !email || !shopId) {
        return next(new ApiError(400, "Name, Phone Number, and Shop ID are required"));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const employeeExist = await User.findOne({
        $and: [{isOwner:false},{employeeOf:shopId},{email}]
    })

    const address = {
        line1,
        line2,
        pincode,
        state
    }

    if(employeeExist){
        if(employeeExist.isUserVerified){
            return next(new ApiError(400,"User already exist for this email or Phone Number"))
        }
        else{
            let saleId = '';
        const str = '123456789';
     
        for (let i = 1; i <= 6; i++) {
            let char = Math.floor(Math.random()
                * str.length + 1);
     
            saleId += str.charAt(char)
        }

            const updatedEmployee = await User.findByIdAndUpdate(
                employeeExist._id,
                {
                    $set: {
                        saleId,
                        name,
                        phoneNo,
                        email,
                        isOwner: false,
                        address,
                        salary,
                        employeeOf:shopId,
                        role: "WAITER"
                    }
                },
                {
                    new: true
                }
            )

            const {verifyToken, OTP} = updatedEmployee.generateVerificationTokenAndOtp();
    
            await updatedEmployee.save({ validateBeforeSave: false });
          
            const VerificationLink = process.env.FRONTEND_URL+ "user/verify/" + verifyToken ;

            await sendEmail(updatedEmployee.email,"User Verification", userVerificationTemplate(updatedEmployee.name,VerificationLink,OTP))

            res.status(200).json(
                new ApiResponse(200,{employee:updatedEmployee},"User Updated not verified")
            )
        }
    }else{
        let saleId = '';
        const str = '123456789';
     
        for (let i = 1; i <= 6; i++) {
            let char = Math.floor(Math.random()
                * str.length + 1);
     
            saleId += str.charAt(char)
        }
    const employee = await User.create({
        saleId,
        name,
        phoneNo,
        email,
        isOwner: false,
        address,
        salary,
        employeeOf:shopId,
        role: "WAITER",
        password: "123456",
        dateOfJoining: Date.now()
    });

    const createdEmployee = await User.findById(employee._id);

    if (!createdEmployee) {
        return next(new ApiError(400, "Error in adding Employee"));
    }
    const {verifyToken, OTP} = createdEmployee.generateVerificationTokenAndOtp();
    
    await createdEmployee.save({ validateBeforeSave: false });
  
    const VerificationLink = process.env.FRONTEND_URL + "user/verify/" +verifyToken ;

    await sendEmail(createdEmployee.email,"User Verification", userVerificationTemplate(createdEmployee.name,VerificationLink,OTP))

    res.status(201).json(new ApiResponse(201, { employee: createdEmployee }, "Employee added successfully"));
    }


    
});

export const editEmployee = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email, line1, line2, pincode, state, salary, salaryReceived } = req.body;

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const employee = await User.findOne({
        $and: [{ employeeOf: shop._id }, { _id: req.params.employeeId }]
    });

    if (!employee) {
        return next(new ApiError(400, "Employee doesn't exist"));
    }

    const address = {
        line1,
        line2,
        pincode,
        state
    }

    const updatedEmployee = await User.findByIdAndUpdate(
        req.params.employeeId,
        {
            name: name || employee.name,
            phoneNo: phoneNo || employee.phoneNo,
            email: email || employee.email,
            address: address || employee.address,
            salary: salary || employee.salary,
            salaryReceived: salaryReceived || employee.salaryReceived
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedEmployee) {
        return next(new ApiError(400, "Employee not updated"));
    }

    res.status(200).json(new ApiResponse(200, { employee: updatedEmployee }, "Employee details updated"));
});
export const deleteEmployee = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const employee = await User.findOne({
        $and: [{ employeeOf: shop._id }, { _id: req.params.employeeId }]
    });

    if (!employee) {
        return next(new ApiError(400, "Employee doesn't exist"));
    }

    await User.findByIdAndDelete(req.params.employeeId);

    res.status(200).json(new ApiResponse(200, {}, "Employee deleted successfully"));
});

export const getAllEmployees = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    let apiFeatures = new ApiFeatures(User.find({$and:[{isOwner:false},{employeeOf:req.params.shopId},{isUserVerified:true}]}).sort({createdAt : -1}),req.query)
    .searchEmployee()

    let employees = await apiFeatures.query;

    if(!employees){
        return next(new ApiError(401,"Error in fetching tables"))
    }

    res.status(200).json(new ApiResponse(200, { employees }, "Employees retrieved successfully"));

})

export const loginWaiter = asyncHandler( async(req,res,next) => {

    const { email, phoneNo, saleId,password } = req.body;

    if((!email && !phoneNo && !saleId) || !password){
        return next(new ApiError(400, "All fields are required"))
    }

    const user = await User.findOne({
        $or:[{ email },{ phoneNo },{saleId}]
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

    const accessToken = user.generateAccessToken()
    const refreshToken = user.generateRefreshToken()

    user.refreshToken = refreshToken
    await user.save({ validateBeforeSave: false })
    const options = {
      expires: new Date(
        Date.now() + process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000
      ),
      httpOnly: true,
      secure: true
    }

    const loggedInUser = await User.findById(user._id);

    const shop = await Shop.findById(loggedInUser.employeeOf)
  
    return res
    .status(200)
    .cookie("LMS_accessToken", accessToken, options)
    .cookie("LMS_refreshToken", refreshToken, options)
    .json(
        new ApiResponse(
            200, 
            {
                user:loggedInUser, accessToken, refreshToken, shop
            },
            "Logged In successfully"
        )
    )
})

export const employeeOfShop = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.user.employeeOf);

    if(!shop){
        return next(new ApiError(404,"Shop doen't exist"));
    }

    res.status(200).json(
        new ApiResponse(200,{shop},"shop fetched successfully")
    )
})