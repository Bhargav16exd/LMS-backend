import {Router} from "express";
import {upload} from "../middlewares/multer.middleware.js"
import { changeAvatar, changePassword, forgotPassword, login, logout, register, resetPassword, userProfile } from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// User Routes 

router.route("/register").post( upload.single("avatar"),register )
router.route("/login").post( login )
router.route("/forgot-password").post( forgotPassword )
router.route("/reset-password/:resetToken/").post( resetPassword )


//secured routes
router.route("/logout").post(authMiddleware,logout)
router.route("/getProfile").post(authMiddleware,userProfile)
router.route("/change-password").post(authMiddleware,changePassword)
router.route("/change-avatar").post(authMiddleware,upload.single("avatar"),changeAvatar)



export default router;
