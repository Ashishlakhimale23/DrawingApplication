import { WebSocket } from "ws"
interface Users {
    socket: WebSocket,
    userId: number

}

class Singleton {
    private usersInRoom: Map<string, Users[]>
    private userRoomMapping: Map<number, string>
    private static instance: Singleton

    constructor() {
        this.usersInRoom = new Map<string, Users[]>()
        this.userRoomMapping = new Map<number, string>()
    }

    static getInstance() {
        if (Singleton.instance) {
            return Singleton.instance
        }
        Singleton.instance = new Singleton()
        return Singleton.instance
    }

    addUser(roomId: string, User: Users) {
        const checkUserAlreadyInRoom = this.usersInRoom.get(roomId)
        if (checkUserAlreadyInRoom?.includes(User)) {
            return
        }
        this.usersInRoom.set(roomId, [
            ...this.usersInRoom.get(roomId) || [], User
        ])
        this.userRoomMapping.set(User.userId, roomId)

    }

    broadcast(message: string, roomId: string, senderSocket: WebSocket) {

        const users = this.usersInRoom.get(roomId)
        if (!users) {
            console.log("No users in room:", roomId);
            return;
        }

        try {
            const parsedMessage = JSON.parse(message);
            console.log("length of the users in the room ", users.length)
            users.forEach((user) => {
                try {
                    if (parsedMessage.type !== 'created') {
                        if (user.socket !== senderSocket) {
                            user.socket.send(message)
                        }
                    } else {

                        user.socket.send(message);
                    }

                } catch (error) {
                    console.error(`Failed to send message to user ${user.userId}:`, error);
                }
            });
        } catch (error) {
            console.error("Failed to parse message:", error);
        }
    }



    removeUser(user: Users) {
        const roomId = this.userRoomMapping.get(user.userId)
        if (!roomId) {
            console.log("user doesnt exists in any room")
            return
        }

        const usersInRoom = this.usersInRoom.get(roomId)

        if (usersInRoom == undefined) {
            this.usersInRoom.delete(roomId)
            this.userRoomMapping.delete(user.userId)
            return
        }

        const remainingUsers = usersInRoom.filter(remaininguser =>
            user.socket !== remaininguser.socket
        )


        if (remainingUsers?.length == 0) {
            this.usersInRoom.delete(roomId)
            this.userRoomMapping.delete(user.userId)
            return
        }

        this.usersInRoom.set(roomId, remainingUsers)
        this.userRoomMapping.delete(user.userId)

    }

}

export const singleton = Singleton.getInstance()

