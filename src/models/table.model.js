import mongoose from "mongoose";
import { tableShape } from "../constants.js";
const tablesSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true,
        required: true
    },
    areaId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Area'
    },
    noOfSeats: {
        type: Number
    },
    isEmpty:{
        type:Boolean,
        default: true
    },
    shape: {
        type: String,
        enum: tableShape
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }
});
export const Table = mongoose.model('Table', tablesSchema);
