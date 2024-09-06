import mongoose from 'mongoose'
const customerSchema = new mongoose.Schema({
 
    name: {
        type: String
    },
    phoneNo: {
        type: String
    },
    email: {
        type: String
    },
    totalSpending: {
        type: Number
    },
    lastVisit: {
        type: Date
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'shops'
    }
});
const Customer = mongoose.model('Customer', customerSchema);
export default Customer;