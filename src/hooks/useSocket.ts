import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Product from "@interfaces/Product";
import calculateRealogramsDiff from "@utils/realogramsDiff";

/**
 * Hook to manage the socket.io connection.
 * Responsible for:
 * - connecting to the backend using socket.io
 * - receiving products from the backend
 * - storing the products locally
 * - closing the socket connection on unmount
 */

export default function useSocket(loadedProducts: Product[], fieldId?: string) {
  const [activeProduct, setActiveProduct] = useState<Product | null>(null);
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

    /**
     * @SocketChannel - productLabel/{fieldId}
     * @param {string} productLabel - String containing barcode and internal ID separated by underscore
     * @description Receives a product label from the backend containing barcode and internal ID.
     * The label format is: "{BARCODE}_{INTERNAL_ID}"
     * Finds the matching product from loaded products and sets it as active.
     */
    socket.on(`productLabel/${fieldId}`, (productLabel: string) => {
      if (!productLabel) return console.error("No product label received");
      /* eslint-disable-next-line */
      console.log(`Label received from kafka: ${productLabel}`);

      // the product label contains both the BARCODE and the INTERNAL ID number, separated by an underscore
      const productBarcode = productLabel.split("_")[0];
      const product = loadedProductsRef.current.find(
        (product) => product.barcode === productBarcode
      );
      /* eslint-disable-next-line */
      console.log({ foundProduct: product ?? "not in the list" });
      if (!product) return;
      setActiveProduct(product);
    });

    /**
     * @SocketChannel - updateRealogram/{fieldId}
     * @param {Product[]} newRealogram - The latest realogram products list
     * @description Receives the latest realogram products list from the backend to update the local products list.
     * Prevents duplicate products by checking if the product ID already exists.
     * Updates both the in-memory loaded products and localStorage.
     */
    socket.on(`updateRealogram/${fieldId}`, (newRealogram: Product[]) => {
      if (!newRealogram || !newRealogram.length) return;
      const { newProducts } = calculateRealogramsDiff({ oldRealogram: loadedProductsRef.current, newRealogram });
      if (newProducts.length > 0) {
        loadedProductsRef.current = [...loadedProductsRef.current, ...newProducts];
        console.warn("New products added:\n", {newProducts}) // eslint-disable-line
        localStorage.setItem("products", JSON.stringify(loadedProductsRef.current));
      }
    });

    return () => {
      if (socket.connected) socket.disconnect();
    };
  }, [fieldId]);

  return { activeProduct };
}
