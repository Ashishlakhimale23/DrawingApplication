import { WebSocketServer, WebSocket } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Game } from "./game";

const websocket = new WebSocketServer({ port: 8081 });


const game = new Game()

const verifyToken = (token: string): string | null => {
  try {
    const verification = jwt.verify(token, "asdasd") as JwtPayload;
    return verification?.userid ?? null;
  } catch (error: any) {
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

  game.addUser({userId:userId,socket:socket})   
  

  socket.on("close", () => {
    game.removeUser({userId:userId,socket:socket})
  });
});

console.log("WebSocket server running on port 8081");
