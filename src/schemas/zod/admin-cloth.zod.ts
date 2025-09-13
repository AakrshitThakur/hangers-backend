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
      .max(3, "Cloth cannot contain more than 3 images"),
    category: z.preprocess(
      (val) => (typeof val === "string" ? val.trim().toLowerCase() : val),
      z.enum(CLOTH_CATEGORIES)
    ),
    actualPrice: z.preprocess((input) => {
      // Convert string to number
      if (typeof input === "string") {
        const parsed = Number(input);
        if (isNaN(parsed)) return undefined; // Fail validation if not a number
        return parsed;
      }
      return input; // pass through if already a number
    }, z.number().min(0, "Actual price must be greater than or equal to 0")),
    discountedPrice: z.preprocess((input) => {
      if (typeof input === "string") {
        const parsed = Number(input);
        if (isNaN(parsed)) return undefined;
        return parsed;
      }
      return input;
    }, z.number().min(0, "Discounted price must be greater than or equal to 0")),
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
    actualPrice: z.preprocess((input) => {
      // Convert string to number
      if (typeof input === "string") {
        const parsed = Number(input);
        if (isNaN(parsed)) return undefined; // Fail validation if not a number
        return parsed;
      }
      return input; // pass through if already a number
    }, z.number().min(0, "Actual price must be greater than or equal to 0").optional()),
    discountedPrice: z.preprocess((input) => {
      if (typeof input === "string") {
        const parsed = Number(input);
        if (isNaN(parsed)) return undefined;
        return parsed;
      }
      return input;
    }, z.number().min(0, "Discounted price must be greater than or equal to 0").optional()),
  })
  .strict();

export { validateAdminInsertCloth, validateAdminUpdateCloth };
