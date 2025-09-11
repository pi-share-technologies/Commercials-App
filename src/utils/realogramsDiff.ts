import Product from "@interfaces/Product";

/**
 * Helper function to calculate the difference between two realograms (2 * Product[]).
 * Receives old and new realograms and returns the added and removed products in O(n) time complexity.
 */

interface RealogramsDiff {
  oldRealogram: Product[];
  newRealogram: Product[];
}

export default function calculateRealogramsDiff({ oldRealogram, newRealogram }: RealogramsDiff) {
  const oldProductsMap = new Map<string, Product>();
  oldRealogram.forEach(product => {
    oldProductsMap.set(product.barcode, product);
  });

  const newProductsMap = new Map<string, Product>();
  newRealogram.forEach(product => {
    newProductsMap.set(product.barcode, product);
  });

  const newProducts = newRealogram.filter(product => 
    !oldProductsMap.has(product.barcode)
  );

  const removedProducts = oldRealogram.filter(product => 
    !newProductsMap.has(product.barcode)
  ); 

  return { newProducts, removedProducts };
}