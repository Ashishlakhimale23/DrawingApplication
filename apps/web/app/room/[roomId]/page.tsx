import axios from "axios"
import ChatRoom from "../../components/ChatRoom"
interface RoomDetails {
    id:number,
    RoomId: string,
    adminId: number,
    CreatedAt: string
}


const getRoomDetails =async ({roomId}:{roomId:string}):Promise<RoomDetails>=>{
    const roomDetails = await axios.get("http://localhost:8000/user/roomdetails",{
        headers:{
            Authorization:`Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MDEyOTU3LCJleHAiOjE3MzkwMTY1NTd9.k4n-KexlE6JEWkExJlDORgoNDQosnCKB4ykC-fPzEFk"}`
        },
        params:{
            roomId:roomId
        }
    })

    return roomDetails.data.Details

}
export default async function Chat({params}:{params:{roomId:string}}){
    const roomId = (await params).roomId
    const roomDetails = await getRoomDetails({roomId:roomId})
    return(
        <div>
            <ChatRoom roomId={roomDetails.id}/>
        </div>
    ) 

}