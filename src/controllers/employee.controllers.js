import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js";
import User from "../models/user.model.js";
import Shop from "../models/shop.model.js";
import crypto from 'crypto'; 

export const addEmployee = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email, role, shopId } = req.body;

    if (!name || !phoneNo || !role || !shopId) {
        return next(new ApiError(400, "Name, Phone Number, Role, and Shop ID are required"));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }


    const shopIdString = shopId.toString();
    const shopIdFirstPart = shopIdString.substring(0, 3);
    const shopIdSecondPart = shopIdString.substring(shopIdString.length - 3);

    const randomNumber = crypto.randomBytes(5).toString("hex");


    const employeeId = `${shopIdFirstPart}${randomNumber}${shopIdSecondPart}`;

    const employee = await User.create({
        saleId: employeeId,
        name,
        phoneNo,
        email,
        role: "employee",
        shopId: shop._id
    });

    if (!employee) {
        return next(new ApiError(400, "Error in adding Employee"));
    }

    res.status(201).json(new ApiResponse(201, { employee }, "Employee added successfully"));
});

export const editEmployee = asyncHandler(async (req, res, next) => {
    const { name, phoneNo, email } = req.body;

    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    const employee = await User.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.employeeId }, { role: "employee" }]
    });

    if (!employee) {
        return next(new ApiError(400, "Employee doesn't exist"));
    }

    const updatedEmployee = await User.findByIdAndUpdate(
        req.params.employeeId,
        {
            name: name || employee.name,
            phoneNo: phoneNo || employee.phoneNo,
            email: email || employee.email,

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
        $and: [{ shopId: shop._id }, { _id: req.params.employeeId }, { role: "employee" }]
    });

    if (!employee) {
        return next(new ApiError(400, "Employee doesn't exist"));
    }

    await User.findByIdAndDelete(req.params.employeeId);

    res.status(200).json(new ApiResponse(200, {}, "Employee deleted successfully"));
});
