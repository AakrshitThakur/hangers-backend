import type { Request, Response } from "express";
import type { SortOrder } from "mongoose";
import { ZodError } from "zod";
import Cloth from "../../schemas/cloth.schema.js";
import {
  CLOTH_CATEGORIES,
  SORT_CLOTHES,
} from "../../constants/cloth.constants.js";
import { validateUserClothGetAllQuery } from "../../schemas/zod/user-cloth.zod.js";
import { sortClothes } from "../../utils/sort.utils.js";

// get all clothes
async function userClothGetAllController(req: Request, res: Response) {
  try {
    let q = req.query;
    let { category, search, sort, is_top_3 } =
      validateUserClothGetAllQuery.parse(q);

    // if (!category && !search && !sort) {
    //   // no filter
    //   const clothes = await Cloth.find({}, "-__v").populate("images");
    //   //error response
    //   if (clothes.length < 1) {
    //     res
    //       .status(400)
    //       .json({ message: "Requested clothes could not be found" });
    //     return;
    //   }
    //   // success response
    //   res
    //     .status(200)
    //     .json({ message: "All clothes have been received", clothes });
    //   return;
    // }

    if (category && !CLOTH_CATEGORIES.includes(category)) {
      // error response
      res.status(400).json({ message: "Invalid cloth category type" });
      return;
    }

    if (sort && !SORT_CLOTHES.includes(sort)) {
      // error response
      res.status(400).json({ message: "Invalid cloth sort type" });
      return;
    }

    // find document using find fields
    const find: {
      title?: RegExp;
      category?: string;
      isTop3?: boolean;
    } = {};

    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      find.title = searchRegex;
    }
    if (category) {
      find.category = category;
    }
    if (typeof is_top_3 === "boolean") {
      find.isTop3 = is_top_3;
    }

    // apply sorting
    const applySort = sortClothes(sort || "");

    // get filtered clothes
    const clothes = await Cloth.find(find, "-__v").sort(
      applySort as Record<string, SortOrder>
    );
    // error response
    if (clothes.length < 1) {
      res
        .status(400)
        .json({ message: "Requested clothes could not be found", clothes });
      return;
    }
    // success response
    res
      .status(200)
      .json({ message: "Filtered clothes have been received", clothes });
    return;
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.issues);
      res.json({ message: error.issues[0]?.message || "Validation error" });
    } else {
      console.error(error);
      res.status(400).json({ message: error as string });
    }
  }
}

export { userClothGetAllController };
