import fs from "fs";
import { CLOTHING_IMAGES } from "../constants/cloth.constants.js";

function getRandomClothingImage() {
  const zero_to_24 = Math.floor(Math.random() * 25);
  return CLOTHING_IMAGES[zero_to_24];
}

async function deleteTempRawClothes(rawImages: Express.Multer.File[]) {
  // cleanup all temp images
  for (const rawImage of rawImages) {
    try {
      await fs.promises.unlink(rawImage.path);
    } catch (error) {
      if (error instanceof Error) {
        console.error(error.message);
      } else {
        console.error(error);
      }
    }
  }
}

export { getRandomClothingImage, deleteTempRawClothes };
