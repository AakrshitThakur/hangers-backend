import multer, { type FileFilterCallback } from "multer";
import path from "path";
import dotenv from "dotenv";

dotenv.config();

const node_env = process.env.NODE_ENV;

const uploadClothImages = multer({
  dest: node_env === "development" ? "tmp/" : "/tmp", // Vercel allows writing here
  limits: { fileSize: 5 * 1024 * 1024 },
  // @params: file -  Object containing information about the processed file
  // cb - a function to control which files should be uploaded and which should be skipped.
  fileFilter: (req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
    // image type checking
    const allowed = [".png", ".jpg", ".jpeg", ".gif"];
    const ext = path.extname(file.originalname).toLowerCase();

    // allowed to upload or not
    if (!allowed.includes(ext) || !file.mimetype.startsWith("image/")) {
      return cb(new Error("Only images files are allowed"));
    }
    cb(null, true);
  },
});

export { uploadClothImages };
