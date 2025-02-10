"use client";

import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";

export default function RoomCanvas({roomId,shapes}: {roomId: string,shapes:string[]}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8081?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MTY3NTA5LCJleHAiOjE3MzkxOTI3MDl9.fBzacv_UXxdO8COiBYKz2h9VnH5HYUSCavcuZoAcQH8`)

        ws.onopen = () => {
            setSocket(ws);
            const data = JSON.stringify({
                type: "join_room",
                roomId
            });
            console.log(data);
            ws.send(data)
        }
        
    }, [])
   
    if (!socket) {
        return <div>
            Connecting to server....
        </div>
    }

    return (
    <Canvas Socket={socket} Existingshapes={shapes}/>)
}