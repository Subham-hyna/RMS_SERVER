import mongoose from 'mongoose';
import { KOT_STATUS, KOT_TYPE } from '../constants.js';
const kotSchema = new mongoose.Schema({

    tokenNo: {
        type: String,
        required: true
    },
    kotType: {
        type: String,
        enum: KOT_TYPE
    },
    items: [
        {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
        }
    ],
    status: {
        type: String,
        enum: KOT_STATUS
    },
    tableId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop',
        required: true
    },
    specialRequest: {
        type: String,
    },
    isExpired: {
        type: Boolean,
        default: false,
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    orderValue: {
        type: Number,
    },
    totalOrderItems: {
        type: Number,
    },
    invoiceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invoice'
    }

}, {
    timestamps: true,
})
export const Kot = mongoose.model('Kot', kotSchema);