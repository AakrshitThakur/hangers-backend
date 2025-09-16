import fs from "fs";
import Cloth from "../../schemas/cloth.schema.js";
import Admin from "../../schemas/admin.schema.js";
import type { Request, Response } from "express";
import { ZodError } from "zod";
import { deleteTempRawClothes } from "../../utils/admin-cloth.utils.js";
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

    let credentials = req.body;
    credentials["images"] = [];

    // zod validations
    credentials = validateAdminInsertCloth.parse(credentials);

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
      deleteTempRawClothes(rawImages);
      return;
    }

    const sameTitle = await Cloth.findOne({ title: credentials.title });
    if (sameTitle) {
      res.status(403).json({
        message: "A cloth with the same title already exists",
      });
      deleteTempRawClothes(rawImages);
      return;
    }

    // restrict to a maximum of three top clothing products
    const moreThan3 = await Cloth.countDocuments({ isTop3: true });
    if (moreThan3 >= 3) {
      res
        .status(400)
        .json({ message: "You can only have 3 top cloth products at a time" });
      deleteTempRawClothes(rawImages);
      return;
    }

    // not more than 3 images for a cloth document
    if (rawImages?.length > 3) {
      // error response
      res.status(400).json({
        message: "Admin cannot add more than 3 images for a cloth",
      });
      // cleanup all temp images
      deleteTempRawClothes(rawImages);
      return;
    }

    // uploading all the images to cloudinary
    if (rawImages?.length > 0) {
      for (const rawImage of rawImages) {
        const result = await cloudinary.uploader.upload(rawImage.path, {
          folder: "hangers",
        });
        credentials.images.push({
          url: result.secure_url,
          publicId: result.public_id,
        });

        // remove temp raw image from tempClothImages folder
        await fs.promises.unlink(rawImage.path);
      }
    }
    // seeds - development
    // credentials.images = [getRandomClothingImage(), getRandomClothingImage()];

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
    // array of raw images object
    const rawImages = req.files as Express.Multer.File[];
    // cleanup all temp images
    deleteTempRawClothes(rawImages);
  }
}

