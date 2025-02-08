import {z} from 'zod'
export const userverification = z.object({
        email:z.string().email({message:"invalid format"}),
        username:z.string().max(20,{message:"out of length"}).min(4,{message:'too short'}),
        password:z.string(),
 })