import fs from "fs";
import Cloth from "../../schemas/cloth.schema.js";
import Admin from "../../schemas/admin.schema.js";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { getRandomClothingImage } from "../../utils/admin-cloth.utils.js";
import {
  validateAdminInsertCloth,
  validateAdminUpdateCloth,
} from "../../schemas/zod/admin-cloth.zod.js";
import { CLOTH_CATEGORIES } from "../../constants/cloth.constants.js";
import { cloudinary } from "../../config/cloudinary.js";

// creating new cloth
async function adminClothInsertController(req: Request, res: Response) {
  try {
    // array of raw images object
    const rawImages = req.files as Express.Multer.File[];

    const credentials = req.body;
    credentials["images"] = [];

    // zod validations
    validateAdminInsertCloth.parse(credentials);

    const sameTitle = await Cloth.findOne({ title: credentials.title });
    if (sameTitle) {
      res.status(403).json({
        message: "A cloth with the same title already exists",
      });
      return;
    }

    // uploading all the images to cloudinary
    if (rawImages?.length > 0) {
      for (const rawImage of rawImages) {
        const result = await cloudinary.uploader.upload(rawImage.path, {
          folder: "hangers",
        });
        credentials.images.push(result.secure_url);

        // remove temp raw image from tempClothImages folder
        await fs.promises.unlink(rawImage.path);
      }
    }
    // seeds - development
    // credentials.images = [getRandomClothingImage(), getRandomClothingImage()];

    // security checking
    const adminId = req.adminCredentials?.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      res
        .status(401)
        .json({ message: "Please sign in or create an account to continue" });
      return;
    }

    if (credentials.actualPrice < credentials.discountedPrice) {
      res.status(403).json({
        message:
          "The actual price must be greater than or equal to the discounted price",
      });
      return;
    }

    // create a new cloth
    const newCloth = new Cloth(credentials);
    await newCloth.save();

    // success response
    res.status(200).json({ message: "Cloth creation completed successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error(error.issues);
      res.json({ message: error.issues[0]?.message || "Validation error" });
    } else if (error instanceof Error) {
      console.error(error);
      res.status(400).json({ message: error.message });
    }
  }
}

// update new cloth
async function adminClothUpdateController(req: Request, res: Response) {
  try {
    const credentials = req.body;
    // seeds - development
    credentials.images = [getRandomClothingImage(), getRandomClothingImage()];

    // zod validations
    validateAdminUpdateCloth.parse(credentials);

    // // security checking
    // const adminId = req.adminCredentials?.id;
    // const admin = await Admin.findById(adminId);
    // if (!admin) {
    //   res
    //     .status(401)
    //     .json({ message: "Please sign in or create an account to continue" });
    //   return;
    // }

    // if (credentials.actualPrice < credentials.discountedPrice) {
    //   res.status(403).json({
    //     message:
    //       "The actual price must be greater than or equal to the discounted price",
    //   });
    //   return;
    // }

    // // create a new cloth
    // const newCloth = new Cloth(credentials);
    // await newCloth.save();

    // success response
    res.status(200).json({ message: "Cloth updation completed successfully" });
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

// get all clothes
async function adminClothGetAllController(req: Request, res: Response) {
  try {
    const { category } = req.query;

    // security checking
    const adminId = req.adminCredentials?.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      res
        .status(401)
        .json({ message: "Please sign in or create an account to continue" });
      return;
    }

    if (!category) {
      // no filter
      const clothes = await Cloth.find({}, "-__v");
      //error response
      if (clothes.length < 1) {
        res
          .status(400)
          .json({ message: "Requested clothes could not be found" });
        return;
      }
      // success response
      res
        .status(200)
        .json({ message: "All clothes have been received", clothes });
      return;
    }

    // filtered result
    if (category && CLOTH_CATEGORIES.includes(category as string)) {
      const clothes = await Cloth.find({ category }, "-__v");
      // error response
      if (clothes.length < 1) {
        res
          .status(400)
          .json({ message: "Requested clothes could not be found" });
        return;
      }
      // success response
      res
        .status(200)
        .json({ message: "Filtered clothes have been received", clothes });
    }
    // error response
    res.status(400).json({ message: "Invalid cloth type" });
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

// delete a cloth
async function adminClothDeleteController(req: Request, res: Response) {
  try {
    // getting cloth id from url params
    const { clothId } = req.params;
    if (!clothId) {
      res.status(400).json({ message: "Kindly provide a valid cloth ID" });
      return;
    }

    // security checking
    const adminId = req.adminCredentials?.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      res
        .status(401)
        .json({ message: "Please sign in or create an account to continue" });
      return;
    }

    // delete a specific cloth
    const deletedCloth = await Cloth.findByIdAndDelete(clothId);

    // error response
    if (!deletedCloth) {
      res.status(500).json({ message: "Oops, something went wrong" });
      return;
    }

    // success response
    res.status(200).json({ message: "Cloth successfully deleted" });
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

export {
  adminClothInsertController,
  adminClothGetAllController,
  adminClothDeleteController,
  adminClothUpdateController,
};
