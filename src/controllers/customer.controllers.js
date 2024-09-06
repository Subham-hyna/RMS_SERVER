import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import Customer from "../models/customer.model.js";
import Shop from "../models/shop.model.js";

export const addCustomer = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email, totalSpending,lastVisit, shopId } = req.body;

    if (!name || !phoneNo || !shopId) {
        return next(new ApiError(400, "Name, Phone Number, and Shop ID are required"));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const customer = await Customer.create({
        name,
        phoneNo,
        email,
        totalSpending: totalSpending || 0,
        lastVisit: lastVisit || Date.now(),
        shopId: shop._id
    });

    if (!customer) {
        return next(new ApiError(400, "Error in adding Customer"));
    }

    res.status(201).json(new ApiResponse(201, { customer }, "Customer added successfully"));
});

export const editCustomer = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email, totalSpending, lastVisit } = req.body;

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const customer = await Customer.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.customerId }]
    });

    if (!customer) {
        return next(new ApiError(400, "Customer doesn't exist"));
    }

    const updatedCustomer = await Customer.findByIdAndUpdate(
        req.params.customerId,
        {
            name: name || customer.name,
            phoneNo: phoneNo || customer.phoneNo,
            email: email || customer.email,
            totalSpending: totalSpending || customer.totalSpending,
            lastVisit: lastVisit || customer.lastVisit
        },
        {
            new: true,
            runValidators: true
        }
    );

    if (!updatedCustomer) {
        return next(new ApiError(400, "Customer not updated"));
    }

    res.status(200).json(new ApiResponse(200, { customer: updatedCustomer }, "Customer details updated"));
});

export const deleteCustomer = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const customer = await Customer.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.customerId }]
    });

    if (!customer) {
        return next(new ApiError(400, "Customer doesn't exist"));
    }

    await Customer.findByIdAndDelete(req.params.customerId);

    res.status(200).json(new ApiResponse(200, {}, "Customer deleted successfully"));
});

