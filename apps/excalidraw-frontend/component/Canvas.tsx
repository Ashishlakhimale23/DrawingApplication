"use client";
import {  useEffect, useRef, useState, RefObject, SetStateAction ,Dispatch} from "react";
import { Game } from "@/draw/Game";

type TypeOfShapes = "Rectangle" | "default" | "Circle";

interface BaseShape {
  type: string;
  x: number;
  y: number;
  selected: boolean;
  isResizing: boolean;
  resizingEdge: string;
  isDraging :boolean
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

type Shape = Rectangle | Circle;


interface ShapesFromServer {
    id : number,
    messageData : Shape
}


export default function Canvas({
  Socket,
  Existingshapes,
}: {
  Socket: WebSocket,
  Existingshapes: ShapesFromServer[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [typeOfShapes,setTypeOfShapes] = useState<TypeOfShapes>("default")
  const [game,setGame] = useState<Game>()


useEffect(() => {
  game?.setTool(typeOfShapes);
}, [typeOfShapes, game]);

useEffect(() => {
  if (canvasRef.current) {
    const g = new Game(canvasRef.current, "2", Socket,Existingshapes);
    setGame(g);

    return () => {
      g.destroy();
    };
  }
}, [canvasRef]);

  return (
    <div className="h-lvh">
      <ToolBar setTypeOFShapes={setTypeOfShapes} />
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      />
    </div>
  );
}

function ToolBar({ setTypeOFShapes }: { setTypeOFShapes :Dispatch<SetStateAction<TypeOfShapes>>}) {
  return (
    <div
      className="space-x-4 fixed top-10 left-9 w-fit h-fit"
      style={{
        position: "fixed",
        top: 10,
        left: 10,
      }}
    >
      <button
        className="bg-white text-white p-2 rounded-md"
        style={{
          backgroundColor: "white",
        }}
        onClick={(e) => {
          e.stopPropagation();
          setTypeOFShapes("default")
        }}
      >
        cursor
      </button>
      <button
        className="bg-black text-white p-2 rounded-md"
        onClick={(e) => {
          e.stopPropagation();

          setTypeOFShapes("Rectangle")

        }}
      >
        Rectangle
      </button>

      <button
        className="bg-black text-white p-2 rounded-md"
        onClick={(e) => {
          e.stopPropagation();
          setTypeOFShapes("Circle")
        }}
      >
        Circle
      </button>
    </div>
  );
}