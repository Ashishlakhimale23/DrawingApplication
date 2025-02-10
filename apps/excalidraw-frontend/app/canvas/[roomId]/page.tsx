
import  RoomCanvas  from "@/component/chatRoom"
import axios from "axios"

const getShapes=async(roomId:string)=>{
  const shapes = await axios.get('http://localhost:8000/user/getchats',{
    params:{roomId:roomId},
    headers:{
      Authorization : `Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MTY3NTA5LCJleHAiOjE3MzkxOTI3MDl9.fBzacv_UXxdO8COiBYKz2h9VnH5HYUSCavcuZoAcQH8"}`
    }
  },
  
)
console.log(shapes.data)
return shapes.data.message
}
export default async function CollabrationRoom({params}:{params:{
  roomId:string
}}){
  const roomId = (await params).roomId
  const shapes = await getShapes(roomId)
  return(
    <RoomCanvas roomId={roomId} shapes={shapes}/>
  )

}