// update existing cloth
async function adminClothUpdateController(req: Request, res: Response) {
  try {
    const rawImages = req.files as Express.Multer.File[];
    let credentials = {
      ...req.body,
      images: [],
      publicIds: req.body.publicIds || [],
    };

    // get cloth ID
    const { clothId } = req.params;
    if (!clothId) {
      res.status(400).json({ message: "Invalid cloth ID" });
      deleteTempRawClothes(rawImages);
      return;
    }

    // validate credentials
    credentials = validateAdminUpdateCloth.parse(credentials);

    // security: check admin
    const adminId = req.adminCredentials?.id;
    const admin = await Admin.findById(adminId);
    if (!admin) {
      res.status(401).json({ message: "Unauthorized. Please sign in again." });
      deleteTempRawClothes(rawImages);
      return;
    }

    // validate price
    if (credentials.actualPrice < credentials.discountedPrice) {
      res.status(403).json({
        message:
          "Actual price must be greater than or equal to discounted price",
      });
      deleteTempRawClothes(rawImages);
      return;
    }

    // restrict to a maximum of three top clothing products
    const moreThan3 = await Cloth.countDocuments({ isTop3: true });
    if (credentials.isTop3 && moreThan3 >= 3) {
      res
        .status(400)
        .json({ message: "You can only have 3 top cloth products at a time" });
      deleteTempRawClothes(rawImages);
      return;
    }

    // fetch cloth for image updates
    const cloth = await Cloth.findById(clothId);
    if (!cloth) {
      res.status(404).json({ message: "Cloth not found" });
      deleteTempRawClothes(rawImages);
      return;
    }

    // check actual and discount prices
    if (!credentials.actualPrice || !credentials.discountedPrice) {
      if (credentials.actualPrice < cloth.discountedPrice) {
        res.status(400).json({
          message:
            "Actual price must be greater than or equal to discounted price",
        });
        deleteTempRawClothes(rawImages);
        return;
      }
      if (credentials.discountedPrice > cloth.actualPrice) {
        res.status(400).json({
          message:
            "Actual price must be greater than or equal to discounted price",
        });
        deleteTempRawClothes(rawImages);
        return;
      }
    }

    // updating: images + additional fields
    if (credentials.publicIds.length || rawImages?.length) {
      // authenticity of provided public ids
      const allPublicIds = new Set(cloth.images.map((image) => image.publicId));
      const check = credentials.publicIds.every((publicId: string) =>
        allPublicIds.has(publicId)
      );
      if (!check) {
        res.status(400).json({ message: "Invalid public ID" });
        deleteTempRawClothes(rawImages);
        return;
      }

      // check for duplicate public IDs
      const duplicate =
        new Set(credentials.publicIds).size !== credentials.publicIds.length;
      if (duplicate) {
        res.status(400).json({ message: "Duplicate public IDs" });
        deleteTempRawClothes(rawImages);
        return;
      }

      // delete requested images from cloudinary
      for (const publicId of credentials.publicIds) {
        try {
          const response = await cloudinary.uploader.destroy(publicId);
          if (response.result === "not found") {
            res.status(400).json({ message: `Invalid public ID: ${publicId}` });
            deleteTempRawClothes(rawImages);
            return;
          }
        } catch (error) {
          const msg =
            error instanceof Error
              ? error.message
              : "Unknown error deleting image";
          console.error("Cloudinary delete error:", msg);
          res.status(400).json({ message: msg });
          deleteTempRawClothes(rawImages);
          return;
        }
      }

      // retain only images not deleted
      cloth.images = cloth.images.filter(
        (image) => !credentials.publicIds.includes(image.publicId)
      ) as any;

      // upload new images
      if (rawImages?.length) {
        for (const rawImage of rawImages) {
          if (cloth.images.length >= 3) {
            // save changes
            await cloth.save();
            // cleanup all temp images
            deleteTempRawClothes(rawImages);
            // error response
            res.status(400).json({
              message: "Admin cannot add more than 3 images for a cloth",
            });
            return;
          }

          // upload cloth image
          const result = await cloudinary.uploader.upload(rawImage.path, {
            folder: "hangers",
          });
          // push new images to document
          cloth.images.push({
            url: result.secure_url,
            publicId: result.public_id,
          });

          // cleanup temp image
          await fs.promises.unlink(rawImage.path);
        }
      }

      // save changes
      await cloth.save();
    }

    // update other fields as well (excluding images)

    delete credentials.publicIds;
    delete credentials.images;

    // update
    const updatedDocument = await Cloth.findByIdAndUpdate(
      clothId,
      credentials,
      {
        runValidators: true,
        new: true,
      }
    );

    // error response
    if (!updatedDocument) {
      res.status(400).json({ message: "Invalid cloth ID" });
      return;
    }
    // success response
    res.status(200).json({ message: "Cloth updated successfully" });
  } catch (error) {
    if (error instanceof ZodError) {
      console.error("Validation error:", error.issues);
      res
        .status(400)
        .json({ message: error.issues[0]?.message || "Validation error" });
    } else {
      console.error("Unexpected error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
    // array of raw images object
    const rawImages = req.files as Express.Multer.File[];
    // cleanup all temp images
    deleteTempRawClothes(rawImages);
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
      const clothes = await Cloth.find({}, "-__v").populate("images");
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
      return;
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
    // array of raw images object
    const rawImages = req.files as Express.Multer.File[];
    // cleanup all temp images
    deleteTempRawClothes(rawImages);
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

    const cloth = await Cloth.findById(clothId).select("images");
    if (!cloth) {
      res.status(400).json({ message: "Invalid cloth ID" });
      return;
    }

    // deleting associated images
    for (const clothImage of cloth.images) {
      try {
        clothImage.publicId &&
          (await cloudinary.uploader.destroy(clothImage.publicId));
      } catch (error) {
        if (error instanceof Error) {
          console.error("Error deleting images", error.message);
          res.status(400).json({ message: error.message });
          return;
        }
        console.error("Error deleting images", error);
        res.status(400).json({ message: error });
        return;
      }
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
