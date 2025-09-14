import express from "express";
import { userClothGetAllController } from "../controllers/user/user-cloth.controllers.js";

const router = express.Router();

router.get("/all", userClothGetAllController);

export default router;
