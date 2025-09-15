import multer, { type FileFilterCallback } from "multer";
import path from "path";

const uploadClothImages = multer({
  dest: "temp-cloth-images/",
  limits: { fileSize: 4 * 1024 * 1024 },
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
