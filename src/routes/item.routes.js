import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js"
import { loginOwner, logoutOwner, registerOwner, verifyOwner } from "../controllers/user.controllers.js";
import { authoriseRoles, verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

    
export default router