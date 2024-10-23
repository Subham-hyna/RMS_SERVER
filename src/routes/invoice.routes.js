import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addInvoiceCharges, generateMultipleKotInvoice, generateSingleKotInvoice, getAllInvoices, getOneInvoice, invoiceSummary, paidInvoice } from "../controllers/invoice.controllers.js";

const router = Router();

router.route("/single-invoice/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),generateSingleKotInvoice)

router.route("/table-invoice/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),generateMultipleKotInvoice)

router.route("/pay-invoice/:invoiceId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),paidInvoice)

router.route("/add-charges/:invoiceId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),addInvoiceCharges)

router.route("/get-invoices/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAllInvoices)

router.route("/get-invoice/:invoiceId")
    .get(getOneInvoice)

router.route("/get-invoiceSummary/:startDate/:endDate/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),invoiceSummary)

export default router