import { Request,Response } from "express"
import jwt from "jsonwebtoken"
import {userverification} from '@repo/common/zod'
import prisma from "@repo/db/client"
import bcrypjs from "bcryptjs"
interface User{
    email:string,
    password:string,
    username:string
}

interface roomID {
    roomid : string
}

export const SignUpHandler = async (req:Request<{},{},User>,res:Response) =>{
    const {email,password,username} = req.body
    
    const validationCheck = userverification.safeParse({
        username:username,
        email:email,
        password:password
    })
    if(validationCheck.error){
        res.json({message:validationCheck.error.message})
        return
    }
   
    const exists = await prisma.user.findFirst({where:{
        username:username,
        email:email,
    }})

    if(exists){
        res.json({message:"user already exists"})
        return 
    }

    const hashedPassword = await bcrypjs.hash(password,10)
    const create = await prisma.user.create({
        data:{
            username:username,
            email:email,
            password:hashedPassword
        }
    })
    if(!create){
        res.json({message:"something went wrong"})
    }

    const token = jwt.sign({username:username,email:email},'asdasd',{expiresIn:"1h"})
     res.json({token:token})
     return

}

export const SignInHandler = async (req:Request<{},{},User>,res:Response) =>{
    const {email,password,username} = req.body
    
    const validationCheck = userverification.safeParse({
        username:username,
        email:email,
        password:password
    })
    if(validationCheck.error){
        res.json({message:validationCheck.error.message})
        return
    }

    const exists = await prisma.user.findFirst({where:{
        username:username,
        email:email,
    }})

    if(!exists) {
        res.json({message:"user doenst exist"})
    }

    const passwordCheck =  bcrypjs.compare(password,exists!.password)

    if(!passwordCheck){
        res.json({message:"password incorrect"})
        return 
    }

    

    const token = jwt.sign({username:username,email:email},'asdasd',{expiresIn:"1h"})
    res.json({token:token})
    return

}

export const CreateRoom = async (req:Request<{},{},roomID>,res:Response)=>{
    const roomId = req.body.roomid
    const userid = req.userId
    const exists = await prisma.room.findFirst({
        where:{
            RoomId:roomId
        }
    })

    if(exists){
        res.json({message:`room already exist with roomId ${roomId}`})
        return 
    }

    const create =await prisma.room.create({
        data:{
            RoomId:roomId,
            admin:{
                connect:{
                   id:userid                 
                }
            }
        },
    })

    if(!create){
        res.json({message:"something occured could'nt create the room"})
    }
    res.json({message:"room created"})
    return
}


export const GetChats = async (req:Request,res:Response) =>{
    const roomId = req.query.roomId as string
    const userId = req.userId
    const userInTheRoom = await prisma.user.findFirst({
        where:{
            id:userId,
            rooms: {
                some: {
                    RoomId: roomId
                }
            }
        }
    })

    if(!userInTheRoom){
        res.json({message:"You dont have an access to the chats of this room"})
    }

    const chats = await prisma.chats.findMany({
        take:50,
        where:{
            roomId:userInTheRoom?.id
        },
        
    })

    res.json({message:chats})
    return


}