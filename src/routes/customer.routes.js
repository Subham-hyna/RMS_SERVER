import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addCustomer, deleteCustomer, editCustomer, getAllCustomers } from "../controllers/customer.controllers.js";

const router = Router();

router.route("/add-customer/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addCustomer)

router.route("/edit-customer/:customerId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editCustomer)

router.route("/delete-customer/:customerId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteCustomer)

router.route("/get-customers/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAllCustomers)

export default router