import {Router} from "express"
import { CreateRoom, GetChats, SignInHandler, SignUpHandler } from "../controllers/users"
import { Middleware } from "../middlerware/AuthMiddleware"
export const userRouter = Router()

userRouter.post("/signup",SignUpHandler)
userRouter.post('/signin',SignInHandler)
userRouter.post("/createroom",Middleware,CreateRoom)
userRouter.get("/getchats",Middleware,GetChats)

