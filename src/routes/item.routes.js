import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addItem, deleteItem, editItem, editItemCategory, getAllItems } from "../controllers/item.controllers.js";

const router = Router();

router.route("/add-item/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addItem);

router.route("/edit-item/:itemId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editItem);

router.route("/edit-itemCategory/:itemId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editItemCategory);

router.route("/getMyItems/:shopId")
    .get(getAllItems);

router.route("/delete-item/:itemId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteItem);


export default router