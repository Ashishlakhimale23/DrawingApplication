import RoomCanvas from "@/component/chatRoom";
import axios from "axios";

const getShapes = async (roomId: string) => {
  const shapes = await axios.get("http://localhost:8000/user/getchats", {
    params: { roomId: roomId },
    headers: {
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5ODc2ODM3LCJleHAiOjE3Mzk5MDIwMzd9.GHPmEf6qbNNczhyd9cDXVp0wbgXZwB974Bm4TsrvX-E"}`,
    },
  });

  const messages = shapes.data.message


  const shape = messages.map((x: {id:number,message: string}) => {
        const messageData = JSON.parse(x.message)
        const id = x.id
        return {messageData,id};
    })

   console.log(shape) 
    return shape;

};

export default async function CollabrationRoom({
  params,
}: {
  params: {
    roomId: string;
  };
}) {
  const roomId = (await params).roomId;
  const shapes = await getShapes(roomId);
  return <RoomCanvas roomId={roomId} shapes={shapes} />;
}