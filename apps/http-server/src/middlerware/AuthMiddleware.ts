import { NextFunction,Request,Response } from "express";
import jwt, { JwtPayload } from "jsonwebtoken"
declare global {
    namespace Express{
        interface Request{
            userId?:number;
        }
    }
}
export const Middleware =async (req:Request,res:Response,next:NextFunction)=>{
    let token : string | undefined= req.headers.authorization 
    token = token?.split("")[1]
    if(token==undefined && typeof token !="string"){
        res.json({message:"unathorized"})
    }
    const verfication = jwt.verify(token as string,"asdasd")
    if(!verfication){
        res.status(403).json({message:"unauthorized"})
        return
    }
    req.userId = (verfication as JwtPayload).username
    next()

}