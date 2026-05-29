import { prisma } from '@repo/db/client';
import { singleton } from './SingletonInstance'; 
import WebSocket from 'ws';



interface Users {
    socket: WebSocket;
    userId: number;
}

interface MessageData {
    type: 'join_room' | 'created' | 'resized' | 'draged' | 'moving' | 'drawing' | 'delete' | 'edited';
    roomId: string | number;
    message?: string;
    id?: string | number;
}

export class Game {
    private users: Users[];

    constructor() {
        this.users = [];
    }

    addUser(user: Users) {

        //even if the userid is same 
        const ifUserexist = this.users.includes(user)
        if(ifUserexist){
            const length = this.users.length
            let uniqueUser: Users
            if (length == 0) {

                uniqueUser = {
                    userId: user.userId,
                    socket: user.socket
                }

                this.users.push(uniqueUser);
                this.addHandler(uniqueUser);
            } else {
                const lastUsersId = this.users[length - 1]
                const updateUserId = lastUsersId?.userId! + 1
                uniqueUser = {
                    userId: updateUserId,
                    socket: user.socket
                }

                this.users.push(uniqueUser);
                this.addHandler(uniqueUser)

            }
        }else{
            this.users.push(user)
            this.addHandler(user)
        }

        
       
    }

    removeUser(user: Users) {
        const index = this.users.findIndex((users) => users.socket === user.socket);
        
        if (index === -1) {
            console.log("user doesn't exist");
            return;
        }
        this.users.splice(index, 1);
      
      
        singleton.removeUser(user);
    }

    addHandler(user: Users) {
        user.socket.on("message", async (message) => {
            try {
                const parsedData = JSON.parse(message.toString()) as MessageData;
                console.log("Received:", parsedData);

                switch (parsedData.type) {
                    case "join_room":
                        const userExists = this.users.find((x) => x.socket === user.socket);
                        if (userExists) {
                            singleton.addUser(parsedData.roomId.toString(), user);
                            console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
                        }
                        break;

                    case "created":
                        try {
                            const createdShape = await prisma.chats.create({
                                data: {
                                    message: parsedData.message || '',
                                    roomId: Number(parsedData.roomId),
                                    userId: Number(user.userId)
                                }
                            });
                            
                            singleton.broadcast(
                                JSON.stringify({
                                    type: 'created',
                                    messageData: parsedData.message,
                                    id: createdShape.id
                                }),
                                parsedData.roomId.toString(),
                                user.socket
                            );
                        } catch (error) {
                            console.error("Error creating chat:", error);
                        }
                        break;

                    case "resized":
                    case "draged": 
                        try {
                            
                            
                            singleton.broadcast(
                                JSON.stringify({
                                    type: 'moved',
                                    messageData: parsedData.message,
                                    id: parsedData.id
                                }),
                                parsedData.roomId.toString(),
                                user.socket
                            );

                            await prisma.chats.update({
                                where: {
                                    id: Number(parsedData.id),
                                    roomId: Number(parsedData.roomId)
                                },
                                data: {
                                    message: parsedData.message
                                }
                            });
                        } catch (error) {
                            console.error(`Error updating chat:`, error);
                        }
                        break;

                    case "moving":
                    case "drawing":
                        singleton.broadcast(
                            JSON.stringify({
                                type: parsedData.type === 'moving' ? 'moved' : 'drawing', 
                                messageData: parsedData.message,
                                id: parsedData.id
                            }),
                            parsedData.roomId.toString(),
                            user.socket
                        );
                        break;

                    case "delete":
                        try {
                            await prisma.chats.delete({
                                where: {
                                    id: Number(parsedData.id),
                                    roomId: Number(parsedData.roomId)
                                }
                            });
                            
                            singleton.broadcast(
                                JSON.stringify({
                                    type: "deleted",
                                    id: parsedData.id
                                }),
                                parsedData.roomId.toString(),
                                user.socket
                            );
                        } catch (error) {
                            console.error("Error deleting chat:", error);
                        }
                        break;

                    case "edited":
                        try {
                            await prisma.chats.update({
                                where: {
                                    id: Number(parsedData.id),
                                    roomId: Number(parsedData.roomId)
                                },
                                data: {
                                    message: parsedData.message
                                }
                            });
                            
                            singleton.broadcast(
                                JSON.stringify({
                                    type: "edited",
                                    messageData: parsedData.message,
                                    id: parsedData.id
                                }),
                                parsedData.roomId.toString(),
                                user.socket
                            );
                        } catch (error) {
                            console.error("Error editing chat:", error);
                        }
                        break;
                }
            } catch (error) {
                console.error("Error processing message:", error instanceof Error ? error.message : 'Unknown error');
            }
        });
    }
}