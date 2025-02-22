import { WebSocket } from "ws"
interface Users{
    socket : WebSocket,
    userId : string 
}

class Singleton {
    private usersInRoom : Map<string,Users[]> 
    private userRoomMapping : Map<string,string>
    private static instance : Singleton

    constructor(){
        this.usersInRoom  = new Map<string,Users[]>()
        this.userRoomMapping = new Map<string,string>()
    }

    static getInstance(){
        if(Singleton.instance){
            return Singleton.instance
        }
        Singleton.instance = new Singleton()
        return Singleton.instance
    }

    addUser(roomId:string , User:Users){
        this.usersInRoom.set(roomId,[
            ...(this.usersInRoom.get(roomId) || []),User
        ])

        this.userRoomMapping.set(User.userId,roomId)

    }
     
    broadcast(message:string,roomId:string){
        const users = this.usersInRoom.get(roomId)
        if(!users){
            console.log("no users in the room")
            return
        }

        users.forEach((user)=>{
            user.socket.send(message)
        })
    }



   removeUser(user:Users){

    const roomId = this.userRoomMapping.get(user.userId)
    if(!roomId){
        console.log("no users exist in the room")
        return
    }

    const rooms = this.usersInRoom.get(roomId)

    const remainingUsers = rooms?.filter((user)=>{
        user.socket ! == user.socket
    })

    if(!remainingUsers){
        return
    }

    this.usersInRoom.set(roomId,remainingUsers)

    if(this.usersInRoom.get(roomId)?.length === 0){
        this.usersInRoom.delete(roomId)
    }
    this.userRoomMapping.delete(user.userId)

   }

}

export const singleton = Singleton.getInstance()

