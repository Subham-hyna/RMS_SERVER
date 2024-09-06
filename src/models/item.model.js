import mongoose from "mongoose";
import { veg_nonNeg } from "../constants.js";

const itemSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: {
        type: Number,
        required: true
    },
    mealType: {
        type: String,
        enum: veg_nonNeg,
        required: true
    },
    isAvailable: {
        type: Boolean,
        default: true
    },
    shortCode: {
        type: String,
    },
    isStar: {
        type: Boolean,
        default: false
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
});

export const Item = mongoose.model('Item', itemSchema);