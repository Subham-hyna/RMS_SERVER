import mongoose from "mongoose";
const invoiceSchema = new mongoose.Schema({
    invoiceNo: {
        type: String,
        required: true
    },
    totalItems: {
        type: Number,
        required: true
    },
    totalPayment: {
        type: Number,
        required: true
    },
    isPaid:{
        type: Boolean,
        required: true,
        default: false
    },
    paymentMode: {
        type: String
    },
    items: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem'
    }],
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Customer'
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
},{
    timestamps: true
});
export const Invoice = mongoose.model('Invoice', invoiceSchema);
