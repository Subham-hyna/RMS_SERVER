import { USER_RESULT_PER_PAGE } from "../constants.js";
import { Customer } from "../models/customer.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Kot } from "../models/kot.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Shop } from "../models/shop.model.js";
import { Table } from "../models/table.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

// export const generateSingleKotInvoice = asyncHandler(async(req,res,next) => {

//     const { kotId } = req.body;

//     if( !kotId ){
//         return next(new ApiError(400,"Kot not found"))
//     }

//     const shop = await Shop.findById(req.params.shopId);

//     if(!shop){
//         return next(new ApiError(400,"Shop doen't exist"))
//     }

//     if(shop.ownerId.toString() !== req.user._id.toString()){
//         return next(new ApiError(400,"Unknown Shop"))
//     }
        
//         const kot= await Kot.findOne({
//             $and:[{_id:kotId},{isExpired:false}]
//         });

//         if(!kot){
//             return next(new ApiError(400,"Kot Not found"))
//         }
        
//         if(shop._id.toString() !== kot.shopId.toString()){
//             return next(new ApiError(400,"Unknown Shop"))
//         }

//         // if(kot.invoiceId){
//         //     const invoice = await Invoice.findById(kot.invoiceId).populate("items","itemId price quantity name").populate("customerId","phoneNo")
//         //     res.status(201).json(
//         //         new ApiResponse(201,{invoice},"Invoice Generated")
//         //     )
//         //     return;
//         // }

//         const prevToken = await Invoice.find({}).sort({createdAt: -1});

//         let tokenNo = 0;

//         if(prevToken.length === 0){
//             tokenNo = 3000;
//         }
//         else{
//             tokenNo = parseInt(prevToken[0].invoiceNo) + 1;
//         }

//         let invoice = await Invoice.create({
//             invoiceNo: tokenNo,
//             totalItems: kot.totalOrderItems,
//             totalPayment: kot.orderValue,
//             items: kot.items,
//             shopId: req.params.shopId
//         })
//         if(kot.customerId) invoice.customerId = kot.customerId;
//         await invoice.save({validateBeforeSave: false});

//         await Kot.findByIdAndUpdate(
//             kot._id,
//             {
//                 invoiceId : invoice._id
//             },
//             { new: true}
//         )

//         invoice = await Invoice.findById(invoice._id).populate("items","itemId price quantity name").populate("customerId","name phoneNo")

//         res.status(201).json(
//             new ApiResponse(201,{invoice},"Invoice Generated")
//         )


// })

export const generateSingleKotInvoice = asyncHandler(async (req, res, next) => {
    const { kotId } = req.body;

    // Early return if kotId is missing
    if (!kotId) {
        return next(new ApiError(400, "KOT ID not found"));
    }

    // Fetch the shop and validate ownership
    const shop = await Shop.findById(req.params.shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unauthorized Shop"));
    }

    // Fetch the KOT in a single query and validate shop ownership
    const kot = await Kot.findOne({ _id: kotId, isExpired: false, shopId: shop._id });
    if (!kot) {
        return next(new ApiError(400, "KOT not found or unauthorized for this shop"));
    }

    // Check if an invoice already exists for the KOT
    // if (kot.invoiceId) {
    //     const existingInvoice = await Invoice.findById(kot.invoiceId)
    //         .populate("items", "itemId price quantity name")
    //         .populate("customerId", "phoneNo");
        
    //     return res.status(200).json(
    //         new ApiResponse(200, { invoice: existingInvoice }, "Invoice already exists")
    //     );
    // }

    // Retrieve last invoice's tokenNo only, to generate a new token number
    const lastInvoice = await Invoice.findOne({shopId:shop._id,isPaid:true}).sort({ createdAt: -1 }).select("invoiceNo");
    const tokenNo = lastInvoice ? parseInt(lastInvoice.invoiceNo) + 1 : 3000;

    // Create a new invoice
    let invoice = await Invoice.create({
                    invoiceNo: tokenNo,
                    totalItems: kot.totalOrderItems,
                    totalPayment: kot.orderValue,
                    items: kot.items,
                    shopId: req.params.shopId
                })
                if(kot.customerId) invoice.customerId = kot.customerId;
                await invoice.save({validateBeforeSave: false});
        
                await Kot.findByIdAndUpdate(
                    kot._id,
                    {
                        invoiceId : invoice._id
                    },
                    { new: true}
                )
        
                invoice = await Invoice.findById(invoice._id).populate("items","itemId price quantity name").populate("customerId","name phoneNo")
        
                res.status(201).json(
                    new ApiResponse(201,{invoice},"Invoice Generated")
                )
});


