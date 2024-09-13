import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { changeCurrentPassword, forgotPassword, getCurrentUser, loginOwner, logoutUser, registerOwner, resetPassword, updateAvatar, updateOwnerDetails, verifyUser } from "../controllers/user.controllers.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register-owner")
    .post(upload.single("avatar"),registerOwner)

router.route("/verify-user/:token")
    .put(verifyUser)

router.route("/login-owner")
    .post(loginOwner)

router.route("/logout")
    .get(verifyJWT, logoutUser)

router.route("/current-user")
    .get(verifyJWT, getCurrentUser)

router.route("/change-password")
    .put(verifyJWT, changeCurrentPassword)

router.route("/update-avatar")
    .put(verifyJWT,upload.single("avatar"),updateAvatar);

router.route("/update-profile")
    .put(verifyJWT,updateOwnerDetails);

router.route("/forgot-password")
    .post(forgotPassword)

router.route("/reset-password/:token")
    .put(resetPassword)
    
export default router