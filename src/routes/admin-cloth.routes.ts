import express from "express";
import type { Request, Response } from "express";
import { adminAuthMiddleware } from "../middlewares/admin-auth.middlewares.js";
import {
  adminClothInsertController,
  adminClothGetAllController,
  adminClothDeleteController,
  adminClothUpdateController,
} from "../controllers/admin/admin-cloth.controllers.js";

const router = express.Router();

// get all or filtered clothes
router.get("/all", adminAuthMiddleware, adminClothGetAllController);

// create a new cloth
router.post("/create", adminAuthMiddleware, adminClothInsertController);

// delete a cloth
router.delete(
  "/:clothId/delete",
  adminAuthMiddleware,
  adminClothDeleteController
);

// update a cloth
router.patch(
  "/:clothId/update",
  adminAuthMiddleware,
  adminClothUpdateController
);

export default router;
