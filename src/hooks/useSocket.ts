import { useRef, useState, useEffect } from "react";
import { io, Socket } from "socket.io-client";
import Product from "@interfaces/Product";

/**
 * Hook to manage the socket.io connection.
 * Responsible for:
 * - connecting to the backend using socket.io
 * - receiving products from the backend
 * - storing the products locally
 * - setting a timer to clear the product from local state after 2 seconds
 * - closing the socket connection on unmount
 */

const useSocket = (loadedProducts: Product[], fieldId?: string) => {
  const [product, setProduct] = useState<Product | null>(null);
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
      // timeoutRef.current = window.setTimeout(() => {
      //   setProduct(null);
      // }, 3000);
    });

    //* Receives a product id from the backend and returns the product object
    socket.on("productId", (productId: number) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      const product = loadedProductsRef.current.find(
        (product) => product.id === productId
      );
      if (product) {
        setProduct(product);
      }
      // timeoutRef.current = window.setTimeout(() => {
      //   setProduct(null);
      // }, 3000);
    });

    //* Receives a product label from the backend and returns the product object
    socket.on(
      `productLabel/${fieldId}`,
      async (productLabel: string) => {
        /* eslint-disable-next-line */
        console.log(`Label received from kafka: ${productLabel}`);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }

        // the product label contains both the BARCODE and the INTERNAL ID number, separated by an underscore
        const productBarcode = productLabel.split("_")[0];
        const product = loadedProductsRef.current.find(
          (product) => product.barcode === productBarcode
        );

        /* TEMP FOR TESTING ONLY */
        console.log({fieldId}) /* eslint-disable-line */
        console.warn({ foundProduct: product ?? "not in the list" });

        if (!product) return;
        setProduct(() => product);

        timeoutRef.current = window.setTimeout(() => {
          setProduct(null);
        }, 3000);
      }
    );

    return () => {
      if (socket.connected) socket.disconnect();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [fieldId]);

  return { product };
};

export default useSocket;
