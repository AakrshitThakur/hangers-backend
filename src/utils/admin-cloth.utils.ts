import { CLOTHING_IMAGES } from "../constants/cloth.constants.js";

function getRandomClothingImage() {
  const zero_to_24 = Math.floor(Math.random() * 25);
  return CLOTHING_IMAGES[zero_to_24];
}

export { getRandomClothingImage };
