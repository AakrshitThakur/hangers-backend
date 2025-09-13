import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// for connection to cloud
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "",
  api_key: process.env.CLOUDINARY_API_KEY || "",
  api_secret: process.env.CLOUDINARY_API_SECRET || "",
});

// configure multer-storage-cloudinary
const storage = new CloudinaryStorage({
  cloudinary,
  params: () => ({
    folder: "hangers",
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  }),
});

export { cloudinary, storage };
