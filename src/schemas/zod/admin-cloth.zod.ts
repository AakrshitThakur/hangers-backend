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
    isTop3: z.preprocess((input) => {
      if (typeof input === "string" && input.toLowerCase().trim() === "true") {
        return true;
      }
      return false;
    }, z.boolean().optional()),
    images: z
      .array(
        z.object({
          url: z.string(),
          publicId: z.string(),
        })
      )
      .max(3, "Cloth cannot contain more than 3 images")
      .optional(),
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
    isTop3: z.preprocess((input) => {
      if (typeof input === "string" && input.toLowerCase().trim() === "true") {
        return true;
      }
      return false;
    }, z.boolean().optional()),
    images: z
      .array(
        z.object({
          url: z.string(),
          publicId: z.string(),
        })
      )
      .max(3, "Cloth cannot contain more than 3 images")
      .optional(),
    // publicIds: z
    //   .array(z.string())
    //   .max(3, "Cloth cannot delete more than 3 cloth images")
    //   .optional(),
    publicIds: z
      .union([z.string(), z.array(z.string())])
      .transform((val) => (typeof val === "string" ? [val] : val))
      .refine((arr) => arr.length <= 3, {
        message: "Cloth cannot delete more than 3 cloth images",
      }),
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
