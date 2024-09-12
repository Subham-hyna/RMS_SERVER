import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addTable, deleteTable, editTable, editTableArea, getAllTables, tableExistInShop } from "../controllers/table.controllers.js";

const router = Router();

router.route("/add-table/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addTable);

router.route("/edit-table/:tableId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editTable);

router.route("/edit-tableArea/:tableId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editTableArea);

router.route("/getMyTables/:shopId")
    .get(verifyJWT,getAllTables);

router.route("/delete-table/:tableId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteTable);

router.route("/table-exist/:tableNo/:shopId")
    .get(tableExistInShop)

export default router