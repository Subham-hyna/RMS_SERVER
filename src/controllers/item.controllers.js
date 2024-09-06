import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Item} from "../models/item.model.js";
import { Category } from "../models/category.model.js";
import { Shop } from "../models/shop.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const addItem = asyncHandler(async (req, res, next) => {
    const { name, price, mealType, shortCode, categoryId } = req.body;

    if (!name || !price || !mealType || !categoryId) {
        return next(new ApiError(400, "All fields are required"));
    }

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const item = await Item.findOne({
        $and: [{ shopId: shop._id }, { name }]
    });

    if (item) {
        return next(new ApiError(400, "Item already exist"));
    }

    const newItem = await Item.create({
        name,
        price,
        mealType,
        shortCode,
        categoryId,
        shopId: shop._id
    });

    if (!newItem) {
        return next(new ApiError(400, "Error in adding Food Item"));
    }

    const category = await Category.findById(categoryId);

    await Category.findByIdAndUpdate(
        categoryId,
        {
            noOfItems: category.noOfItems + 1
        }
    )

    res
    .status(201)
    .json(
        new ApiResponse(201, { item: newItem }, "Food Item added successfully"
    ));
});

export const editItem = asyncHandler(async (req, res, next) => {
    const { name, price, mealType, isAvailable, shortCode, isStar } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const item = await Item.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.itemId }]
    });

    if (!item) {
        return next(new ApiError(400, "Food Item doesn't exist"));
    }

    const updatedItem = await Item.findByIdAndUpdate(
        req.params.itemId,
        {
            name: name || item.name,
            price: price || item.price,
            mealType: mealType || item.mealType,
            isAvailable: isAvailable || item.isAvailable,
            shortCode: shortCode || item.shortCode,
            isStar: isStar || item.isStar
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedItem) {
        return next(new ApiError(400, "Food Item not updated"));
    }

    res.status(200).json(new ApiResponse(200, { item: updatedItem }, "Food Item details updated"));
});

export const editItemCategory = asyncHandler(async(req,res,next)=>{
    const { categoryId } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const item = await Item.findOne({
        $and: [{ shopId:shop._id }, { _id:req.params.itemId }]
    });

    if(!item){
        return next (new ApiError(400,"Item doen't exist"));
    }

    if(categoryId.toString() === item.categoryId.toString()){
        return next(new ApiError(400,"Same Category"));
    }

    const updatedItem = await Item.findByIdAndUpdate(
        req.params.itemId,
        {
            categoryId: categoryId,
     
        },
        { 
            new: true, 
            runValidators: true
        }
    );

    if (!updatedItem) {
        return next(new ApiError(400, "Item not updated"));
    }

    const category1 = await Category.findById(categoryId);

    await Category.findByIdAndUpdate(
        categoryId,
        {
            noOfItems: category1.noOfItems + 1
        }
    )

    const category2 = await Category.findById(item.categoryId);

    await Category.findByIdAndUpdate(
        item.categoryId,
        {
            noOfItems: category2.noOfItems - 1
        }
    )

    res
    .status(200)
    .json(
        new ApiResponse(200, { item: updatedItem }, "Table details updated")
    );
})

export const deleteItem = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const item = await Item.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.itemId }]
    });

    if (!item) {
        return next(new ApiError(400, "Item doesn't exist"));
    }

    const category = await Category.findById(item.categoryId);

    await Category.findByIdAndUpdate(
        category._id, 
        {
        noOfItems: category.noOfItems - 1
        }
    )

    await Item.findByIdAndDelete(req.params.itemId);

    res.status(200).json(new ApiResponse(200, {}, "Item deleted successfully"));
});

export const getAllItems = asyncHandler(async(req,res,next) => {

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }
    
    let apiFeatures = new ApiFeatures(Item.find({shopId:req.params.shopId}).sort({createdAt : 1}).populate("categoryId","name _id"),req.query)
    .searchItem()
    .filter()

    const items = await apiFeatures.query;

    if(!items){
        return next(new ApiError(401,"Error in fetching tables"))
    }

    res
    .status(200)
    .json(
        new ApiResponse(200,{
            items
        },"Items fetched successfully")
    )
})
