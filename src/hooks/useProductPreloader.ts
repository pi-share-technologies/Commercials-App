import { useEffect, useState } from "react";
import Product from "@interfaces/Product";

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
      // Load the memorized products before checking the backend for the latest products
      const productsFromLocalStorage = localStorage.getItem("products");
      if (productsFromLocalStorage) {
        setLoadedProducts(() => JSON.parse(productsFromLocalStorage));
      }

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
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

        const { products, fieldId }: { products: Product[], fieldId: string } = await res.json();
        if (products) {
          setLoadedProducts(() => products);
          localStorage.setItem("products", JSON.stringify(products));
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
