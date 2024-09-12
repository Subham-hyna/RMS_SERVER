import mongoose from "mongoose";
import { INVENTORY_ITEM_STATUS } from "../constants.js";

const inventorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
    },
    quantityType: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: INVENTORY_ITEM_STATUS,
        default: 'AVAILABLE'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    }
},{
    timestamps: true
});

export const Inventory = mongoose.model('Inventory', inventorySchema);
