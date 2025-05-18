"use client";

import { useEffect, useState } from "react";
import Canvas from "./Canvas";
import { ShapesFromServer } from "@/utils/types";

export default function RoomCanvas({roomId,shapes}: {roomId: string,shapes:ShapesFromServer[]}) {
  
    const [socket, setSocket] = useState<WebSocket | null>(null);
  

    useEffect(() => {
        const ws_url = process.env.NEXT_PUBLIC_WS_SERVER
        const token = localStorage.getItem("authtoken")
        const ws = new WebSocket(`${ws_url}?token=${token}`)
        
        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId: roomId
            });
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return (
    <Canvas Socket={socket} Existingshapes={shapes} roomId={roomId}/>
)
}