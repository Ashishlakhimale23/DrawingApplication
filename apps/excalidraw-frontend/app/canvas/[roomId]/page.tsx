"use client"
import RoomCanvas from "@/components/chatRoom";
import axios from "axios";

const getShapes = async (roomId: string,token:string) => {
  
  const shapes = await axios.get("http://localhost:8000/user/getchats", {
    params: { roomId: roomId },
    
  });

  const messages = shapes.data.message

  const shape = messages.map((x: {id:number,message: string}) => {
        const messageData = JSON.parse(x.message)
        const id = x.id
        return {messageData,id};
    })

    return shape;

};

export default async function CollabrationRoom({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const token = localStorage.getItem("authtoken")
  if(token==null){
    return
  }
  const roomId = (await params).roomId;
  const shapes = await getShapes(roomId,token);
  return <RoomCanvas roomId={roomId} shapes={shapes} />;
}