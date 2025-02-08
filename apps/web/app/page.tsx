"use client"
import { useRouter } from "next/navigation";
import {useState} from "react"
export default function Home() {
  const [roomId,setRoomId] = useState<string | null>(null)
  const router = useRouter()
  return (
    <div>
      <div>
        <div><p>Enter the RoomId</p></div>
        <input type="text" placeholder="join room" onChange={(e)=>{
          setRoomId(e.target.value)
        }} />
        <button onClick={()=>{
          router.push(`/room/${roomId}`)
          setRoomId("")

        }}>Send</button>
      </div>
    </div>
    );
}
