"use client";
import { useEffect, useRef, useState, SetStateAction, Dispatch } from "react";
import { Game } from "@/draw/Game";
import { invoker } from "@/utils/Invoker";
import { ShapesFromServer, TypeOfShapes } from "@/utils/types";
import { api } from "@/utils/AxiosApiConfig";
import { useRouter } from "next/navigation";
import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import {RectangleHorizontal,Circle,Minus,Pencil,TypeOutline,Hand,MousePointer2} from "lucide-react"


export default function Canvas({
  Socket,
  Existingshapes,
  roomId,
}: {
  Socket?: WebSocket;
  Existingshapes: ShapesFromServer[];
  roomId?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [game, setGame] = useState<Game>();
  const [typeOfShapes, setTypeOfShapes] = useState<TypeOfShapes>("default");
  const [roomSlug, setRoomSlug] = useState<string>("");
  const [link, SetLink] = useState<string>("");
  const [showModal, setShowModal] = useState<boolean>(false);
  const [inputValue, setInputValue] = useState<string>(""); // State for input box
  const ModalRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();

  useEffect(() => {
    game?.setTool(typeOfShapes);
  }, [typeOfShapes, game]);

  useEffect(() => {
    if (canvasRef.current) {
      const g = new Game(
        canvasRef.current,
        roomId,
        Socket,
        Existingshapes,
        setTypeOfShapes
      );
      setGame(g);

      return () => {
        g.destroy();
      };
    }
  }, [canvasRef]);

  useEffect(() => {
    document.body.addEventListener("mousedown", UnselectTheDeleteSpace);

    if (roomId) {
      SetLink(`http://localhost:3000/canvas/${roomId}`);
    }
    return () => {
      document.body.removeEventListener("mousedown", UnselectTheDeleteSpace);
    };
  }, []);

  function UnselectTheDeleteSpace(e: MouseEvent) {
    if (e && ModalRef.current && !ModalRef.current.contains(e.target as Node)) {
      setShowModal(false);
    }
  }

  return (
    <div className="h-lvh">
      <ToolBar setTypeOFShapes={setTypeOfShapes} typeOfShapes={typeOfShapes} />
      <CreateRoomButton setShowModal={setShowModal} link={link} />
      {showModal && (
        <CreateRoomModal
          roomSlug={roomSlug}
          setRoomSlug={setRoomSlug}
          link={link}
          setLink={SetLink}
          ModalRef={ModalRef}
          router={router}
        />
      )}
      <div className="fixed bottom-6 left-6 bg-white/10 backdrop-blur-sm shadow-lg rounded-xl overflow-hidden border border-gray-200/20">
        <button
          className="px-4 py-2 text-sm font-medium text-white hover:bg-black transition-all duration-200 border-r border-gray-200"
          onClick={() => invoker.undo()}
        >
          Undo
        </button>
        <button
          className="px-4 py-2 text-sm font-medium text-white hover:bg-black transition-all duration-200"
          onClick={() => invoker.redo()}
        >
          Redo
        </button>
      </div>
      <canvas
        className="bg-black"
        width={window.innerWidth}
        height={window.innerHeight}
        ref={canvasRef}
      />
      {/* Input Box */}
      <div className="fixed bottom-6 right-6">
        <input
          type="text"
          placeholder="Enter text here"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          className="px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:outline-none"
        />
      </div>
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
    <div className="fixed top-6 left-1/2 -translate-x-1/2  backdrop-blur-sm shadow-lg rounded-xl px-3 py-2 flex gap-1 border border-gray-200/20">
      <ButtonComponent
        toolName="default"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
      <div className="w-px h-6 bg-black mx-1" /> 
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
      <div className="w-px h-6 bg-black mx-1" /> 
      <ButtonComponent
        toolName="panning"
        setTypeOFShapes={setTypeOFShapes}
        typeOfShapes={typeOfShapes}
      />
    </div>
  );
}
const IconMapping  = {
  "default" : <MousePointer2 className="w-6 h-6"/>,
  "rectangle" : <RectangleHorizontal className="w-6 h-6"/>,
  "circle" : <Circle className="w-6 h-6"/>,
  "text" : <TypeOutline className="w-6 h-6"/>,
  "panning" : <Hand className="w-6 h-6"/>,
  "line" : <Minus className="w-6 h-6"/>,
  "pencil" : <Pencil className="w-6 h-6"/>

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
      className={`p-2 rounded-lg transition-all duration-200 ${
        typeOfShapes === toolName 
          ? "bg-white/10 text-white ring-1 ring-white/20" 
          : "text-white hover:text-white hover:bg-white/5"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        setTypeOFShapes(`${toolName}`);
      }}
      title={toolName.charAt(0).toUpperCase() + toolName.slice(1)}
    >
      {IconMapping[toolName]}
    </button>
  );
};

const CreateRoomButton = ({
  setShowModal,link
}: {
  setShowModal: Dispatch<SetStateAction<boolean>>,
  link : string
}) => {
  return (
    <div className="fixed top-6 right-6">
      <button 
        className="bg-white/10 hover:bg-black backdrop-blur-sm shadow-lg rounded-xl px-4 py-2 text-sm font-medium text-white  transition-all duration-200 flex items-center gap-2 border border-gray-200/20"
        onClick={() => setShowModal(true)}
      >
         
        {link.length === 0 ? 'Create Room' : 'share'}
      </button>
    </div>
  );
};


const CreateRoomModal = ({
  link,
  roomSlug,
  setRoomSlug,
  setLink,
  ModalRef,
  router
}: {
  link: string;
  roomSlug: string;
  setRoomSlug: Dispatch<SetStateAction<string>>;
  setLink: Dispatch<SetStateAction<string>>;
  ModalRef: React.RefObject<HTMLDivElement | null>;
  router: AppRouterInstance;
}) => {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center">
      <div 
        ref={ModalRef}
        className="bg-white rounded-2xl p-6 w-[400px] shadow-xl space-y-4"
      >
        <h2 className="text-xl font-semibold text-gray-900">
          {link.length === 0 ? 'Create Room' : 'Room Link'}
        </h2>
        
        {link.length === 0 ? (
          <>
            <input
              type="text"
              placeholder="Enter room name"
              className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none"
              value={roomSlug}
              onChange={(e) => setRoomSlug(e.target.value)}
            />
            <button
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => createroom(roomSlug, setLink, setRoomSlug, router)}
            >
              Create Room
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-gray-600 flex-1 truncate">{link}</p>
              <button
                className="p-2 text-gray-500 hover:text-gray-900"
                onClick={() => navigator.clipboard.writeText(link)}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </button>
            </div>
            <button
              className="w-full py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors"
              onClick={() => router.push("http://localhost:3000/canvas")}
            >
              Leave Room
            </button>
          </>
        )}
      </div>
    </div>
  );
};

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

