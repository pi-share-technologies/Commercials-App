import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Product from "../types/Product";
import products from "../data/products";
import useFieldId from "./useFieldId";

/**
 * Hook to manage the socket.io connection.
 * Responsible for:
 * - connecting to the backend using socket.io
 * - receiving a product object from the backend
 * - storing the product object locally
 * - setting a timer to clear the product from local state after 2 seconds
 * - closing the socket connection on unmount
 */

const useSocket = (loadedProducts: Product[]) => {
  const { fieldId } = useFieldId();
  const [product, setProduct] = useState<Product | null>(null);
  // ObjectURL for cached image to revoke when done
  const objectUrlRef = useRef<string | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const loadedProductsRef = useRef(loadedProducts);

  // Keep the ref updated when loadedProducts changes
  useEffect(() => {
    loadedProductsRef.current = loadedProducts;
  }, [loadedProducts]);

  useEffect(() => {
    if (socketRef.current) return;
    if (!fieldId) return;
    const backendUrl: string = import.meta.env.VITE_SOCKET_URL ?? "";
    const socket: Socket = io(backendUrl, { transports: ["websocket"] });
    socketRef.current = socket;
    socket.on("connect", () => {
      console.info("Socket connected", socket.id); /* eslint-disable-line */
    });

    //* Receives a product object from the backend
    socket.on("commercial", (data: Product) => {
      // reset inactivity timer
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setProduct(data);
      timeoutRef.current = window.setTimeout(() => {
        setProduct(null);
      }, 3000);
    });

    //* Receives a product id from the backend and returns the product object
    socket.on("productId", (productId: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const product = products.find((product) => product.id === productId);
      if (product) {
        setProduct(product);
      }
      timeoutRef.current = window.setTimeout(() => {
        setProduct(null);
      }, 3000);
    });

    //* Receives a product label from the backend and returns the product object (or the first product if not found)
    const fieldNameWithoutSpaces = String(fieldId)?.replaceAll(" ", "");
    socket.on(
      `productLabel/${fieldNameWithoutSpaces}`,
      async (productLabel: string) => {
        /* eslint-disable-next-line */
        console.log(`Label received from kafka: ${productLabel}`);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        const currentProducts = loadedProductsRef.current;
        const product = currentProducts.find(
          (product) => product.barcode === productLabel
        );
        console.warn({ foundProduct: product ?? "not in the list" });

        if (product && product?.imageFileId) {
          const productImageId = product.imageFileId
            .split("/")
            .slice(0, -1)
            .join("/");
          const fullUrl =
            "https://storage.googleapis.com/" + productImageId + "?alt=media";

          try {
            const cache = await caches.open("product-images");

            const cachedResponse = await cache.match(fullUrl);
            if (!cachedResponse) {
              setProduct(product); // Fallback to value already in product.image
              return;
            }

            const blob = await cachedResponse.blob();

            if (blob.size === 0) {
              console.error("Image blob is empty!");
              setProduct(product); // Fallback to original product
              return;
            }

            // Create ObjectURL for the blob so <img> can render it
            const objectUrl = URL.createObjectURL(blob);

            // Clean up any previous object URL
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
            }
            objectUrlRef.current = objectUrl;
            setProduct({ ...product, image: objectUrl });
          } catch (error) {
            console.error("Cache access error:", error);
            setProduct(product); // Fallback to original product
          }

          timeoutRef.current = window.setTimeout(() => {
            if (objectUrlRef.current) {
              URL.revokeObjectURL(objectUrlRef.current);
              objectUrlRef.current = null;
            }
            setProduct(null);
          }, 3000);
        }
      }
    );

    return () => {
      if (socket.connected) socket.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (objectUrlRef.current) {
        URL.revokeObjectURL(objectUrlRef.current);
        objectUrlRef.current = null;
      }
    };
  }, [fieldId]);

  return { product };
};

export default useSocket;
