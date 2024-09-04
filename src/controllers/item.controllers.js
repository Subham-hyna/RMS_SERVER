import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import FoodItem from "../models/foodItems.model.js";
import { Category } from "../models/categories.model.js";
import { Shop } from "../models/shop.model.js";

export const addFoodItem = asyncHandler(async (req, res, next) => {
    const { name, price, mealtype, isAvailable, shortCode, photo, categoryId } = req.body;

    if (!name || !price || !mealtype || !categoryId) {
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
        $and: [{ shopId: shop._id }, { _id: categoryId }]
    });

    if (!category) {
        return next(new ApiError(400, "Category doesn't exist"));
    }

    const foodItem = await FoodItem.create({
        name,
        price,
        mealtype,
        isAvailable,
        shortCode,
        photo,
        categoryId,
        shopId: shop._id
    });

    if (!foodItem) {
        return next(new ApiError(400, "Error in adding Food Item"));
    }

    await Category.findByIdAndUpdate(categoryId, {
        noOfItems: category.noOfItems + 1
    });

    res.status(201).json(new ApiResponse(201, { foodItem }, "Food Item added successfully"));
});

export const editFoodItem = asyncHandler(async (req, res, next) => {
    const { name, price, mealtype, isAvailable, shortCode, photo } = req.body;

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const foodItem = await FoodItem.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.foodItemId }]
    });

    if (!foodItem) {
        return next(new ApiError(400, "Food Item doesn't exist"));
    }

    const updatedFoodItem = await FoodItem.findByIdAndUpdate(
        req.params.foodItemId,
        {
            name: name || foodItem.name,
            price: price || foodItem.price,
            mealtype: mealtype || foodItem.mealtype,
            isAvailable: isAvailable !== undefined ? isAvailable : foodItem.isAvailable,
            shortCode: shortCode || foodItem.shortCode,
            photo: photo || foodItem.photo
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedFoodItem) {
        return next(new ApiError(400, "Food Item not updated"));
    }

    res.status(200).json(new ApiResponse(200, { foodItem: updatedFoodItem }, "Food Item details updated"));
});

export const deleteFoodItem = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const foodItem = await FoodItem.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.foodItemId }]
    });

    if (!foodItem) {
        return next(new ApiError(400, "Food Item doesn't exist"));
    }

    const category = await Category.findById(foodItem.categoryId);
    await Category.findByIdAndUpdate(category._id, {
        noOfItems: category.noOfItems - 1
    });

    await FoodItem.findByIdAndDelete(req.params.foodItemId);

    res.status(200).json(new ApiResponse(200, {}, "Food Item deleted successfully"));
});

export const getFoodItemById = asyncHandler(async (req, res, next) => {
    const foodItem = await FoodItem.findById(req.params.foodItemId);
    if (!foodItem) {
        return next(new ApiError(404, "Food Item not found"));
    }
    res.status(200).json(new ApiResponse(200, { foodItem }, "Food Item details retrieved successfully"));
});

export const getAllFoodItems = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const foodItems = await FoodItem.find({ shopId: req.params.shopId }).sort({ createdAt: 1 });

    res.status(200).json(new ApiResponse(200, { foodItems }, "List of all Food Items retrieved successfully"));
});
