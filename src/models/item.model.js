import mongoose from "mongoose";
const foodItemsSchema = new mongoose.Schema({

    name: {
        type: String
    },
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    },
    price: {
        type: Number
    },
    mealtype: {
        type: string,
        enum: ['veg', 'non-veg', 'eggs']
    },
    isAvailable: {
        type: Boolean
    },
    shortCode: {
        type: String
    },
    photo: {
        type: String
    },
    shopId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shop'
    }
});
const FoodItem = mongoose.model('FoodItem', foodItemsSchema);
export default FoodItem;