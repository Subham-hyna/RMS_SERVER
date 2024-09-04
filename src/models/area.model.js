import mongoose from "mongoose";

const areaSchema = new mongoose.Schema({
 
    name: {
        type: String,
        required: true,
        trim: true
    },
    noOfTables: {
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
});

export const Area = mongoose.model('Area', areaSchema);