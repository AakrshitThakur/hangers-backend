import { z } from "zod";

const validateUserClothGetAllQuery = z
  .object({
    search: z.string().trim().optional(),
    category: z.string().trim().toLowerCase(),
    sort: z.string().trim().toLowerCase(),
  })
  .strict();

export { validateUserClothGetAllQuery };
