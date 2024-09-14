import mongoose from 'mongoose';
import { SHOP_STATUS, SHOP_TYPE } from '../constants.js';

const shopsSchema = new mongoose.Schema({
    name: {
        type: String
    },
    ownerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    phoneNo: {
        type: Number,
    },
    email: {
        type: String,
        required: true,
    },
    gstIn: {
        type: String,
        // unique: true
    },
    shopType: {
        type: String,
        enum: SHOP_TYPE
    },
    noOfemployees: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: SHOP_STATUS,
        default: "ACTIVE"
    },
    address: {
        line1: { 
         type: String,
         required: true
         },
        line2: { 
         type: String,
         required: true
         },
        pincode: { 
         type: String,
         required: true
         },
        state: { 
         type: String,
         required: true
         },
     },
},{
    timestamps: true
});

export const Shop = mongoose.model('Shop', shopsSchema);