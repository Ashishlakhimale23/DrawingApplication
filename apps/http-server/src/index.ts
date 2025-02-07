import express from "express";
import { userRouter } from "./Routes/UserRoutes";
const app = express()
app.use(express.json())
app.use('/user',userRouter)
app.listen(8000,()=>console.log("server started at 8000"))