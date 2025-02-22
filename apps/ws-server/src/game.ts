import { WebSocket } from "ws"
import { prisma } from "@repo/db/client"
import { singleton } from "./SingletonInstance"

interface Users{
    socket : WebSocket,
    userId : string 
}

export class Game{
    private users : Users[]

    constructor(){
        this.users = []
    }

    addUser(user:Users){
        this.users.push(user)
        this.addHandler(user)
    }

    removeUser(user:Users){
        const index = this.users.findIndex((users) => users.socket === user.socket);
        if (index == -1) {
            console.log("user doenst exits")
            return
        }
        this.users.splice(index, 1);
        singleton.removeUser(user)
    }

    addHandler(user:Users){
        user.socket.on("message", async (message) => {
            try {
                const parsedData = JSON.parse(message.toString());
                console.log("Received:", parsedData);

                if (parsedData.type === "join_room") {
                    const userExists = this.users.find((x) => x.socket === user.socket);
                    if (userExists) {
                        singleton.addUser(parsedData.roomId,user)
                        console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
                    }
                }

                if (parsedData.type === "chat") {


                    const resp = await prisma.chats.create({
                        data: {
                            message: parsedData.message,
                            roomId: typeof parsedData.roomId == "string" ? Number(parsedData.roomId) : parsedData.roomId,
                            userId: Number(user.userId)
                        }
                    })

                    singleton.broadcast(JSON.stringify({ messageData: parsedData.message, id: resp.id }),parsedData.roomId)

                }

                if (parsedData.type == "resized" || parsedData.type == "draged") {
                    const resp = await prisma.chats.update({
                        where: {
                            id: typeof parsedData.id == "string" ? Number(parsedData.id) : parsedData.id,
                            roomId: typeof parsedData.roomId == "string" ? Number(parsedData.roomId) : parsedData.roomId
                        },
                        data: {
                            message: parsedData.message
                        }
                    })

                    singleton.broadcast(JSON.stringify({ messageData: parsedData.message, id: resp.id }),parsedData.roomId)


                }


                if (parsedData.type == "moving") {
                    singleton.broadcast(JSON.stringify({ messageData: parsedData.message, id: parsedData.id }),parsedData.roomId)

                }


                if (parsedData.type == "delete") {

                    const resp = await prisma.chats.delete({
                        where: {
                            id: typeof parsedData.id == "string" ? Number(parsedData.id) : parsedData.id,
                            roomId: typeof parsedData.roomId == "string" ? Number(parsedData.roomId) : parsedData.roomId
                        }
                    })


                    singleton.broadcast(JSON.stringify({ type: "deleted", id: parsedData.id }),parsedData.roomId)

                }


            } catch (error: any) {
                console.error("Error processing message:", error.message);
            }
        });

    }
}