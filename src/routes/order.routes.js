import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { confirmKot, deleteKot, deleteOrderItem, editOrderItem, getKots, newOrder, rejectKot } from "../controllers/order.controllers.js";

const router = Router();

router.route("/new-order/:shopId")
    .post(newOrder)

router.route("/get-kots/:shopId")
    .get(verifyJWT,getKots)

router.route("/confirm-kot/:kotId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),confirmKot)

router.route("/reject-kot/:kotId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),rejectKot)

router.route("/delete-kot/:kotId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteKot)

router.route("/delete-orderItem/:orderItemId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),deleteOrderItem)

router.route("/edit-orderItem/:orderItemId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editOrderItem)

export default router