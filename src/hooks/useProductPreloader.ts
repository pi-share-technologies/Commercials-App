import { useEffect, useState } from 'react'
import Product from 'types/Product'

/**
 * Hook that runs once on application start-up.
 * It fetches the product catalogue (metadata + image URLs) from /products/index.json,
 * stores the metadata locally (localStorage for now) and pre-caches the images
 * using the browser Cache Storage API. A simple version key triggers refreshes
 * whenever the backend bumps the catalogue version.
 */
export default function useProductPreloader(fieldId?: string) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!fieldId) return;
    let cancelled = false

    const preload = async () => {
      try {
        // const VERSION_KEY = `productsVersion:${fieldId}`
        const PRODUCTS_KEY = `products:${fieldId}`
        const backendUrl = import.meta.env.VITE_BACKEND_URL

        // Fetch latest catalogue for this device
        const res = await fetch(`${backendUrl}/commercials/fields?fieldName=${encodeURIComponent(fieldId)}`, { cache: 'no-cache' })
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`)

        const { products }: { version: string; products: Product[] } =
          await res.json()

        // If we already have this version cached – nothing to do.
        // if (localStorage.getItem(VERSION_KEY) === version) {
        //   setReady(true)
        //   return
        // }

        // Persist catalogue metadata
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products))

        // Pre-cache images (fire and forget – we still resolve once all settled)
        const cache = await caches.open('product-images')
        console.log("products map", products)
        await Promise.allSettled(
          products.map(p =>
            cache.add(
              new Request(
                'https://storage.googleapis.com/whats-on-product-images/' + p.imageFileName,
                { mode: 'no-cors' }
              )
            )
          )
        )

        // localStorage.setItem(VERSION_KEY, version)
        if (!cancelled) setReady(true)
      } catch (err) {
        console.error('Product preload failed', err)
        // Even on failure we mark ready to avoid blocking the UI forever.
        if (!cancelled) setReady(true)
      }
    }

    preload()

    return () => {
      cancelled = true
    }
  }, [fieldId])

  return { ready }
}
