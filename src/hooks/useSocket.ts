import { useRef, useState, useEffect} from "react"
import { io, Socket } from 'socket.io-client'
import type { Commercial } from "../types/Commercial"


const useSocket = () => {
    const testURL = 'http://172.16.10.92:4000'

    const [commercial, setCommercial] = useState<Commercial | null>(null)
    const timeoutRef = useRef<number | null>(null)
  
    useEffect(() => {
      const backendUrl: string = import.meta.env.VITE_BACKEND_URL ?? testURL // default to same origin
      const socket: Socket = io(backendUrl, { transports: ['websocket']})
  
      socket.on('connect', () => {
        console.info('Socket connected', socket.id)
      })
  
      socket.on('commercial', (data: Commercial) => {
        // reset inactivity timer
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
        setCommercial(data)
        console.log(data)
        timeoutRef.current = window.setTimeout(() => {
        // !   setCommercial(null)
        }, 5000)
      })
  
      return () => {
        socket.disconnect()
        if (timeoutRef.current) clearTimeout(timeoutRef.current)
      }
      }, [])


return { commercial, setCommercial }
}

export default useSocket