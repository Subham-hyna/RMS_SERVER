import { Shop } from "../models/shop.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import shopRegistationTemplate from "../mailTemplates/shopRegistration.template.js"
import { sendEmail } from "../utils/smtp.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const addShop = asyncHandler( async(req,res,next) => {
    const {name, phoneNo, email, gstIn, shopType, line1, line2, pincode, state} = req.body;

    if( [name,email,phoneNo,shopType].some((field) => field.trim() === "")){
        return next(new ApiError(400, "All fields are required"))
    }

    const shopExist = await Shop.findOne({
        $and: [{ ownerId:req.user._id }, { gstIn }]
    })

    if(shopExist){
        return next(new ApiError(400,"Shop exist with same gstin No."));
    }
    
    const address = {
        line1,
        line2,
        pincode,
        state
    }


    const shop = await Shop.create({
        name,
        ownerId: req.user._id,
        email,
        phoneNo,
        shopType,
        address
    })

    if(gstIn) shop.gstIn = gstIn;
    await shop.save({validateBeforeSave: false});

    const createdShop = await Shop.findById(shop._id);

    if(!createdShop){
        return next(new ApiError(400,"Something went wrong while registering the shop"));
    }

    await sendEmail(req.user.email,"Shop Registration", shopRegistationTemplate(req.user.name,shop.name))

    res
        .status(201)
        .json(
            new ApiResponse(201,{},"Shop Created Successfully")
        )
})

export const editShop = asyncHandler( async(req,res,next) => {
    const {name, phoneNo, email, gstIn, shopType, address, status} = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop Doesn't Exist"));
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown shop"))
    }

    const updatedShop = await Shop.findByIdAndUpdate(
        req.params.shopId,
        {
        name: name || shop.name,
        email: email || shop.email,
        phoneNo: phoneNo || shop.phoneNo,
        gstIn: gstIn || shop.gstIn,
        shopType: shopType || shop.shopType,
        address: address || shop.address,
        status: status || shop.status
        },
        {
            new: true,
            validateBeforeSave: true
        }
    )

    if(!updatedShop){
        return next(new ApiError(400,"Shop not updated"));
    }

    res
    .status(201)
    .json(
        new ApiResponse(201,{shop: updatedShop}, "Shop Details Updated")
    )
})

export const getMyShops = asyncHandler(async(req,res,next)=>{

    const shops = await Shop.find({ownerId:req.user._id});

    res
    .status(200)
    .json(
        new ApiResponse(200,{shops},"Shops fetched successfully")
    )
})

export const getMyShop = asyncHandler(async(req,res,next)=>{

    const shop = await Shop.findById(req.params.shopId);
    
    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown shop"))
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,{shop},"Shop fetched successfully")
    )
})
