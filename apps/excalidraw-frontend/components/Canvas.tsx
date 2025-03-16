"use client";
import { useEffect, useRef, useState, SetStateAction, Dispatch } from "react";
import { Game } from "@/draw/Game";
import { invoker } from "@/utils/Invoker";
import { ShapesFromServer, TypeOfShapes } from "@/draw/shape/types";

export default function Canvas({
  Socket,
  Existingshapes,
}: {
  Socket: WebSocket;
  Existingshapes: ShapesFromServer[];
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game>();
  const [typeOfShapes, setTypeOfShapes] = useState<TypeOfShapes>("default");

  const setTool = (tool:TypeOfShapes)=>{
    setTypeOfShapes(tool)
  }

  useEffect(()=>{

    game?.setTool(typeOfShapes)
    
  },[typeOfShapes,game])

  useEffect(() => {
    if (canvasRef.current) {
      
      const g = new Game(canvasRef.current, "2", Socket, Existingshapes,setTypeOfShapes);
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);


  return (
   
    <div className="h-lvh">
      <ToolBar setTypeOFShapes={setTypeOfShapes} typeOfShapes={typeOfShapes} />
      <div className="space-x-4 bg-white fixed bottom-10 left-10 w-fit h-fit rounded-md px-2 py-1">
        <button className="text-black" onClick={() => invoker.undo()}>
          Undo
        </button>
        <button className="text-black" onClick={() => invoker.redo()}>
          Redo
        </button>
      </div>
      <canvas
        className="bg-black"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      />
    </div>
  );
}

function ToolBar({
  setTypeOFShapes,
  typeOfShapes,
}: {
  typeOfShapes: TypeOfShapes;
  setTypeOFShapes: Dispatch<SetStateAction<TypeOfShapes>>;
}) {
  return (
    <div className="space-x-4 bg-white fixed top-10 left-10 w-fit h-fit rounded-md px-2 py-1">
      <ButtonComponent
        toolName="default"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <ButtonComponent
        toolName="rectangle"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <ButtonComponent
        toolName="circle"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <ButtonComponent
        toolName="line"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <ButtonComponent
        toolName="pencil"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <ButtonComponent
        toolName="text"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />

      <ButtonComponent
        toolName="panning"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
    </div>
  );
}

const ButtonComponent = ({
  typeOfShapes,
  toolName,
  setTypeOFShapes,
}: {
  typeOfShapes: TypeOfShapes;
  toolName: TypeOfShapes;
  setTypeOFShapes: Dispatch<SetStateAction<TypeOfShapes>>;
}) => {
  return (
    <button
      className={`${ typeOfShapes === toolName ? "bg-black text-white" : "bg-white"} "text-black p-2 rounded-md " `}
      onClick={(e) => {
        e.stopPropagation();

        setTypeOFShapes(`${toolName}`);
        
          
        }}
    >
      {toolName}
    </button>
  );
};
