import axios from "axios"
import ClientRoomChat from "./ClientRoomChat"

 interface Chats{
 id: number,
 message:string,
 userId: number,
 roomId:number 
}

const getChat=async(roomId:number):Promise<Chats[]>=>{
    const chats = await axios.get('http://localhost:8000/user/getchats',
        {
            headers:{
            Authorization:`Bearer ${"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6ImFzaGlzaCIsImVtYWlsIjoiYXNoaXNoQGdtYWlsLmNvbSIsInVzZXJpZCI6MSwiaWF0IjoxNzM5MDEyOTU3LCJleHAiOjE3MzkwMTY1NTd9.k4n-KexlE6JEWkExJlDORgoNDQosnCKB4ykC-fPzEFk"}`
        },
        params:{
            roomId:roomId
        }
    }
    )
    return chats.data.message
}

export default async function ChatRoom({roomId}:{roomId:number}){
    const getchats = await getChat(roomId)

    return (
          <ClientRoomChat roomId={roomId} messages={getchats}/>
    )

}