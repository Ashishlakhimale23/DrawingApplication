"use client";

import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
interface BaseShape {
  type: string;
  x: number;
  y: number;
  selected: boolean;
  isResizing: boolean;
  resizingEdge: string;
  isDraging : boolean
}

interface Rectangle extends BaseShape {
  type: "rectangle";
  width: number;
  height: number;
}

interface Circle extends BaseShape {
  type: "circle";
  x1: number;
  y1: number;
  radius: number;
}

interface ShapesFromServer {
    id : number,
    messageData : Shape
}

type Shape = Rectangle | Circle;
export default function RoomCanvas({roomId,shapes}: {roomId: string,shapes:ShapesFromServer[]}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8081?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzQwMjMwNzAzLCJleHAiOjE3NDAyNTU5MDN9.pjK8ONfMyS7Of9ptv5UBRESWT03AMXWJL6jQuc1pJ1A`)

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