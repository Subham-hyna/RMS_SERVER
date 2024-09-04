import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Area} from "../models/area.model.js";
import { Shop } from "../models/shop.model.js";
import { Table } from "../models/table.model.js";

export const addArea = asyncHandler(async (req, res, next) => {
    const { name, priority } = req.body;
    
    if (!name) {
        return next(new ApiError(400, "All fields are required"));
    }

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const area = await Area.findOne({
        $and: [{ shopId:shop._id }, { name }]
    });

    if(area){
        return next(new ApiError(400,"Area already exist"));
    }

    const newArea = await Area.create({
       name,
       priority,
       noOfTables: 0,
       shopId: shop._id
    })

    if(!newArea){
        return next(new ApiError(400,"Error in adiing Area"));
    }

    res
    .status(201)
    .json(
        new ApiResponse(201,{area: newArea},"Area added successfully")
    )
})


export const editArea= asyncHandler( async(req,res,next) => {
    const { name,priority } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const area = await Area.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.areaId }]
    });

    if(!area){
        return next(new ApiError(400,"Area doesn't exist"))
    }

    const updatedArea=await Area.findByIdAndUpdate(
        req.params.areaId,
        {
            name:name||area.name,
            priority:priority||area.priority,
        },
        {
            new: true,
            runValidators: true
        }
    )
    
    if(!updatedArea){
        return next(new ApiError(400,"Area not updated"))
    }

    res
    .status(201)
    .json(
        new ApiResponse(201,{area : updatedArea},"Area Details updated")
    )
})

//delete all tables also refering to that area
export const deleteArea = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const area = await Area.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.areaId }]
    });

    if(!area){
        return next(new ApiError(400,"Area doesn't exist"))
    }

    const tables = await Table.find({areaId:area._id});

    if(tables.length !== 0){
        tables.forEach(async(t)=>{
            await Table.findByIdAndDelete(t._id);
        })
    }

    await Area.findByIdAndDelete(req.params.areaId);

    res
        .status(200)
        .json(new ApiResponse(200, {}, "Area and Tables deleted successfully"));
});


export const getAreaById = asyncHandler(async (req, res, next) => {
    const area = await Area.findById(req.params.areaId);
    if (!area) {
        return next(new ApiError(404, "Area not found"));
    }
    res.status(200).json(new ApiResponse(200, { area }, "Area details retrieved successfully"));
});


export const getAllAreas = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const areas = await Area.find({shopId: req.params.shopId}).sort({priority: 1});

    res.status(200).json(new ApiResponse(200, { areas }, "List of all areas retrieved successfully"));
});


