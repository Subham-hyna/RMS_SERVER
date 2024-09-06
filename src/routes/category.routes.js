import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addCategory, deleteCategory, editCategory, getAllCategories } from "../controllers/category.controllers.js";

const router = Router();

router.route("/add-category/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addCategory);

router.route("/edit-category/:categoryId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editCategory);

router.route("/getMyCategories/:shopId")
    .get(getAllCategories);

router.route("/delete-category/:categoryId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteCategory);

export default router