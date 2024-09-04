import { Router } from "express";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";
import { addArea, deleteArea, editArea, getAllAreas, getAreaById } from "../controllers/area.controllers.js";

const router = Router();

router.route("/add-area/:shopId")
    .post(verifyJWT,authoriseRoles("OWNER"),addArea);

router.route("/edit-area/:areaId/:shopId")
    .put(verifyJWT,authoriseRoles("OWNER"),editArea);

router.route("/getMyAreas/:shopId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAllAreas);

router.route("/get-area/:areaId")
    .get(verifyJWT,authoriseRoles("OWNER"),getAreaById)

router.route("/delete-area/:areaId/:shopId")
    .delete(verifyJWT,authoriseRoles("OWNER"),deleteArea);

export default router