// export const generateMultipleKotInvoice = asyncHandler(async(req,res,next) => {

//     const { tableId } = req.body;
//     const { shopId } = req.params;

//     if( !tableId ){
//         return next(new ApiError(400,"Table Not found"))
//     }

//     const shop = await Shop.findById(shopId);

//     if(!shop){
//         return next(new ApiError(400,"Shop doen't exist"))
//     }

//     if(shop.ownerId.toString() !== req.user._id.toString()){
//         return next(new ApiError(400,"Unknown Shop"))
//     }
    
//     const table= await Table.findOne({
//         $and:[{_id:tableId},{isEmpty:false}]
//     });

//     if(!table){
//         return next(new ApiError(400,"Table Not found"))
//     }

//     const kots = await Kot.find({
//         $and:[{tableId},{status:"COOKING"},{shopId},{isExpired:false}]
//     })

//     const prevToken = await Invoice.find({}).sort({createdAt: -1});

//     let tokenNo = 0;
    
//     if(prevToken.length === 0){
//         tokenNo = 3000;
//     }
//     else{
//         tokenNo = parseInt(prevToken[0].invoiceNo) + 1;
//     }

//     let totalItems = 0;
//     let totalPayment = 0;
//     let items = [];

//     kots.forEach((k)=>{
//         totalItems += k.totalOrderItems;
//         totalPayment += k.orderValue;
//         items = [...items,...k.items];
//     })

//     let invoice = await Invoice.create({
//         invoiceNo: tokenNo,
//         totalItems,
//         totalPayment,
//         items,
//         shopId: req.params.shopId
//     })

//     kots.forEach((k)=>{
//         if(k.customerId) invoice.customerId = k.customerId;
//         return
//     })
//     await invoice.save({validateBeforeSave: false});

    
//     kots.forEach(async(kot)=>{
//         await Kot.findByIdAndUpdate(
//             kot._id,
//             {
//                 invoiceId : invoice._id
//             },
//             { new: true}
//         )
//     })

//     await Table.findByIdAndUpdate(
//         tableId,
//         {
//             invoiceId: invoice._id
//         },{
//             new: true
//         }
//     )

//     invoice = await Invoice.findById(invoice._id).populate("items","itemId price quantity name").populate("customerId","name phoneNo")

//     res.status(201).json(
//         new ApiResponse(201,{invoice},"Invoice Generated")
//     )

// })

