"use client";
import { useEffect, useRef, useState, SetStateAction, Dispatch } from "react";
import { Game } from "@/draw/Game";
import { invoker } from "@/utils/Invoker";
import { ShapesFromServer, TypeOfShapes } from "@/utils/types";
import { api } from "@/utils/AxiosApiConfig";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export default function Canvas({
  Socket,
  Existingshapes,
  roomId
}: {
  Socket?: WebSocket;
  Existingshapes: ShapesFromServer[];
  roomId?:string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game>();
  const [typeOfShapes, setTypeOfShapes] = useState<TypeOfShapes>("default");
  const [roomSlug,setRoomSlug] = useState<string>("")
  const [link,SetLink] = useState<string>("")
  const [showModal,setShowModal] = useState<boolean>(false)
  const ModalRef = useRef<HTMLDivElement | null>(null)
  const router = useRouter()
  


  useEffect(()=>{

    game?.setTool(typeOfShapes)
    
  },[typeOfShapes,game])

  useEffect(() => {
    if (canvasRef.current) {
      
      const g = new Game(canvasRef.current,roomId, Socket, Existingshapes,setTypeOfShapes);
      setGame(g);
      
      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  useEffect(()=>{

    document.body.addEventListener("mousedown", UnselectTheDeleteSpace);

    if (roomId) {
      SetLink(`http://localhost:3000/canvas/${roomId}`);
    }
    return () => {
      document.body.removeEventListener("mousedown", UnselectTheDeleteSpace);
    };

  },[])

  function UnselectTheDeleteSpace(e:MouseEvent){
      if(e && ModalRef.current && !ModalRef.current.contains(e.target as Node) ){
        setShowModal(false)
      }
    }


  return (
   
    <div className="h-lvh ">
      <ToolBar setTypeOFShapes={setTypeOfShapes} typeOfShapes={typeOfShapes} />
      <CreateRoomButton setShowModal={setShowModal}/>
      {showModal && <CreateRoomModal roomSlug={roomSlug} setRoomSlug={setRoomSlug} link={link} setLink={SetLink} ModalRef={ModalRef} router={router}/>}
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

const CreateRoomButton=({setShowModal}:{setShowModal : Dispatch<SetStateAction<boolean>>})=>{
  return (
    <div className="space-x-4 bg-white fixed right-10 top-10  w-fit h-fit rounded-md px-2 py-1">
      <button className="text-black p-2 rounded-md" onClick={()=>{
        setShowModal(true)
      }}>Share</button>

    </div>
  );
}


const CreateRoomModal=({link,roomSlug,setRoomSlug,setLink,ModalRef,router}: {link: string, roomSlug:string,setRoomSlug:Dispatch<SetStateAction<string>>,setLink:Dispatch<SetStateAction<string>>,ModalRef:React.RefObject<HTMLDivElement | null>,router:AppRouterInstance})=>{
  
  return (
    <div className="w-fit space-y-2 h-fit p-3 bg-white rounded-md fixed top-1/2 left-1/2 bottom-1/2 right-1/2 flex flex-col" ref={ModalRef}>

      {link.length == 0 &&  <input type="text" placeholder="Enter the Room slug" className="ring-1 ring-black rounded-md p-2 outline-none " value={roomSlug} onChange={(e)=>{
        setRoomSlug(e.target.value)
      }} />}
      {link.length !==0 && <p className="text-black">{link}</p>}
      {link.length== 0 && <button className="p-2 bg-black rounded-md text-white" onClick={()=>{

        createroom(roomSlug,setLink,setRoomSlug,router)

      }}>Create room</button>}
      {link.length !== 0 && 
      <button className="p-2 bg-black rounded-md text-white" onClick={()=>{

        router.push("http://localhost:3000/canvas")

      }}>Leave the room</button>
        }  
    </div>

  )

}

const createroom= async (roomSlug:string,setLink:Dispatch<SetStateAction<string>>,setRoomSlug:Dispatch<SetStateAction<string>>,router:AppRouterInstance)=>{
  try{

  const result = await api.post('/user/createroom',{roomId : roomSlug })
  if(result.status == 200){
    
    setLink(`http://localhost:3000/canvas/${result.data.message}`)
    setRoomSlug("")
    router.push(`http://localhost:3000/canvas/${result.data.message}`) 

  }
  }catch(error){
    console.log(error)
    throw error
  }
  

}

