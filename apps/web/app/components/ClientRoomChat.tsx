"use client"
import {useEffect,useState} from "react"
import useSocket from "../hooks/useSocket" 
 interface Chats{
 id: number,
 message:string,
 userId: number,
 roomId:number 
}
export default function ClientRoomChat({roomId,messages}:{roomId:number,messages:Chats[]}){
    const {socket,loading} = useSocket()
    const [message,setMessage] = useState<string>("")


    const sendChat = () =>{

    if(!loading && socket.current)
       socket.current.send(
         JSON.stringify({
           type: "chat",
           roomId: roomId,
           message:message
         })
       );

    }

    useEffect(()=>{

       if(!loading && socket.current)
       socket.current.send(
         JSON.stringify({
           type: "join_room",
           roomId: roomId,
         })
       ); 

    },[roomId])


    return (
        <div>

            <div>
                {
                    messages.map((element)=>(
                        <div key={element.id}>{element.message}</div>
                    ))
                }
            </div>

            <input type="text" value={message} onChange={(e)=>{
                setMessage(e.target.value)
            }} />
            <button onClick={sendChat} >send</button> 
        </div>
    )

}