export const generateMultipleKotInvoice = asyncHandler(async (req, res, next) => {
    const { tableId } = req.body;
    const { shopId } = req.params;

    // Validate input and shop existence
    if (!tableId) {
        return next(new ApiError(400, "Table Not found"));
    }

    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unauthorized Shop"));
    }

    // Validate and fetch table
    const table = await Table.findOne({ _id: tableId, isEmpty: false });
    if (!table) {
        return next(new ApiError(400, "Table Not found or is empty"));
    }

    // Retrieve all active KOTs for the specified table
    const kots = await Kot.find({
        tableId,
        status: "COOKING",
        shopId,
        isExpired: false
    });

    if (kots.length === 0) {
        return next(new ApiError(400, "No active KOTs found for this table"));
    }

    // Generate token number based on the last invoice
    const lastInvoice = await Invoice.findOne({ shopId, isPaid: true })
        .sort({ createdAt: -1 })
        .select("invoiceNo");
    const tokenNo = lastInvoice ? parseInt(lastInvoice.invoiceNo) + 1 : 3000;

    // Calculate total items, total payment, and collect items from KOTs
    let totalItems = 0;
    let totalPayment = 0;
    const items = kots.reduce((acc, k) => {
        totalItems += k.totalOrderItems;
        totalPayment += k.orderValue;
        return acc.concat(k.items);
    }, []);

    // Create and save invoice with populated items and total values
    let invoice = await Invoice.create({
        invoiceNo: tokenNo,
        totalItems,
        totalPayment,
        items,
        shopId: req.params.shopId
    })

    kots.forEach((k)=>{
        if(k.customerId) invoice.customerId = k.customerId;
        return
    })
    await invoice.save({validateBeforeSave: false});

    // Update all KOTs to reference the new invoice
    await Kot.updateMany(
        { _id: { $in: kots.map((kot) => kot._id) } },
        { invoiceId: invoice._id }
    );

    // Link the invoice to the table
    await Table.findByIdAndUpdate(tableId, { invoiceId: invoice._id });

    // Populate invoice data with related item and customer information
    const populatedInvoice = await Invoice.findById(invoice._id)
        .populate("items", "itemId price quantity name")
        .populate("customerId", "name phoneNo");

    res.status(201).json(
        new ApiResponse(201, { invoice: populatedInvoice }, "Invoice Generated")
    );
});


// export const paidInvoice = asyncHandler(async(req,res,next) => {
//     const { paymentMode, amountReceived } = req.body;
//     const{ invoiceId } = req.params;

//     if( !paymentMode ){
//         return next(new ApiError(400,"Fill Payment mode"))
//     }

//     const shop = await Shop.findById(req.params.shopId);

//     if(!shop){
//         return next(new ApiError(400,"Shop doen't exist"))
//     }

//     if(shop.ownerId.toString() !== req.user._id.toString()){
//         return next(new ApiError(400,"Unknown Shop"))
//     }

//     const invoice = await Invoice.findById(invoiceId)

//     if(!invoice){
//         return next(new ApiError(400,"Invoice not found"))
//     }

//     invoice.items.forEach(async(i)=>{
//         await OrderItem.findByIdAndUpdate(
//             i,
//             {
//                 isPaid: true
//             },
//             {
//                 new: true
//             }
//         )
//     })

//     const kots = await Kot.find({
//         $and:[{shopId:req.params.shopId},{isExpired:false},{invoiceId:invoice._id}]
//     })

//     kots.forEach(async(kot)=>{
//         await Kot.findByIdAndUpdate(
//             kot._id,
//             {
//                 status: "SERVED",
//                 isExpired: true
//             },{
//                 new: true
//             }
//         )

//         await Table.findByIdAndUpdate(
//             kot.tableId,
//             {
//                 isEmpty: true,
//                 $unset:{
//                     invoiceId: 1
//                 }
//             },
//             {
//                 new: true
//             }
//         )
//     })

//     if(invoice.customerId){
//         const customer = await Customer.findById(invoice.customerId);

//         if(!customer){
//             return next(new ApiError(404,"Customer not found"))
//         }
//         customer.totalSpending = customer.totalSpending + invoice.totalPayment
//         customer.lastVisited = Date.now();

//         await customer.save({validateBeforeSave:false});
//     }

//     invoice.isPaid = true;
//     invoice.paymentMode = paymentMode;
//     if(invoice.totalPayment > amountReceived){
//         invoice.discount = invoice.totalPayment - amountReceived;
//         invoice.totalPayment = amountReceived
//     }

//     await invoice.save({validateBeforeSave:false});

//     res.status(201).json(
//         new ApiResponse(200,{},"Bill Paid")
//     )

// })

