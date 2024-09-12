import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { generateMultipleKotInvoice, generateSingleKotInvoice, getAllInvoices, getOneInvoice, paidInvoice } from "../controllers/invoice.controllers.js";

const router = Router();

router.route("/single-invoice/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),generateSingleKotInvoice)

router.route("/table-invoice/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),generateMultipleKotInvoice)

router.route("/pay-invoice/:invoiceId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),paidInvoice)

router.route("/get-invoices/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAllInvoices)

router.route("/get-invoice/:invoiceId")
    .get(getOneInvoice)

export default router