import RoomCanvas from "@/component/chatRoom";
import axios from "axios";

const getShapes = async (roomId: string) => {
  const shapes = await axios.get("http://localhost:8000/user/getchats", {
    params: { roomId: roomId },
    headers: {
      Authorization: `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MjUzODA5LCJleHAiOjE3MzkyNzkwMDl9.WiuSsBZXGRMt1sR_AwO-_XzEHwSR2KIZXGPyHIwVsAc"}`,
    },
  });

  const messages = shapes.data.message
  console.log(messages)

  const shape = messages.map((x: {message: string}) => {
        const messageData = JSON.parse(x.message)
        return messageData;
    })

    console.log("here is the shape" ,shape)
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