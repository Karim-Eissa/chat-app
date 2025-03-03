import express from "express";
import authController from "../controllers/auth.controller.js";
import {protectRoute} from "../middleware/auth.middleware.js"
const router=express.Router();
router.post("/signup", authController.signup_post)
router.post("/login", authController.login_post)
router.post("/logout", authController.logout_post)
router.put("/update-profile", protectRoute,authController.updateProfile_put)
router.get("/check",protectRoute,authController.checkAuth_get)
router.get("/verify/:token", authController.verifyEmail_get);
export default router;