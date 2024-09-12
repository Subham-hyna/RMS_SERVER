import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import {Customer} from "../models/customer.model.js";
import {Shop} from "../models/shop.model.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { USER_RESULT_PER_PAGE } from "../constants.js";

export const addCustomer = asyncHandler(async (req, res, next) => {
    const { name, phoneNo } = req.body;
    const { shopId } = req.params;

    if (!name || !phoneNo) {
        return next(new ApiError(400, "Name, Phone Number, and Shop ID are required"));
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const customerExist = await Customer.findOne({
        $and: [{ shopId: shop._id }, { phoneNo }]
    })

    if(customerExist){
        return next(new ApiError(400,"Customer exist with same phone No"))
    }

    const customer = await Customer.create({
        name,
        phoneNo,
        totalSpending: 0,
        shopId: shop._id
    });

    if (!customer) {
        return next(new ApiError(400, "Error in adding Customer"));
    }

    res.status(201).json(new ApiResponse(201, { customer }, "Customer added successfully"));
});

export const editCustomer = asyncHandler(async (req, res, next) => {
    const { name, phoneNo } = req.body;

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
            phoneNo: phoneNo || customer.phoneNo
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

export const getAllCustomers = asyncHandler(async (req, res, next) => {

    const shop = await Shop.findById(req.params.shopId);
    const resultPerPage = USER_RESULT_PER_PAGE;

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    let apiFeatures = new ApiFeatures(Customer.find({shopId:req.params.shopId}).sort({lastVisited : -1}),req.query)
    .searchCustomer()

    let customers = await apiFeatures.query;

    const customerFilteredCount = customers.length;

    apiFeatures = new ApiFeatures(Customer.find({shopId:req.params.shopId}).sort({lastVisited : -1}),req.query)
    .searchCustomer()
    .pagination(resultPerPage);

    customers = await apiFeatures.query;

    if(!customers){
        return next(new ApiError(401,"Error in fetching tables"))
    }

    res.status(200).json(new ApiResponse(200, { customers, resultPerPage, customerFilteredCount }, "Customers retrieved successfully"));
});


