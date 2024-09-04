import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { loginOwner, logoutOwner, registerOwner, verifyOwner } from "../controllers/user.controllers.js";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-owner")
    .post(upload.single("avatar"),registerOwner)

router.route("/verify-owner/:token")
    .put(verifyOwner)

router.route("/login-owner")
    .post(loginOwner)

router.route("/logout-owner")
    .get(verifyJWT, logoutOwner)
    
export default router