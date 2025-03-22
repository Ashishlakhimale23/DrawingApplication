"use client"
import Canvas from "@/components/Canvas"
import { api } from "@/utils/AxiosApiConfig"
import { ShapesFromServer } from "@/utils/types"
import {useEffect, useState} from "react"
const getuserchats =async()=>{
    const userchats = await api.get('/user/userchats')
    if (userchats.status == 200) {
      const shape = userchats.data.chats.map(
        (x: { id: number; message: string }) => {
          const messageData = JSON.parse(x.message);
          const id = x.id;
          return { messageData, id };
        }
      );
      return shape;
    }
}
export default function UserCanvas(){

    const [shapes,setShapes] = useState<ShapesFromServer[]>([])
    const [loading,setLoading] = useState<boolean>(true)

    useEffect(()=>{
        const getchats =async ()=>{
            const chats =await getuserchats()
            console.log(chats)
            setShapes(chats)
            setLoading(false)
        }

        getchats()

    },[])

    if(loading){
        return <div>shapes are comingg</div>

    }

    return <Canvas Existingshapes={shapes}/>

    

}