import { useRef, useState, useEffect } from "react"
import { io, Socket } from 'socket.io-client'
import Product  from "../types/Product"
import products from "../data/products"

/**
 * Hook to manage the socket.io connection.
 * Responsible for:
 * - connecting to the backend using socket.io
 * - receiving a product object from the backend
 * - storing the product object locally
 * - setting a timer to clear the product from local state after 2 seconds
 * - closing the socket connection on unmount
 */

const useSocket = () => {

    const [product, setProduct] = useState<Product | null>(null)
    const timeoutRef = useRef<number | null>(null)
  
    useEffect(() => {
      const backendUrl: string = import.meta.env.VITE_SOCKET_URL ?? '' 
      const socket: Socket = io(backendUrl, { transports: ['websocket'] })
  
      socket.on('connect', () => {
        console.info('Socket connected', socket.id)  /* eslint-disable-line */
      })
  
      //* Receives a product object from the backend
      socket.on('commercial', (data: Product) => {
        // reset inactivity timer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        setProduct(data)
        timeoutRef.current = window.setTimeout(() => {
        setProduct(null)
        }, 2000)
      })


      //* Receives a product id from the backend and returns the product object
      socket.on("productId", (productId: number) => {
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
          const product = products.find(product => product.id === productId)
          if(product) {
            setProduct(product)
          }
        timeoutRef.current = window.setTimeout(() => {
          setProduct(null)
        }, 2000)
      })


      //* Receives a product label from the backend and returns the product object (or the first product if not found)
      socket.on("productLabel", (productLabel: string) => {
        console.log(`Label received from kafka: ${productLabel}`) /* eslint-disable-line */
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
        const product = products.find(product => product.label === productLabel)
        console.log({ product: product ?? "not in the list" })  /* eslint-disable-line */

        if(product) {
            setProduct(product)
            timeoutRef.current = window.setTimeout(() => {
            setProduct(null)
            }, 2000)
        }
      })
  
      return () => {
        socket.disconnect()
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
      }, [])

return { product }
}

export default useSocket