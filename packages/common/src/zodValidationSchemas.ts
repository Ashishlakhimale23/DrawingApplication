import zod from 'zod'
export const userverification = zod.object({
        email:zod.string().email({message:"invalid format"}),
        username:zod.string().max(20,{message:"out of length"}).min(4,{message:'too short'}),
        password:zod.string(),
 })