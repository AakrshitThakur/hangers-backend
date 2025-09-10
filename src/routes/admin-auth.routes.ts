import express from "express";
import {
  adminSignupController,
  adminSigninController,
  adminSignoutController,
} from "../controllers/admin/admin-auth.controllers.js";

const router = express.Router();

router.post("/signup", adminSignupController);
router.post("/signin", adminSigninController);
router.post("/signout", adminSignoutController);

export default router;
