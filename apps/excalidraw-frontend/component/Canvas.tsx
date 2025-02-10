"use client"
import { MouseEvent, useEffect, useRef, useState,RefObject } from "react"
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

export default function Canvas({Socket,Existingshapes}:{Socket:WebSocket,Existingshapes:string[]}){
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  
  const shapes = useRef<Shape[]>([]);
  
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

    

    if(ctxRef.current && canvasRef.current){
      console.log(Existingshapes)
      shapes.current = [...shapes.current]
      Existingshapes.forEach((element)=>{
        //@ts-ignore
        let shape = JSON.parse(element.message)
        shapes.current.push(shape)
        ctxRef.current?.strokeRect(shape.x,shape.y,shape.width,shape.height)
        })
    }

    Socket.onmessage =(event)=>{
      const message = JSON.parse(event.data)
      shapes.current.push(message.message)
      reDrawing(ctxRef,canvasRef,shapes)
    }

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
      SelectedIndex.current == -1 && canvasRef.current
    ) {
      MovingPoints.current.x = e.clientX;
      MovingPoints.current.y = e.clientY;

      ctxRef.current?.clearRect(0,0,canvasRef.current?.width,canvasRef.current?.height)
      reDrawing(ctxRef, canvasRef, shapes);
      Draw(ctxRef, canvasRef, InitialPoints, MovingPoints,typeOfShapes);
    } else {
      Resize(e.clientX, e.clientY,ctxRef,canvasRef,SelectedIndex,shapes);
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

      Socket.send(
        JSON.stringify({
          type:"chat",
          roomId : "2",
          message:JSON.stringify(
           {
        x: InitialPoints.current.x,
        y: InitialPoints.current.y,
        width: MovingPoints.current.x - InitialPoints.current.x,
        height: MovingPoints.current.y - InitialPoints.current.y,
        type: "Rectangle",
        selected: false,
        isResizing: false,
        resizingEdge: "",
      }
          )


        })
      )


      
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
    <div className="h-lvh">

<ToolBar typeOfShapes={typeOfShapes} />
      <canvas
       width={window.innerWidth}    
       height={window.innerHeight}
        ref={canvasRef}
        onMouseDown={MouseDown}
        onMouseMove={MouseMove}
        onMouseUp={MouseUp}
        />
</div>
  );
}


function ToolBar({typeOfShapes}:{typeOfShapes:RefObject<TypeOfShapes>}){
  return (
<div className="space-x-4 fixed top-10 left-9 w-fit h-fit" style={{
  position:"fixed",
  top : 10,
  left:10
}}>
        <button className="bg-white text-white p-2 rounded-md"
        style={{
          backgroundColor:'white'
        }}
        onClick={(e)=>{
          e.stopPropagation()
          typeOfShapes.current.type = "default"
        }}
        >cursor</button>
        <button className="bg-black text-white p-2 rounded-md"
        
        onClick={(e)=>{
          
          e.stopPropagation()
          typeOfShapes.current.type = "Rectangle"
        }}
        >Rectangle</button>
      </div>

  )
}