interface Users{
    ws : WebSocket,
}

class Singleton {
    private userRoomMapping : Map<string,Users[]> 
    private static instance : Singleton

    constructor(){
        this.userRoomMapping = new Map<string,Users[]>
    }

    static getInstance(){
        if(Singleton.instance){
            return Singleton.instance
        }
        Singleton.instance = new Singleton()
        return Singleton.instance
    }

    addUser(roomId:string , User:Users){
        this.userRoomMapping.set(roomId,[
            ...(this.userRoomMapping.get(roomId) || []),User
        ])

    }
     
    broadcast(message:string,roomId:string){
        const users = this.userRoomMapping.get(roomId)
        if(!users){
            console.log("no users in the room")
            return
        }

        users.forEach((user)=>{
            user.ws.send(message)
        })
    }


   //will add more functions

}

export const singleton = Singleton.getInstance()

