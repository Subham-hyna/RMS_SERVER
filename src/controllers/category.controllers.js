import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { Category } from "../models/category.model.js";
import { Shop } from "../models/shop.model.js";
import { Item } from "../models/item.model.js";

export const addCategory = asyncHandler(async (req, res, next) => {
    const { name, priority } = req.body;

    if (!name) {
        return next(new ApiError(400, "All fields are required"));
    }

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const category = await Category.findOne({
        $and: [{ shopId: shop._id }, { name }]
    });

    if (category) {
        return next(new ApiError(400, "Category already exists"));
    }

    const newCategory = await Category.create({
        name,
        priority,
        noOfItems: 0,
        shopId: shop._id
    });

    if (!newCategory) {
        return next(new ApiError(400, "Error in adding Category"));
    }

    res
        .status(201)
        .json(new ApiResponse(201, { category: newCategory }, "Category added successfully"));
});


export const editCategory = asyncHandler(async (req, res, next) => {
    const { name, priority } = req.body;

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const category = await Category.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.categoryId }]
    });

    if (!category) {
        return next(new ApiError(400, "Category doesn't exist"));
    }

    const updatedCategory = await Category.findByIdAndUpdate(
        req.params.categoryId,
        {
            name: name || category.name,
            priority: priority || category.priority,
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCategory) {
        return next(new ApiError(400, "Category not updated"));
    }

    res
        .status(200)
        .json(new ApiResponse(200, { category: updatedCategory }, "Category details updated"));
});


export const deleteCategory = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const category = await Category.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.categoryId }]
    });

    if (!category) {
        return next(new ApiError(400, "Category doesn't exist"));
    }
  

    const items = await Item.find({categoryId:category._id});

    if(items.length !== 0){
        items.forEach(async(t)=>{
            await Item.findByIdAndDelete(t._id);
        })
    }

    await Category.findByIdAndDelete(req.params.categoryId);


    res
        .status(200)
        .json(new ApiResponse(200, {}, "Category deleted successfully"));
});


export const getAllCategories = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    const categories = await Category.find({ shopId: req.params.shopId }).sort({ priority: 1 });

    res.status(200).json(new ApiResponse(200, { categories }, "List of all categories retrieved successfully"));
});
