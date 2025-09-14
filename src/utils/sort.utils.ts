function sortClothes(input: string) {
  switch (input) {
    case "new clothes":
      return { createdAt: -1 };
    case "old clothes":
      return { createdAt: 1 };
    case "↑ actual price":
      return { actualPrice: -1 };
    case "↓ actual price":
      return { actualPrice: 1 };
    case "↑ discounted price":
      return { discountedPrice: 1 };
    case "↑ discounted price":
      return { discountedPrice: -1 };
    default:
      return { createdAt: -1 };
  }
}

export { sortClothes };
