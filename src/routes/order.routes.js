import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { confirmKot, getKots, newOrder, rejectKot } from "../controllers/order.controllers.js";

const router = Router();

router.route("/new-order/:shopId")
    .post(newOrder)

router.route("/get-kots/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getKots)

router.route("/confirm-kot/:kotId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),confirmKot)

router.route("/reject-kot/:kotId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),rejectKot)

export default router