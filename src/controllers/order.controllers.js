import { Customer } from "../models/customer.model.js";
import { Kot } from "../models/kot.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Shop } from "../models/shop.model.js";
import { Table } from "../models/table.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// export const newOrder = asyncHandler(async(req,res,next) => {
//     let { cartItems, customerName, customerPhoneNo, tableNo, kotType,specialRequest, orderValue, totalOrderItems } = req.body;

//     const { shopId } = req.params;

//     if( !tableNo || !cartItems || !shopId || !orderValue || !totalOrderItems){
//         return next(new ApiError(400,"Fill all the details"))
//     }

//     const { userId } = req.query; 

//     if(cartItems.length === 0){
//         return next(new ApiError(400,"Add Items"))
//     }

//     const shopExist = await Shop.findById(shopId);

//     if(!shopExist){
//         return next(new ApiError(404,"Shop not found"));
//     }

//     if(userId){
//         //admin
//         const userExist = await User.findById(userId);

//         if(!userExist){
//             return next(new ApiError(404,"User not found"))
//         }

//         if(!kotType){
//             return next(new ApiError(400,"Fill all the details"))
//         }

//         if(kotType === "DINEIN"){
//             const tableExist = await Table.findOne({
//                 $and: [{shopId},{name:tableNo}]
//             })
        
//             if(!tableExist){
//                 return next(new ApiError(404,"Table not found"));
//             }

//         if(userExist.role === "OWNER"){    
//            if(shopExist.ownerId.toString() !== userExist._id.toString()){
//                 return next(new ApiError(400,"Unknown Shop"))
//             }
//         }
//         else{
//             if(userExist.employeeOf.toString() !== shopExist._id.toString()){
//                 return next(new ApiError(400,"Unknown Shop"))
//             }
//         }
        
//         let customerId ="";
//         if(customerPhoneNo){
//             let customerExist = await Customer.findOne({
//                 $and: [{ shopId }, { phoneNo:customerPhoneNo }]
//             })
            
//             if(!customerExist){
//                 customerExist = await Customer.create({
//                     name: customerName,
//                     phoneNo: customerPhoneNo,
//                     totalSpending: 0,
//                     shopId
//                 })
//             }
//             customerId = customerExist._id;
//         }

//         cartItems = cartItems.map((cartItem)=>({
//             ...cartItem,
//             itemId: cartItem.foodItemId,
//             shopId:shopId,
//             quantity: cartItem.qty
//         }))

//         const foodItems = await OrderItem.insertMany(cartItems)

//         const prevToken = await Kot.find({}).sort({createdAt: -1});

//         let tokenNo = 0;

//         if(prevToken.length === 0){
//             tokenNo = 1000;
//         }
//         else{
//             tokenNo = parseInt(prevToken[0].tokenNo) + 1;
//         }
        
//         const kot = await Kot.create({
//             tokenNo : tokenNo,
//             kotType,
//             items:foodItems,
//             status:"COOKING",
//             shopId,
//             specialRequest: specialRequest || "",
//             orderValue,
//             totalOrderItems,
//             tableId:tableExist._id
//         })

//         if(!kot){
//             return next(new ApiError(400,"KOT not generated"));
//         }

//         await Table.findByIdAndUpdate(
//             tableExist._id,
//             {
//                 isEmpty: false
//             },{
//                 new: true,
//                 runValidators: true
//             }
//             )

//         // kot.items = [...foodItems];
//         if(customerPhoneNo) kot.customerId = customerId;
//         await kot.save({validateBeforeSave: false});

//         res.status(201).json(
//             new ApiResponse(201,{},"KOT genearated successfully")
//         )
//         }
//         else{
//             if(userExist.role === "OWNER"){


//             if(!customerName || !customerPhoneNo){
//                 return next(new ApiError(400,"Please Enter Customer Details"))
//             }

//             let customerExist = await Customer.findOne({
//                 $and: [{ shopId }, { phoneNo:customerPhoneNo }]
//             })
    
