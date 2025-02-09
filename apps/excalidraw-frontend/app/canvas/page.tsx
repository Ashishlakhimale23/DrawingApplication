"use client"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { reDrawing,Draw } from "@/draw/Drawing"
import { GetSelectedShape } from "@/draw/SelectedShape"
import { Resize,getResizeEdge } from "@/draw/Resizing"


interface Shape {
    type : string ,  
    x : number,
    y : number,
    width :number,
    height:number,
    selected : boolean,
    isResizing:boolean,
    resizingEdge : string 
}
type TypeOfShapes = {
    type: "Rectangle" | "default"
}

export default function Canvas(){
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const shapes = useRef<Shape[]>([
    {
      type: "Rectangle",
      x: 100,
      y: 110,
      width: 210,
      height: 220,
      selected: false,
      isResizing: false,
      resizingEdge: "",
    },
  ]);
  const typeOfShapes = useRef<TypeOfShapes>({ type: "default" });

  const [isDrawing, setIsDrawing] = useState(false);
  const InitialPoints = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const MovingPoints = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const SelectedIndex = useRef<number>(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctxRef.current = canvas.getContext("2d");
    }

    if (ctxRef.current) {
      ctxRef.current.strokeStyle = "black";
      ctxRef.current.lineWidth = 2;
    }

    shapes.current.map((element) => {
      ctxRef.current?.strokeRect(
        element.x,
        element.y,
        element.width,
        element.height
      );
    });
  }, []);

  


  const MouseDown = (e: MouseEvent) => {
    //change this logic
    InitialPoints.current.x = e.clientX;
    InitialPoints.current.y = e.clientY;



    switch (typeOfShapes.current.type) {
      case "default":
        const selectedIndex = shapes.current.findIndex((shapes) =>
          GetSelectedShape(shapes, e.clientX, e.clientY)
        );

        if (selectedIndex !== -1) {
          SelectedIndex.current = selectedIndex;
          shapes.current[selectedIndex].selected = true;
          const edge = getResizeEdge(
            e.clientX,
            e.clientY,
            shapes.current[SelectedIndex.current]
          );
          if (edge) {
            shapes.current[selectedIndex].isResizing = true;
            shapes.current[selectedIndex].resizingEdge = edge;
          }
        }

      case "Rectangle":
        setIsDrawing(true)
        
      
      default:
        null
    }



    
    
  };

  const MouseMove = (e: MouseEvent) => {
    if (
      isDrawing &&
      typeOfShapes.current.type == "Rectangle" &&
      SelectedIndex.current == -1
    ) {
      MovingPoints.current.x = e.clientX;
      MovingPoints.current.y = e.clientY;

      ctxRef.current?.clearRect(0,0,canvasRef.current?.width,canvasRef.current?.height)
      reDrawing(ctxRef, canvasRef, shapes);
      Draw(ctxRef, canvasRef, InitialPoints, MovingPoints,typeOfShapes);
    } else {
      Resize(e.clientX, e.clientY);
      reDrawing(ctxRef,canvasRef,shapes)
    }
  };

  const MouseUp = (e: MouseEvent) => {
    if (isDrawing && typeOfShapes.current.type == "Rectangle") {
      shapes.current.push({
        x: InitialPoints.current.x,
        y: InitialPoints.current.y,
        width: MovingPoints.current.x - InitialPoints.current.x,
        height: MovingPoints.current.y - InitialPoints.current.y,
        type: "Rectangle",
        selected: false,
        isResizing: false,
        resizingEdge: "",
      });
      
      setIsDrawing(false);
    }

    if (SelectedIndex.current !== -1) {
      SelectedIndex.current = -1;
    }

      InitialPoints.current.x = 0,
      InitialPoints.current.y = 0,
      MovingPoints.current.x = 0
      MovingPoints.current.y = 0
  };

  return (
    <>
      <div className="space-x-4 p-4 absolute">
        <button className="bg-black text-white p-2 rounded-md"
        onClick={()=>typeOfShapes.current.type = "default"}
        >cursor</button>
        <button className="bg-black text-white p-2 rounded-md"
        onClick={()=>{
          typeOfShapes.current.type = "Rectangle"
        }}
        >Rectangle</button>
      </div>
      <canvas
        
        ref={canvasRef}
        onMouseDown={MouseDown}
        onMouseMove={MouseMove}
        onMouseUp={MouseUp}
      ></canvas>
    </>
  );
}