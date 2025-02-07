import {Router} from "express"
import { SignInHandler, SignUpHandler } from "../controllers/users"
export const userRouter = Router()
userRouter.post("/signup",SignUpHandler)
userRouter.post('/signin',SignInHandler)