import {WebSocketServer } from "ws"
import jwt, { JwtPayload } from "jsonwebtoken"
const websocket = new WebSocketServer({port:8001})
websocket.on("connection",(socket,Request)=>{
    const url = Request.url
    if(!url){
        return 

    }
    const queryParams = new URLSearchParams(url.split("?")[1])
    let token :string | null = queryParams.get("token")
    
    const verfication = jwt.verify(token as string,"asdasd")
    if(!verfication || !(verfication as JwtPayload).username){
        websocket.close()
        return
    }
    

})