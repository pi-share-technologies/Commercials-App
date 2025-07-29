import { useRef, useState, useEffect} from "react"
import { io, Socket } from 'socket.io-client'
import Product  from "../types/Product"
import products from "../data/products"


const useSocket = () => {
    const testURL = 'http://172.16.10.92:4000'

    const [product, setProduct] = useState<Product | null>(null)
    const timeoutRef = useRef<number | null>(null)
  
    useEffect(() => {
      const backendUrl: string = import.meta.env.VITE_BACKEND_URL ?? testURL // default to same origin
      const socket: Socket = io(backendUrl, { transports: ['websocket']})
  
      socket.on('connect', () => {
        console.info('Socket connected', socket.id)
      })
  
      //* Receives a product object from the backend
      socket.on('commercial', (data: Product) => {
        // reset inactivity timer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        setProduct(data)
        console.log(data)
        timeoutRef.current = window.setTimeout(() => {
        setProduct(null)
        }, 5000)
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
        }, 5000)
      })

      //* Receives a product label from the backend and returns the product object (or the first product if not found)
      socket.on("productLabel", (productLabel: string) => {
        console.log(`Label received from kafka: ${productLabel}`)
        console.log('Now: ', new Date().toLocaleString())
        // console.log('Received Date/Time: ', new Date(productLabel))
        // console.log(`diff: ${new Date().getTime() - new Date(productLabel).getTime()}ms`)
        if (timeoutRef.current) {
            clearTimeout(timeoutRef.current)
          }
        //!  const product = products.find(product => product.label === productLabel) ?? products[0]
        const product = products[0]
          console.log({productFromUseSocket: product})
        if(product) {
            setProduct(product)
            timeoutRef.current = window.setTimeout(() => {
            setProduct(null)
            }, 5000)
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