export const paidInvoice = asyncHandler(async (req, res, next) => {
    const { paymentMode, amountReceived } = req.body;
    const { invoiceId, shopId } = req.params;

    // Validate payment mode
    if (!paymentMode) {
        return next(new ApiError(400, "Please specify payment mode"));
    }

    // Validate shop and ownership
    const shop = await Shop.findById(shopId);
    if (!shop) {
        return next(new ApiError(400, "Shop doesn't exist"));
    }
    if (shop.ownerId.toString() !== req.user._id.toString()) {
        return next(new ApiError(400, "Unauthorized access to shop"));
    }

    // Retrieve the invoice and validate existence
    const invoice = await Invoice.findById(invoiceId);
    if (!invoice) {
        return next(new ApiError(400, "Invoice not found"));
    }

    // Batch update all items in the invoice to mark as paid
    await OrderItem.updateMany(
        { _id: { $in: invoice.items } },
        { isPaid: true }
    );

    // Retrieve active KOTs linked to the invoice and update them
    const kots = await Kot.find({ shopId, isExpired: false, invoiceId: invoice._id });
    const tableIds = kots.map(kot => kot.tableId);

    await Kot.updateMany(
        { _id: { $in: kots.map(kot => kot._id) } },
        { status: "SERVED", isExpired: true }
    );

    // Update tables associated with the KOTs to empty and clear invoice reference
    await Table.findByIdAndUpdate(
                    kots[0].tableId,
                    {
                        isEmpty: true,
                        $unset:{
                            invoiceId: 1
                        }
                    },
                    {
                        new: true
                    }
                )

    // Update customer information if linked to the invoice
    if (invoice.customerId) {
        await Customer.findByIdAndUpdate(
            invoice.customerId,
            {
                $inc: { totalSpending: invoice.totalPayment },
                lastVisited: Date.now()
            },
            { new: true, validateBeforeSave: false }
        );
    }

    // Adjust invoice with payment details and discount if applicable
    invoice.isPaid = true;
    invoice.paymentMode = paymentMode;
    if (invoice.totalPayment > amountReceived) {
        invoice.discount = invoice.totalPayment - amountReceived;
        invoice.totalPayment = amountReceived;
    }

    await invoice.save({ validateBeforeSave: false });

    res.status(200).json(new ApiResponse(200, {}, "Bill Paid"));
});


export const getAllInvoices = asyncHandler(async(req,res,next)=>{
    const shop = await Shop.findById(req.params.shopId);
const resultPerPage = USER_RESULT_PER_PAGE;

if (!shop) {
    return next(new ApiError(400, "Shop doesn't exist"));
}

if (shop.ownerId.toString() !== req.user._id.toString()) {
    return next(new ApiError(400, "Unknown Shop"));
}

let { startDate, endDate } = req.query;

startDate = startDate !== (undefined || "") ? new Date(startDate) : new Date(shop.createdAt)
endDate = endDate !== (undefined || "") ? new Date(endDate) : new Date(Date.now())

if(startDate > endDate){
    return next(new ApiError(400, "Invalid Date Range"));
}


let dateFilter = {};
if (startDate && endDate) {
    dateFilter = {
        createdAt: {
            $gte: startDate, 
            $lt: endDate
        }
    };
}


let apiFeatures = new ApiFeatures(Invoice.find({
        $and: [{shopId: req.params.shopId},
        {isPaid: true},
        dateFilter]
}).find().sort({ createdAt: -1 })
  .populate("items", "price quantity name")
  .populate("customerId", "name phoneNo"), req.query)
    .searchInvoice()
    .filter();

let invoices = await apiFeatures.query;

const invoiceFilteredCount = invoices.length;

apiFeatures = new ApiFeatures(Invoice.find({
        $and: [{shopId: req.params.shopId},
        {isPaid: true},
        dateFilter]
}).sort({ createdAt: -1 })
  .populate("items", "price quantity name")
  .populate("customerId", "name phoneNo"), req.query)
    .searchInvoice()
    .filter()
    .pagination(resultPerPage);

invoices = await apiFeatures.query;

res.status(200).json(new ApiResponse(200, { invoices, resultPerPage, 
    invoiceFilteredCount 
}, "Invoices retrieved successfully"));

})

