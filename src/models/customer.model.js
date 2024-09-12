import mongoose from 'mongoose'

const customerSchema = new mongoose.Schema({
 
    name: {
        type: String
    },
    phoneNo: {
        type: String
    },
    totalSpending: {
        type: Number
    },
    lastVisited: {
        type: Date
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
});
export const Customer = mongoose.model('Customer', customerSchema);