//             if(!customerExist){
//                 customerExist = await Customer.create({
//                     name: customerName,
//                     phoneNo: customerPhoneNo,
//                     totalSpending: 0,
//                     shopId
//                 })
//             }

        
//             cartItems = cartItems.map((cartItem)=>({
//                 ...cartItem,
//                 itemId: cartItem.foodItemId,
//                 shopId:shopId,
//                 quantity: cartItem.qty
//             }))
    
//             const foodItems = await OrderItem.insertMany(cartItems)

//         const prevToken = await Kot.find({}).sort({createdAt: -1});

//         let tokenNo = 0;

//         if(prevToken.length === 0){
//             tokenNo = 1000;
//         }
//         else{
//             tokenNo = parseInt(prevToken[0].tokenNo) + 1;
//         }
        
//         const kot = await Kot.create({
//             tokenNo : tokenNo,
//             kotType,
//             items:foodItems,
//             status:"COOKING",
//             shopId,
//             specialRequest: specialRequest || "",
//             customerId: customerExist._id,
//             orderValue,
//             totalOrderItems
//         })

//         if(!kot){
//             return next(new ApiError(400,"KOT not generated"));
//         }

//         await kot.save({validateBeforeSave: false});

//         res.status(201).json(
//             new ApiResponse(201,{},"KOT genearated successfully")
//         )
    
//         } else {
//             return next(new ApiError(400,"Unauthorised role"))
//         }
//     }


//     } else {
//         //customer

//         if(!customerName || !customerPhoneNo){
//             return next(new ApiError(400,"Please Enter Details"))
//         }

//         const tableExist = await Table.findOne({
//             $and: [{shopId},{name:tableNo}]
//         })
    
//         if(!tableExist){
//             return next(new ApiError(404,"Table not found"));
//         }

//         let customerExist = await Customer.findOne({
//             $and: [{ shopId }, { phoneNo:customerPhoneNo }]
//         })

//         if(!customerExist){
//             customerExist = await Customer.create({
//                 name: customerName,
//                 phoneNo: customerPhoneNo,
//                 totalSpending: 0,
//                 shopId
//             })
//         }

//         cartItems = cartItems.map((cartItem)=>({
//             ...cartItem,
//             itemId: cartItem.foodItemId,
//             shopId:shopId,
//             quantity: cartItem.qty
//         }))

//         const foodItems = await OrderItem.insertMany(cartItems)

//         const prevToken = await Kot.find({}).sort({createdAt: -1});

//         let tokenNo = 0;

//         if(prevToken.length === 0){
//             tokenNo = 1000;
//         }
//         else{
//             tokenNo = parseInt(prevToken[0].tokenNo) + 1;
//         }
        
//         const kot = await Kot.create({
//             tokenNo : tokenNo,
//             kotType: "DINEIN",
//             items:foodItems,
//             status:"REQUESTED",
//             shopId,
//             specialRequest: specialRequest || "",
//             customerId: customerExist._id,
//             orderValue,
//             totalOrderItems,
//             tableId: tableExist._id
//         })

//         if(!kot){
//             return next(new ApiError(400,"KOT not generated"));
//         }

//         await kot.save({validateBeforeSave: false});

//         res.status(201).json(
//             new ApiResponse(201,{kot},"KOT genearated successfully")
//         )

//     }
// })

