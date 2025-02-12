import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import {prisma} from "@repo/db/client"

const websocket = new WebSocketServer({ port: 8081 });

interface Users {
  userId: string;
  rooms: string[];
  ws: WebSocket;
}

interface JoinRoom {
  type: string;
  roomId: string;
}

const users: Users[] = [];

const verifyToken = (token: string): string | null => {
  try {
    const verification = jwt.verify(token, "asdasd") as JwtPayload;
    return verification?.userid ?? null;
  } catch (error:any) {
    console.error("JWT Verification Failed:", error.message);
    return null;
  }
};

websocket.on("connection", (socket, req) => {
  const url = req.url;
  if (!url) {
    socket.close();
    return;
  }

  const queryParams = new URLSearchParams(url.split("?")[1]);
  let token: string | null = queryParams.get("token");

  if (!token) {
    console.log("No token provided, closing connection");
    socket.close();
    return;
  }

  const userId = verifyToken(token);
  if (!userId) {
    console.log("Invalid token, closing connection");
    socket.close();
    return;
  }

  console.log(`User connected: ${userId}`);

 
  users.push({
    userId,
    ws: socket,
    rooms: [],
  });

  
  socket.on("message",async (message) => {
    try {
      const parsedData = JSON.parse(message.toString());
      console.log("Received:", parsedData);

      if (parsedData.type === "join_room") {
        const user = users.find((x) => x.ws === socket);
        if (user) {
          user.rooms.push(parsedData.roomId);
          console.log(`User ${user.userId} joined room ${parsedData.roomId}`);
        }
      }

      if (parsedData.type === "chat") {
        

        const resp = await prisma.chats.create({
          data:{
            message:parsedData.message,
            roomId:typeof parsedData.roomId == "string" ? Number(parsedData.roomId) : parsedData.roomId, 
            userId:Number(userId)
        }})

      users.forEach((element) => {
          if (element.rooms.includes(parsedData.roomId)) {
            element.ws.send(JSON.stringify({ messageData: parsedData.message,id:resp.id }));
          }
        });
      }

      if(parsedData.type == "resized" || parsedData.type == "draged"){
        const resp = await prisma.chats.update({
          where:{
            id:typeof parsedData.id == "string" ? Number(parsedData.id) : parsedData.id,
            roomId :typeof parsedData.roomId == "string" ? Number(parsedData.roomId) : parsedData.roomId
          },
          data:{
            message:parsedData.message
          }
        })

        users.forEach((element) => {
          if (element.rooms.includes(parsedData.roomId) && element.ws !== socket) {
            element.ws.send(JSON.stringify({  messageData: parsedData.message,id:resp.id  }));
          }
        });

      }


      if(parsedData.type == "moving"){
        users.forEach((element) => {
          if (element.rooms.includes(parsedData.roomId) && element.ws !== socket) {
            element.ws.send(JSON.stringify({  messageData: parsedData.message,id:parsedData.id  }));
          }
        });

      }


    } catch (error:any) {
      console.error("Error processing message:", error.message);
    }
  });

  socket.on("close", () => {
    console.log(`User disconnected: ${userId}`);
    const index = users.findIndex((user) => user.ws === socket);
    if (index !== -1) {
      users.splice(index, 1);
    }
  });
});

console.log("WebSocket server running on port 8081");
