import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addShop, editShop, getMyShops } from "../controllers/shop.controllers.js";

const router = Router();

router.route("/add-shop")
    .post(verifyJWT,authoriseRoles("OWNER"),addShop);

router.route("/edit-shop/:shopId")
    .put(verifyJWT, authoriseRoles("OWNER"),editShop);

router.route("/getMyShops")
    .get(verifyJWT,authoriseRoles("OWNER"),getMyShops);
    
export default router