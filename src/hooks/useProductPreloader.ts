import { useEffect, useState } from "react";
import Product from "../types/Product";

/**
 * Hook that runs once on application start-up.
 * It fetches the product catalogue (metadata + image URLs) from /products/index.json,
 * stores the metadata in a local state and pre-caches the images
 * using the browser Cache Storage API.
 */
export default function useProductPreloader(
  resetFieldId: () => void,
  fieldId?: string
) {
  const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);

  useEffect(() => {
    if (!fieldId) return;

    const preload = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        const fetchUrl = `${backendUrl}/commercials/fieldProducts?fieldName=${encodeURIComponent(
          fieldId
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

        const { products }: { products: Product[] } = await res.json();
        if (products) {
          setLoadedProducts(() => products);
        }

        // Pre-cache images (fire and forget – we still resolve once all settled)
        const cache = await caches.open("product-images");
        await Promise.allSettled(
          products.map(async (p) => {
            const productImageUrl =
              "https://storage.googleapis.com/whats-on-product-images/" +
              p.imageFileName +
              "?alt=media";
            const res = await fetch(productImageUrl);
            if (res.ok) {
              await cache.put(productImageUrl, res.clone());
            }
          })
        );
      } catch (err) {
        console.error("Product preload failed", err);
      }
    };

    preload();

    return () => {};
  }, [fieldId]); // eslint-disable-line react-hooks/exhaustive-deps

  return { loadedProducts };
}
