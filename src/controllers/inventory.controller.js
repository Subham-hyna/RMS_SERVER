import {asyncHandler} from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";
import { ApiResponse } from "../utils/apiResponse.js"; 
import {Inventory} from "../models/inventory.model.js";
import {Shop} from "../models/shop.model.js";
import { USER_RESULT_PER_PAGE } from "../constants.js";
import { ApiFeatures } from "../utils/apiFeatures.js";

export const addInventoryItem = asyncHandler(async (req, res, next) => {
    let { name, quantity,quantityType} = req.body;

    const { shopId } = req.params;

    if (!name || !quantity ||  !quantityType) {
        return next(new ApiError(400, "Fill all details"));
    }

    const shop = await Shop.findById(shopId);

    if (!shop) {
      return next(new ApiError(400, "Shop doesn't exist"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Unauthorized action for this shop"));
    }
    const inventoryItem = await Inventory.findOne({
        $and: [{ shopId: shop._id }, { name }]
    });

    if (inventoryItem) {
      return next(new ApiError(400, "Inventory item already exists"));
    }
    const status = quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';

    const newInventoryItem = await Inventory.create({
      name,
      quantity,
      quantityType,
      shopId: shop._id,
      status,
    });
  
    if (!newInventoryItem) {
      return next(new ApiError(500, "Error in adding inventory item"));
    }
  
    res.status(201).json(new ApiResponse(201, { newInventoryItem }, "Inventory item added successfully"));
  });

 
export const updateInventoryItem = asyncHandler(async (req, res, next) => {

   let { name, quantity, quantityType } = req.body;

    const { inventoryItemId,shopId } = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(404, "Shop not found"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Unauthorized action for this shop"));
    }

    const inventory = await Inventory.findOne({
        $and: [{ shopId: shop._id }, { _id: req.params.inventoryItemId }]
    });

    if (!inventory) {
        return next(new ApiError(400, "Inventory doesn't exist"));
    }

    const status = quantity > 0 ? 'AVAILABLE' : 'OUT_OF_STOCK';

    const inventoryItem = await Inventory.findByIdAndUpdate(
        inventoryItemId,
        {
            name,
            quantity,
            quantityType,
            status 
        },
        {
            new: true,
            runValidators: true
        }
    );


    if (!inventoryItem) {
        return next(new ApiError(404, "Inventory item not Updated"));
    }

    res.status(200).json(new ApiResponse(200, { inventoryItem }, "Inventory item updated successfully"));
}); 

export const deleteInventoryItem = asyncHandler(async (req, res, next) => {


    const { inventoryItemId ,shopId} = req.params;

    const shop = await Shop.findById(shopId);
    if (!shop) {

        return next(new ApiError(404, "Shop not found"));
    }

    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(403, "Unauthorized action for this shop"));
    }

    const inventory = await Inventory.findOne({
        $and: [{ shopId: shop._id }, { _id:inventoryItemId }]
    });

    if (!inventory) {
        return next(new ApiError(400, "Inventory doesn't exist"));
    }
    const inventoryItem = await Inventory.findByIdAndDelete(inventory._id);
 

    if (!inventoryItem) {
        return next(new ApiError(404, "Inventory item not  Deleted"));
    }

    res.status(200).json(new ApiResponse(200, {}, "Inventory item deleted successfully"));

 });

export const getInventoryItems = asyncHandler(async (req, res, next) => {
    const shop = await Shop.findById(req.params.shopId);
    const resultPerPage = USER_RESULT_PER_PAGE;

    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unknown Shop"));
    }

    let apiFeatures = new ApiFeatures(Inventory.find({shopId:req.params.shopId}).sort({updatedAt : -1}),req.query)
    .searchInventory()
    .filter()

    let inventories = await apiFeatures.query;

    const inventoryFilteredCount = inventories.length;

    apiFeatures = new ApiFeatures(Inventory.find({shopId:req.params.shopId}).sort({updatedAt : -1}),req.query)
    .searchInventory()
    .filter()
    .pagination(resultPerPage);

    inventories = await apiFeatures.query;

    if(!inventories){
        return next(new ApiError(401,"Error in fetching tables"))
    }

    res.status(200).json(new ApiResponse(200, { inventories, resultPerPage, inventoryFilteredCount }, "Inventory retrieved successfully"));

});
