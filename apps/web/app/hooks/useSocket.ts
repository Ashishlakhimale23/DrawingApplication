import {useEffect , useRef , useState} from "react"

export default function useSocket(){
    const socket = useRef<WebSocket | null>(null)
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(()=>{
     
      const ws = new WebSocket('ws://localhost:8081?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MDAwNzI5LCJleHAiOjE3MzkwMDQzMjl9.6d7A4l6trJwufy56qnyygR5z3HpfrX5l9ke5KLRHJ9s')
      ws.onopen=()=>{
        setLoading(false)
        socket.current = ws
      }
      
      return ()=>{
        socket.current?.close()
      }
    },[])

    return {
        socket,
        loading
    }
    
}