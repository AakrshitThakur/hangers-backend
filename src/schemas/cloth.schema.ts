import mongoose from "mongoose";
import { CLOTH_CATEGORIES } from "../constants/cloth.constants.js";
import { boolean } from "zod";

const clothSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
      minLength: 3,
      maxLength: 32,
    },
    isTop3: { type: boolean, default: false },
    images: [{ url: { type: String }, publicId: { type: String } }],
    category: { type: String, required: true, enum: CLOTH_CATEGORIES },
    actualPrice: { type: Number, required: true, min: 0 },
    discountedPrice: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

const Cloth = mongoose.model("Cloth", clothSchema);
export default Cloth;
