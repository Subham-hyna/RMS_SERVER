import { USER_RESULT_PER_PAGE } from "../constants.js";
import { Customer } from "../models/customer.model.js";
import { Invoice } from "../models/invoice.model.js";
import { Kot } from "../models/kot.model.js";
import { OrderItem } from "../models/orderItem.model.js";
import { Shop } from "../models/shop.model.js";
import { Table } from "../models/table.model.js";
import { ApiError } from "../utils/apiError.js";
import { ApiFeatures } from "../utils/apiFeatures.js";
import { ApiResponse } from "../utils/apiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const generateSingleKotInvoice = asyncHandler(async(req,res,next) => {

    const { kotId } = req.body;

    if( !kotId ){
        return next(new ApiError(400,"Kot not found"))
    }

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
        
        const kot= await Kot.findOne({
            $and:[{_id:kotId},{isExpired:false}]
        });

        if(!kot){
            return next(new ApiError(400,"Kot Not found"))
        }
        
        if(shop._id.toString() !== kot.shopId.toString()){
            return next(new ApiError(400,"Unknown Shop"))
        }

        // if(kot.invoiceId){
        //     const invoice = await Invoice.findById(kot.invoiceId).populate("items","itemId price quantity name").populate("customerId","phoneNo")
        //     res.status(201).json(
        //         new ApiResponse(201,{invoice},"Invoice Generated")
        //     )
        //     return;
        // }

        const prevToken = await Invoice.find({}).sort({createdAt: -1});

        let tokenNo = 0;

        if(prevToken.length === 0){
            tokenNo = 3000;
        }
        else{
            tokenNo = parseInt(prevToken[0].invoiceNo) + 1;
        }

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


})

export const generateMultipleKotInvoice = asyncHandler(async(req,res,next) => {

    const { tableId } = req.body;
    const { shopId } = req.params;

    if( !tableId ){
        return next(new ApiError(400,"Table Not found"))
    }

    const shop = await Shop.findById(shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }
    
    const table= await Table.findOne({
        $and:[{_id:tableId},{isEmpty:false}]
    });

    if(!table){
        return next(new ApiError(400,"Table Not found"))
    }

    const kots = await Kot.find({
        $and:[{tableId},{status:"COOKING"},{shopId},{isExpired:false}]
    })

    // if(table.invoiceId){
    //     let invoice = await Invoice.findById(table.invoiceId).populate("items","itemId price quantity name").populate("customerId","phoneNo")
        
    //     for(let i=0;i<kots.length;i++){
    //         if(kots[i].invoiceId.toString() === table.invoiceId.toString()){
    //             continue;
    //         }
    //         invoice.totalPayment += kots[i].orderValue;
    //         invoice.totalItems += kots[i].totalOrderItems;
    //         invoice.items = [...invoice.items,...kots[i].items]

    //         await invoice.save({validateBeforeSave:false});

    //         await Kot.findByIdAndUpdate(
    //             kots[i]._id,
    //             {
    //                 invoiceId : invoice._id
    //             },
    //             { new: true}
    //         )
    //     }

    //     invoice = await Invoice.findById(table.invoiceId).populate("items","itemId price quantity name").populate("customerId","phoneNo")
        
    //     res.status(201).json(
    //         new ApiResponse(201,{invoice},"Invoice Generated")
    //     )


    //     return;
    // }

    const prevToken = await Invoice.find({}).sort({createdAt: -1});

    let tokenNo = 0;
    
    if(prevToken.length === 0){
        tokenNo = 3000;
    }
    else{
        tokenNo = parseInt(prevToken[0].invoiceNo) + 1;
    }

    let totalItems = 0;
    let totalPayment = 0;
    let items = [];

    kots.forEach((k)=>{
        totalItems += k.totalOrderItems;
        totalPayment += k.orderValue;
        items = [...items,...k.items];
    })

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

    
    kots.forEach(async(kot)=>{
        await Kot.findByIdAndUpdate(
            kot._id,
            {
                invoiceId : invoice._id
            },
            { new: true}
        )
    })

    await Table.findByIdAndUpdate(
        tableId,
        {
            invoiceId: invoice._id
        },{
            new: true
        }
    )

    invoice = await Invoice.findById(invoice._id).populate("items","itemId price quantity name").populate("customerId","name phoneNo")

    res.status(201).json(
        new ApiResponse(201,{invoice},"Invoice Generated")
    )

})

export const paidInvoice = asyncHandler(async(req,res,next) => {
    const { paymentMode, amountReceived } = req.body;
    const{ invoiceId } = req.params;

    if( !paymentMode ){
        return next(new ApiError(400,"Fill Payment mode"))
    }

    const shop = await Shop.findById(req.params.shopId);

    if(!shop){
        return next(new ApiError(400,"Shop doen't exist"))
    }

    if(shop.ownerId.toString() !== req.user._id.toString()){
        return next(new ApiError(400,"Unknown Shop"))
    }

    const invoice = await Invoice.findById(invoiceId)

    if(!invoice){
        return next(new ApiError(400,"Invoice not found"))
    }

    invoice.items.forEach(async(i)=>{
        await OrderItem.findByIdAndUpdate(
            i,
            {
                isPaid: true
            },
            {
                new: true
            }
        )
    })

    const kots = await Kot.find({
        $and:[{shopId:req.params.shopId},{isExpired:false},{invoiceId:invoice._id}]
    })

    kots.forEach(async(kot)=>{
        await Kot.findByIdAndUpdate(
            kot._id,
            {
                status: "SERVED",
                isExpired: true
            },{
                new: true
            }
        )

        await Table.findByIdAndUpdate(
            kot.tableId,
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
    })

    if(invoice.customerId){
        const customer = await Customer.findById(invoice.customerId);

        if(!customer){
            return next(new ApiError(404,"Customer not found"))
        }
        customer.totalSpending = customer.totalSpending + invoice.totalPayment
        customer.lastVisited = Date.now();

        await customer.save({validateBeforeSave:false});
    }

    invoice.isPaid = true;
    invoice.paymentMode = paymentMode;
    if(invoice.totalPayment > amountReceived){
        invoice.discount = invoice.totalPayment - amountReceived;
        invoice.totalPayment = amountReceived
    }

    await invoice.save({validateBeforeSave:false});

    res.status(201).json(
        new ApiResponse(200,{},"Bill Paid")
    )

})

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
        $and:[{_id:invoiceId},{isPaid:true}]
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

    if(!startDate || !endDate) {
        return next(new ApiError(400, "Dates not provided"))
    }
  
    const shop = await Shop.findById(req.params.shopId);
  
    if (!shop) {
      return next(new ApiError(400, "Shop doesn't exist"));
    }
  
    if (shop.ownerId.toString() !== req.user._id.toString()) {
      return next(new ApiError(400, "Unknown Shop"));
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
  