export const getOneInvoice = asyncHandler(async(req,res,next)=>{
    const{ invoiceId } = req.params;

    const invoice = await Invoice.findOne({
        $and:[{_id:invoiceId}]
    }).populate("items","price quantity name").populate("customerId","name phoneNo").populate("shopId","name gstIn phoneNo address")

    if(!invoice){
        return next(new ApiError(404,"Invoice not found"));
    }

    res.status(200).json(
        new ApiResponse(200,{invoice},"Invoice Fetched Successfully")
    )
})

export const addInvoiceCharges = asyncHandler(async(req,res,next)=>{
    const { deliveryCharges, packingFee, discount } = req.body;

    const { invoiceId } = req.params;

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const invoiceExist = await Invoice.findById(invoiceId);

    if(!invoiceExist){
        return next(new ApiError(404,"Invoice Not Found"));
    }

    invoiceExist.totalPayment = (invoiceExist.totalPayment - invoiceExist.deliveryCharges - invoiceExist.packingFee + invoiceExist.discount) + parseInt(packingFee) + parseInt(deliveryCharges) - discount;
    invoiceExist.deliveryCharges = deliveryCharges || 0;
    invoiceExist.packingFee = packingFee || 0;
    invoiceExist.discount = discount || 0;

    await invoiceExist.save({validateBeforeSave: false});

    const invoice = await Invoice.findById(invoiceId).populate("items","name price quantity")

    res.status(200).json(
        new ApiResponse(200,{invoice},"Charges Added")
    )
})

export const invoiceSummary = asyncHandler(async (req, res, next) => {
    const { startDate, endDate } = req.params;
    const { password } = req.body;

    if(!startDate || !endDate || !password) {
        return next(new ApiError(400, "Dates and Password not provided"))
    }
  
    const shop = await Shop.findById(req.params.shopId);
  
    if (!shop) {
      return next(new ApiError(400, "Shop doesn't exist"));
    }
  
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(400, "Unknown Shop"));
    }

    const user = await User.findById(req.user._id).select("+password");

    const isPasswordValid = await user.isPasswordCorrect(password);

    if(!isPasswordValid){
        return next(new ApiError(400,"Invalid user credentials"));
    }
    
    const invoiceSummary = {};

    const invoiceTotal = await Invoice.aggregate([
      {
        "$match": {
          "$and": [
            { "createdAt": { "$gte": new Date(startDate), "$lt": new Date(endDate) } },
            { "isPaid": true },
            { "shopId": shop._id }
          ]
        }
      },
      {
        "$group": {
          "_id": null,
          "totalPaymentSum": { "$sum": "$totalPayment" },
          "totalInvoice": { "$sum": 1 }
        }
      }
    ]);


    if(invoiceTotal.length === 0){
        return next(new ApiError(400,"No Invoices"))
    }

    invoiceSummary.totalAmount = invoiceTotal[0].totalPaymentSum
    invoiceSummary.totalInvoice = invoiceTotal[0].totalInvoice

    const invoicePaymentMode = await Invoice.aggregate([
        {
          "$match": {
            "$and": [
                { "createdAt": { "$gte": new Date(startDate), "$lt": new Date(endDate) } },
              { "isPaid": true },
              { "shopId": shop._id }
            ]
          }
        },
        {
          "$group": {
            "_id": "$paymentMode",
            "totalPaymentSum": { "$sum": "$totalPayment" },
            "totalInvoice": { "$sum": 1 }
          }
        },
        {
          "$project": {
            "paymentMode": "$_id",
            "totalPaymentSum": 1,
            "totalInvoice": 1
          }
        },{
            "$sort" : {
                "totalInvoice" : -1
            }
        }
      ])

      invoiceSummary.paymentMode = invoicePaymentMode
  
    res.status(200).json(
      new ApiResponse(200, { invoiceSummary }, "Invoice Summary Generated")
    );
  });
  