import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addShop, editShop, getMyShop, getMyShops } from "../controllers/shop.controllers.js";

const router = Router();

router.route("/add-shop")
    .post(verifyJWT,authoriseRoles("OWNER"),addShop);

router.route("/edit-shop/:shopId")
    .put(verifyJWT, authoriseRoles("OWNER"),editShop);

router.route("/getMyShops")
    .get(verifyJWT,authoriseRoles("OWNER"),getMyShops);

router.route("/getMyShop/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getMyShop);
    
export default router