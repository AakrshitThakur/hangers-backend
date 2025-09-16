import { z } from "zod";

const validateUserClothGetAllQuery = z
  .object({
    search: z.string().trim().optional(),
    category: z.string().trim().toLowerCase().optional(),
    sort: z.string().trim().toLowerCase().optional(),
    is_top_3: z.preprocess((input) => {
      if (typeof input === "string" && input.trim().toLowerCase() === "true") {
        return true;
      }
      if (typeof input === "string" && input.trim().toLowerCase() === "false") {
        return false;
      }
      return undefined;
    }, z.boolean().optional()),
  })
  .strict();

export { validateUserClothGetAllQuery };
