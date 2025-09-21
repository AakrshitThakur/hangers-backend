import express from "express";
import { adminAuthMiddleware } from "../middlewares/admin-auth.middlewares.js";
import {
  adminSignupController,
  adminSigninController,
  adminSignoutController,
  adminIsAuthenticatedController,
} from "../controllers/admin/admin-auth.controllers.js";

const router = express.Router();

router.post("/signup", adminSignupController);
router.post("/signin", adminSigninController);
router.post("/signout", adminSignoutController);
router.get(
  "/is-authenticated",
  adminAuthMiddleware,
  adminIsAuthenticatedController
);

export default router;
