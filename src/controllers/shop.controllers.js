import { Shop } from "../models/shop.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import shopRegistationTemplate from "../mailTemplates/shopRegistration.template.js"
import { sendEmail } from "../utils/smtp.js";
import { ApiResponse } from "../utils/apiResponse.js";

export const addShop = asyncHandler( async(req,res,next) => {
    const {name, phoneNo, email, gstIn, shopType, address} = req.body;

    if( [name,email,phoneNo,address,gstIn,shopType].some((field) => field.trim() === "")){
        return next(new ApiError(400, "All fields are required"))
    }

    const shopExist = await Shop.findOne({
        $and: [{ ownerId:req.user._id }, { gstIn }]
    })

    if(shopExist){
        return next(new ApiError(400,"Shop exist with same gstin No."));
    }

    const shop = await Shop.create({
        name,
        ownerId: req.user._id,
        email,
        phoneNo,
        gstIn,
        shopType,
        address
    })

    const createdShop = await Shop.findById(shop._id);

    if(!createdShop){
        return next(new ApiError(400,"Something went wrong while registering the shop"));
    }

    // await sendEmail(req.user.email,"Shop Registration", shopRegistationTemplate(req.user.name,shop.name))

    res
        .status(201)
        .json(
            new ApiResponse(201,{shop:createdShop},"Shop Created Successfully")
        )
})

export const editShop = asyncHandler( async(req,res,next) => {
    const {name, phoneNo, email, gstIn, shopType, address, status} = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop Doesn't Exist"));
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
            runValidators: true
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

    const totalShops = shops.length;

    res
    .status(200)
    .json(
        new ApiResponse(200,{shops,totalShops},"Shops fetched successfully")
    )
})
