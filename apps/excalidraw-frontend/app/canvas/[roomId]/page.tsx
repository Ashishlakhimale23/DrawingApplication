'use client'
import RoomCanvas from "@/components/chatRoom";
import { api } from "@/utils/AxiosApiConfig";
import { useEffect, useState } from "react";
import {ShapesFromServer} from "../../../utils/types"
import { useParams } from "next/navigation";


const getRoomShapes = async (roomId: string) => {
  
  const shapes = await api.get("/user/getchats", {
    params: { roomId: roomId }
  });

  const messages = shapes.data.message
  console.log(messages)

  const shape = messages.map((x: {id:number,message: string}) => {
        const messageData = JSON.parse(x.message)
        const id = x.id
        return {messageData,id};
    })

    return shape;

};

export default function CollabrationRoom() {
  const [shapes,setShapes] = useState<ShapesFromServer[]>([])
  const params = useParams<{roomId:string}>()

  const [loading,setLoading] = useState<boolean>(true)

  useEffect( ()=>{
    async function getRoomId(){

      const shapes = await getRoomShapes(params.roomId);
      setShapes(shapes)
      setLoading(false)

    }

    getRoomId()
  },[])

  if(loading){
    return(
      <div>
        shapes are cominggg...
      </div>
    )
    

  }
  
 
  return <RoomCanvas roomId={params.roomId} shapes={shapes} />;
}