export const newOrder = asyncHandler(async (req, res, next) => {
    const { cartItems, customerName, customerPhoneNo, tableNo, kotType, specialRequest, orderValue, totalOrderItems } = req.body;
    const { shopId } = req.params;
    const { userId } = req.query;

    // Validate basic input
    if (!tableNo || !cartItems || !shopId || !orderValue || !totalOrderItems || cartItems.length === 0) {
        return next(new ApiError(400, "Please fill in all required details and add items to the cart."));
    }

    // Validate shop existence
    const shop = await Shop.findById(shopId);
    if (!shop) return next(new ApiError(404, "Shop not found"));

    let customer = null;
    let table = null;

    // Check if userId exists for admin/owner or employee validation
    if (userId) {
        const user = await User.findById(userId);
        if (!user) return next(new ApiError(404, "User not found"));

        // Check authorization for OWNER or EMPLOYEE roles
        const isOwner = user.role === "OWNER" && shop.ownerId.toString() === user._id.toString();
        const isEmployee = user.role !== "OWNER" && user.employeeOf.toString() === shop._id.toString();
        if (!isOwner && !isEmployee) return next(new ApiError(400, "Unauthorized role for this shop"));

        // Validate and retrieve table for DINEIN orders
        if (kotType === "DINEIN") {
            table = await Table.findOne({ shopId, name: tableNo });
            if (!table) return next(new ApiError(404, "Table not found"));
        }

        // Fetch or create customer if phone number is provided
        if (customerPhoneNo) {
            customer = await Customer.findOneAndUpdate(
                { shopId, phoneNo: customerPhoneNo },
                { $setOnInsert: { name: customerName, totalSpending: 0 } },
                { upsert: true, new: true }
            );
        }
    } else {
        // Customer order (not admin or employee)
        if (!customerName || !customerPhoneNo) return next(new ApiError(400, "Please enter customer details"));

        table = await Table.findOne({ shopId, name: tableNo });
        if (!table) return next(new ApiError(404, "Table not found"));

        customer = await Customer.findOneAndUpdate(
            { shopId, phoneNo: customerPhoneNo },
            { $setOnInsert: { name: customerName, totalSpending: 0 } },
            { upsert: true, new: true }
        );
    }

    // Prepare cart items for OrderItem model
    const formattedCartItems = cartItems.map(item => ({
        ...item,
        itemId: item.foodItemId,
        shopId,
        quantity: item.qty
    }));

    const foodItems = await OrderItem.insertMany(formattedCartItems);

    // Generate token number for new order
    const lastKot = await Kot.findOne({shopId:shop._id}).sort({ createdAt: -1 });
    const tokenNo = lastKot ? parseInt(lastKot.tokenNo) + 1 : 1000;

    // Create new KOT (Kitchen Order Ticket)
    const kotData = {
        tokenNo,
        kotType: kotType || "DINEIN",
        items: foodItems,
        status: userId ? "COOKING" : "REQUESTED",
        shopId,
        specialRequest: specialRequest || "",
        customerId: customer ? customer._id : undefined,
        orderValue,
        totalOrderItems,
        tableId: table ? table._id : undefined
    };

    const kot = await Kot.create(kotData);
    if (!kot) return next(new ApiError(400, "KOT not generated"));

    // Update table status if it's a dine-in order
    if (kotType === "DINEIN" && table) {
        await Table.findByIdAndUpdate(table._id, { isEmpty: false }, { new: true });
    }

    res.status(201).json(new ApiResponse(201, { kot }, "KOT generated successfully"));
});


export const getKots = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"));
    }

    let apiFeatures = new ApiFeatures(Kot.find({
        $and:[{shopId:req.params.shopId},{isExpired:false}]
    }).sort({createdAt :-1}).populate("tableId","name").populate("items","price quantity name").populate("customerId","name phoneNo")
,req.query)
    .searchOrder()
    .filter()

    const kots = await apiFeatures.query;

    res.status(201).json(
        new ApiResponse(201,{kots},"Kots fetched successfully")
    )
})

export const confirmKot = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const kotExist = await Kot.find({
        $and:[{_id:req.params.kotId},{isExpired:false}]
    });

    if(kotExist.length === 0 || kotExist[0].status !== "REQUESTED"){
        return next(new ApiError(404,"KOT not found"))
    }

    await Kot.findByIdAndUpdate(
        req.params.kotId,
        {
            status: "COOKING"
        },{
            new: true
        }
    )

    await Table.findByIdAndUpdate(
        kotExist[0].tableId,
        {
            isEmpty: false
        },{
            new: true,
            runValidators: true
        }
        )

    res.status(200).json(
        new ApiResponse(200,{},"kot confirmed")
    )

})

