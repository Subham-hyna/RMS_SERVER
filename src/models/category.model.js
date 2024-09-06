import mongoose from "mongoose";

const categorieSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true,
        trim: true
    },
    noOfItems: {
        type: Number,
        default: 0
    },
    priority: {
        type: Number,
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }

})

export const Category = mongoose.model('Category',categorieSchema);