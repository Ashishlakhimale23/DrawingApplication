'use client'
import RoomCanvas from "@/components/chatRoom";
import { api } from "@/utils/AxiosApiConfig";
import { useEffect, useState } from "react";
import {ShapesFromServer} from "../../../draw/shape/types"


const getShapes = async (roomId: string) => {
  
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

export default function CollabrationRoom({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const [roomId,setRoomId] = useState<string>("")
  const [shapes,setShapes] = useState<ShapesFromServer[]>([])

  useEffect( ()=>{
    async function getRoomId(){
      const roomId = (await params).roomId;
      setRoomId(roomId)

      const shapes = await getShapes(roomId);
      setShapes(shapes)

    }

    getRoomId()
  },[])
  
 
  return <RoomCanvas roomId={roomId} shapes={shapes} />;
}