export const rejectKot = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const kotExist = await Kot.find({
        $and:[{_id:req.params.kotId},{isExpired:false}]
    });

    if(kotExist.length === 0 || kotExist[0].status !== "REQUESTED"){
        return next(new ApiError(404,"KOT not found"))
    }

    kotExist[0].items.forEach(async(i)=>{
        await OrderItem.findByIdAndDelete(i)
    })

    await Kot.findByIdAndDelete(
        req.params.kotId
    )

    res.status(200).json(
        new ApiResponse(200,{},"kot rejected")
    )

})

export const deleteKot = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const kotExist = await Kot.findOne({
        $and:[{_id:req.params.kotId},{isExpired:false}]
    });

    if(!kotExist){
        return next(new ApiError(404,"KOT not found"))
    }

    kotExist.items.forEach(async(i)=>{
        await OrderItem.findByIdAndDelete(i)
    })

    await Kot.findByIdAndDelete(
        req.params.kotId
        )

    const kotOfThatTable = await Kot.find({
        $and:[{tableId: kotExist.tableId},{isExpired: false}]
    })
        
    if(kotOfThatTable.length === 0) {
        await Table.findByIdAndUpdate(
            kotExist.tableId,
            {
                isEmpty: true
            },{
                new: true
            }
        )
    }


    res.status(200).json(
        new ApiResponse(200,{},"kot deleted")
    )

})

export const deleteOrderItem = asyncHandler(async(req,res,next)=>{
    const { kotId } = req.body;
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const orderItemExist = await OrderItem.findOne({
        $and:[{_id:req.params.orderItemId},{isPaid:false}]
    });

    if(!orderItemExist){
        return next(new ApiError(404,"Order Item not found"))
    }

    await OrderItem.findByIdAndDelete(orderItemExist._id)

    const kot = await Kot.findById(kotId);

    kot.orderValue = kot.orderValue - (orderItemExist.quantity * orderItemExist.price)
    kot.totalOrderItems = kot.totalOrderItems - orderItemExist.quantity
    console.log(kotId)
    if(kot.totalOrderItems === 0){
        await Kot.findByIdAndDelete(kotId)
        const kotOfThatTable = await Kot.find({
            $and:[{tableId: kot.tableId},{isExpired: false}]
        })
            
        if(kotOfThatTable.length === 0) {
            await Table.findByIdAndUpdate(
                kot.tableId,
                {
                    isEmpty: true
                },{
                    new: true
                }
            )
        }

    }else{
        await kot.save({validateBeforeSave: false})
    }


    res.status(200).json(
        new ApiResponse(200,{},"Item deleted")
    )

})

export const editOrderItem = asyncHandler(async(req,res,next)=>{
    const { quantity, kotId } = req.body;
    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const orderItemExist = await OrderItem.findOne({
        $and:[{_id:req.params.orderItemId},{isPaid:false}]
    });

    if(!orderItemExist){
        return next(new ApiError(404,"Order Item not found"))
    }

    let updatedOrderItem = {};
    if(quantity <= 0){
        await OrderItem.findByIdAndDelete(orderItemExist._id);
    }else{

     updatedOrderItem =  await OrderItem.findByIdAndUpdate(
        orderItemExist._id,
        {
            quantity
        },{
            new: true
        }
        )
    }

    const kot = await Kot.findById(kotId);

    kot.totalOrderItems = kot.totalOrderItems - orderItemExist.quantity + updatedOrderItem.quantity;
    kot.orderValue = kot.orderValue - (orderItemExist.quantity * orderItemExist.price) + (updatedOrderItem.quantity * updatedOrderItem.price)

    await kot.save({validateBeforeSave: false})

    res.status(200).json(
        new ApiResponse(200,{},"Item Quantity Updated")
    )

})

export const updateKotStatus = asyncHandler(async(req,res,next)=>{
    const {kotId} = req.params;

    const kot = await Kot.findOne({
        $and:[{_id:kotId},{isExpired:false},{status:"COOKING"}]
    })

    if(!kot){
        return next(new ApiError(404,"KOT not found"));
    }

    kot.status = "SERVED";

    await kot.save({validateBeforeSave:false});

    res.status(200).json(
        new ApiResponse(200,{},"Food Served")
    )
})

