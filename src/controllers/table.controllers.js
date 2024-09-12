import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Table} from "../models/table.model.js";
import { Shop } from "../models/shop.model.js";
import { Area } from "../models/area.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const addTable = asyncHandler(async (req, res, next) => {

    const { name, noOfSeats, shape, areaId } = req.body;

    if (!name || !noOfSeats || !shape || !areaId ) {
        return next(new ApiError(400, "All fields are required"));
    }

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const table = await Table.findOne({
        $and: [{ shopId:shop._id }, { name }]
    });

    if(table){
        return next(new ApiError(400,"Table already exist"));
    }

    const newTable = await Table.create({ 
        name, 
        noOfSeats, 
        shape,
        areaId ,
        shopId:req.params.shopId
    });

    if (!newTable) {
        return next(new ApiError(400, "Error in adding Table"));
    }

    const area = await Area.findById(areaId);

    await Area.findByIdAndUpdate(
        areaId,
        {
            noOfTables: area.noOfTables + 1
        }
    )

    res
    .status(201)
    .json(
        new ApiResponse(201, { table: newTable }, "Table added successfully")
    );
});


export const editTable = asyncHandler(async (req, res, next) => {

    const { name, noOfSeats, shape } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const table = await Table.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.tableId }]
    });

    if(!table){
        return next (new ApiError(400,"Table doen't exist"));
    }

    const updatedTable = await Table.findByIdAndUpdate(
        req.params.tableId,
        {
            name: name || table.name,
            noOfSeats: noOfSeats || table.noOfSeats,
            shape: shape || table.shape,
     
        },
        { 
            new: true, 
            runValidators: true
        }
    );

    if (!updatedTable) {
        return next(new ApiError(400, "Table not updated"));
    }

    res
    .status(200)
    .json(
        new ApiResponse(200, { table: updatedTable }, "Table details updated")
    );
});

export const editTableArea = asyncHandler(async(req,res,next)=>{
    const { areaId } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const table = await Table.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.tableId }]
    });

    if(!table){
        return next (new ApiError(400,"Table doen't exist"));
    }

    if(areaId.toString() === table.areaId.toString()){
        return next(new ApiError(400,"Same area"));
    }

    const updatedTable = await Table.findByIdAndUpdate(
        req.params.tableId,
        {
            areaId: areaId,
     
        },
        { 
            new: true, 
            runValidators: true
        }
    );

    if (!updatedTable) {
        return next(new ApiError(400, "Table not updated"));
    }

    const area1 = await Area.findById(areaId);

    await Area.findByIdAndUpdate(
        areaId,
        {
            noOfTables: area1.noOfTables + 1
        }
    )

    const area2 = await Area.findById(table.areaId);

    await Area.findByIdAndUpdate(
        table.areaId,
        {
            noOfTables: area2.noOfTables - 1
        }
    )

    res
    .status(200)
    .json(
        new ApiResponse(200, { table: updatedTable }, "Table details updated")
    );
})

export const getAllTables = asyncHandler(async(req,res,next) => {

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }
    
    let apiFeatures = new ApiFeatures(Table.find({shopId:req.params.shopId}).sort({createdAt : 1}).populate("areaId","name _id"),req.query)
    .searchTable()

    const tables = await apiFeatures.query;

    if(!tables){
        return next(new ApiError(401,"Error in fetching tables"))
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,{
            tables
        },"Tables fetched successfully")
    )
})


export const deleteTable = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const table = await Table.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.tableId }]
    });

    if(!table){
        return next (new ApiError(400,"Table doen't exist"));
    }

    const area = await Area.findById(table.areaId);

    await Area.findByIdAndUpdate(
        area._id,
        {
            noOfTables: area.noOfTables - 1
        }
    )

    await Table.findByIdAndDelete(req.params.tableId);

    res.status(200).json(new ApiResponse(200, {}, "Table deleted successfully"));
});


export const tableExistInShop = asyncHandler(async(req,res,next)=>{

    const {tableNo, shopId} = req.params;

    const tableExist = await Table.findOne({
        $and: [{ shopId }, { name: tableNo }]
    }).populate("shopId", "name")

    if(!tableExist){
        return next(new ApiError(404,"Invalid Url"))
    }

    res.status(200).json(new ApiResponse(200,{shopName: tableExist.shopId.name},"Table Exist"))
})