import {Router} from "express"
import { CreateRoom, DeleteChat, EditChats, GetRoomChats, GetRoomDetails, GetUsersChats, InsertChats, SignInHandler, SignUpHandler } from "../controllers/users"
import { Middleware } from "../middlerware/AuthMiddleware"
export const userRouter = Router()

userRouter.post("/signup",SignUpHandler)
userRouter.post('/signin',SignInHandler)
userRouter.post("/createroom",Middleware,CreateRoom)
userRouter.get("/getchats",Middleware,GetRoomChats)
userRouter.get("/userchats",Middleware,GetUsersChats)
userRouter.get("/roomdetails",Middleware,GetRoomDetails)
userRouter.post("/insertchat",Middleware,InsertChats)
userRouter.post("/editchat",Middleware,EditChats)
userRouter.post("/deletechat",Middleware,DeleteChat)

