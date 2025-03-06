"use client";
import {  useEffect, useRef, useState, RefObject, SetStateAction ,Dispatch} from "react";
import { Game } from "@/draw/Game";
import { invoker } from "@/utils/Invoker";

type TypeOfShapes = "rectangle" | "default" | "circle" | "line" | "pencil" | "text";

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
    radiusY: number;
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
      <ToolBar setTypeOFShapes={setTypeOfShapes} typeOfShapes={typeOfShapes}/>
      <div
      className="space-x-4 bg-white fixed bottom-10 left-10 w-fit h-fit rounded-md px-2 py-1"
      >
        <button className="text-black" onClick={()=>invoker.undo()}>Undo</button>
        <button className="text-black"onClick={()=>invoker.redo()}>Redo</button>
      </div>
      <canvas
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      />
    </div>
  );
}

function ToolBar({ setTypeOFShapes, typeOfShapes }: {typeOfShapes:TypeOfShapes , setTypeOFShapes :Dispatch<SetStateAction<TypeOfShapes>>}) {
  return (
    <div
      className="space-x-4 bg-white fixed top-10 left-10 w-fit h-fit rounded-md px-2 py-1"
    >
       <ButtonComponent toolName="default" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
       <ButtonComponent toolName="rectangle" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
       <ButtonComponent toolName="circle" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
       <ButtonComponent toolName="line" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
       <ButtonComponent toolName="pencil" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
       <ButtonComponent toolName="text" setTypeOFShapes={setTypeOFShapes} typeOfShapes={typeOfShapes}/> 
    </div>
  );
}

const ButtonComponent = ({typeOfShapes, toolName , setTypeOFShapes}:{typeOfShapes:TypeOfShapes, toolName:TypeOfShapes ,setTypeOFShapes:Dispatch<SetStateAction<TypeOfShapes>>}) =>{
      return (
        <button
          className={`${typeOfShapes === toolName ? "bg-black text-white" : 'bg-white'} "text-black p-2 rounded-md " `}
          onClick={(e) => {
            e.stopPropagation();
            setTypeOFShapes(`${toolName}`);
          }}
        >
         {toolName} 
        </button>
      ); 

}