import { useEffect, useState } from "react";
import Product from "@interfaces/Product";
import calculateRealogramsDiff from "@utils/realogramsDiff";

/**
 * Hook that runs once on application start-up.
 * It fetches the product catalogue (metadata + image URLs) from /products/index.json,
 * stores the metadata in a local state and pre-caches the images
 * using the browser Cache Storage API.
 */
export default function useProductPreloader(
  resetFieldId: () => void,
  updateFieldId: (id: string) => void,
  fieldName?: string
) {
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!fieldName) return;

    const preload = async () => {
      // Load the memorized products and FieldId before checking the backend for the latest products
      const memorizedProducts = localStorage.getItem("products");
      if (memorizedProducts && memorizedProducts.length) {
        setLoadedProducts(() => JSON.parse(memorizedProducts));

        const fieldIdFromLocalStorage = localStorage.getItem("fieldId");
        if (fieldIdFromLocalStorage) {
          updateFieldId(fieldIdFromLocalStorage);
        }
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) {
          console.error("Backend URL not found");
          return;
        }

        const fetchUrl = `${backendUrl}/commercials/productsByFieldName?fieldName=${encodeURIComponent(
          fieldName
        )}`;

        // Fetch latest catalogue for this device
        const res = await fetch(fetchUrl, { cache: "no-cache" });
        if (!res.ok) {
          // if the server is live and couldn't find the field's products, prompt the user again
          if (res.status === 400 || res.status === 404) {
            resetFieldId();
          }
          throw new Error(`Fetch failed: ${res.status}`);
        }

        const {
          products: fetchedProducts,
          fieldId,
        }: { products: Product[]; fieldId: string } = await res.json();

        const oldRealogram = memorizedProducts
          ? JSON.parse(memorizedProducts)
          : [];

        // if there are no products in the latest realogram (after refetching), use the memorized realogram
        if (
          (!fetchedProducts || !fetchedProducts.length) &&
          Array.isArray(oldRealogram)
        ) {
          setLoadedProducts(oldRealogram);
          return;
        }

        const { newProducts } = calculateRealogramsDiff({
          oldRealogram,
          newRealogram: fetchedProducts,
        });

        if (newProducts.length > 0) {
          const updatedProducts = [...oldRealogram, ...newProducts];
          setLoadedProducts(() => updatedProducts);
          localStorage.setItem("products", JSON.stringify(updatedProducts));
          /* eslint-disable-next-line */
          console.log("Products added after refetching:\n", newProducts);
        }

        if (fieldId) {
          localStorage.setItem("fieldId", fieldId);
          updateFieldId(fieldId);
        }
      } catch (err) {
        console.error("Product preload failed", err);
      }
    };

    preload();

    return () => {};
  }, [fieldName]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loadedProducts };
}
