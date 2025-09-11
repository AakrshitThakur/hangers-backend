import mongoose from "mongoose";
import { CLOTH_CATEGORIES } from "../constants/cloth.constants.js";

const clothSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 32,
    },
    images: [{ type: String }],
    category: { type: String, required: true, enum: CLOTH_CATEGORIES },
    actualPrice: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Cloth = mongoose.model("Cloth", clothSchema);
export default Cloth;
