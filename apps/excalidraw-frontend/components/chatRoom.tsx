"use client";

import { useEffect, useRef, useState } from "react";
import Canvas from "./Canvas";
interface BaseShape {
    id?: number
    type: string;
    x: number;
    y: number;
    selected: boolean;
    isResizing: boolean;
    resizingEdge: string;
    isDraging: boolean
}

interface Text extends BaseShape {
    type: "text";
    content: string;
    fontSize: number;
    fontFamily: string;
}

interface Rectangle extends BaseShape {
    type: "rectangle";
    width: number;
    height: number;
}

interface Circle extends BaseShape {
    type: "circle";
    radiusX: number;
    radiusY : number
}

interface Line extends BaseShape {
    type: "line";
    x1: number;
    y1: number;
    midX: number;
    midY: number
    Point: 'startingPoint' | "endingPoint" | "midPoint" | ""
}

interface Pencil extends BaseShape {
    type: 'pencil';
    points: number[][]

}

type Shape = Rectangle | Circle | Line | Pencil | Text;

interface ShapesFromServer {
    id?: number,
    messageData: Shape
}



export default function RoomCanvas({roomId,shapes}: {roomId: string,shapes:ShapesFromServer[]}) {
    const [socket, setSocket] = useState<WebSocket | null>(null);

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:8081?token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzQwNjY0NDI4LCJleHAiOjE3NDA2ODk2Mjh9.z0SYCDt9Avvdz0sW_TcInnQXQAWHlO-9AlhWqXh4PXI`)

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