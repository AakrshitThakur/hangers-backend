function sortClothes(input: string) {
  switch (input) {
    case "new_clothes":
      return { createdAt: -1 };
    case "old_clothes":
      return { createdAt: 1 };
    case "actual_price_desc":
      return { actualPrice: -1 };
    case "actual_price_asc":
      return { actualPrice: 1 };
    case "discounted_price_desc":
      return { discountedPrice: -1 };
    case "discounted_price_asc":
      return { discountedPrice: 1 };
    default:
      return { createdAt: -1 };
  }
}

export { sortClothes };
