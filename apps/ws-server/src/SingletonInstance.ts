class User{
    public Socket : WebSocket;
    public UserId : string;

    constructor(Socket : WebSocket , UserId : string){
        this.Socket = Socket
        this.UserId = UserId
    }
}

class Singleton{
    private static instance :Singleton;
    private usersWithInRoom : Map<string , User[]>
    private userAndRoomMapping : Map<string , string>

    private constructor(){
        this.userAndRoomMapping = new Map<string , string>();
        this.usersWithInRoom = new Map<string , User[]>()
    }

    static getInstance(){
        if(Singleton.instance){
            return Singleton.instance
        }

        Singleton.instance = new Singleton()

        return Singleton.instance
    }

    addUser(roomId:string , user : User){
        this.usersWithInRoom.set(roomId,[
            ...this.usersWithInRoom.get(roomId) || [], user
        ])

        this.userAndRoomMapping.set(user.UserId,roomId)

    }


    broadcast(roomId:string , message : string){

    }
}