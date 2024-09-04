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
    shape: {
        type: String,
        enum: tableShape
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
});
export const Table = mongoose.model('Table', tablesSchema);
