import { z } from "zod";
import { CLOTH_CATEGORIES } from "../../constants/cloth.constants.js";

// validation on inserting a new cloth
const validateAdminInsertCloth = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(32, "Username cannot be more than 32 characters long"),
    images: z
      .string()
      .array()
      .min(1, "Cloth must contain at least an image")
      .max(3, "Cloth cannot contain more than 3 images"),
    category: z.preprocess(
      (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
      z.enum(CLOTH_CATEGORIES)
    ),
    actualPrice: z
      .number()
      .min(0, "Actual price must be greater than or equal to 0"),
    discountedPrice: z
      .number()
      .min(0, "Actual price must be greater than or equal to 0"),
  })
  .strict();

// validation on updating a cloth
const validateAdminUpdateCloth = z
  .object({
    title: z
      .string()
      .trim()
      .min(3, "Username must be at least 3 characters long")
      .max(32, "Username cannot be more than 32 characters long")
      .optional(),
    images: z
      .string()
      .array()
      .min(1, "Cloth must contain at least an image")
      .max(3, "Cloth cannot contain more than 3 images")
      .optional(),
    category: z.preprocess(
      (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
      z.enum(CLOTH_CATEGORIES).optional()
    ),
    actualPrice: z
      .number()
      .min(0, "Actual price must be greater than or equal to 0")
      .optional(),
    discountedPrice: z
      .number()
      .min(0, "Actual price must be greater than or equal to 0")
      .optional(),
  })
  .strict();

export { validateAdminInsertCloth, validateAdminUpdateCloth };
