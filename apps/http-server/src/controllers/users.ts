import { Request,Response } from "express"
import jwt from "jsonwebtoken"
import {userverification} from '@repo/common/zod'
interface User{
    email:string,
    password:string,
    username:string
}
export const SignUpHandler = async (req:Request<{},{},User>,res:Response) =>{
    const {email,password,username} = req.body
    
    //zod validation
    const validationCheck = userverification.safeParse({
        username:username,
        email:email,
        password:password
    })
    if(validationCheck.error){
        res.json({message:validationCheck.error.message})
        return
    }

    //check in the data if user exists
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
    //zod validation
    //check in the data if user exists
    const token = jwt.sign({username:username,email:email},'asdasd',{expiresIn:"1h"})
    res.json({token:token})
    return

}