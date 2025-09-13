import express from "express";
import { adminAuthMiddleware } from "../middlewares/admin-auth.middlewares.js";
import { uploadClothImages } from "../middlewares/multer.js";
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
router.post(
  "/create",
  adminAuthMiddleware,
  uploadClothImages.array("clothImages", 3),
  adminClothInsertController
);

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
  uploadClothImages.array("clothImages", 3),
  adminClothUpdateController
);

export default router;
