import {RefObject} from "react"
interface Shape {
    type : string ,  
    x : number,
    y : number,
    width :number,
    height:number
}
export const drawing =(ctxRef:RefObject<CanvasRenderingContext2D | null>,canvasRef:RefObject<HTMLCanvasElement | null>,shapes:RefObject<Shape[]>,InitialPoints:RefObject<{x: number,y: number}>,MovingPoinst:RefObject<{x: number,y: number}>)=>{
        if(ctxRef.current && canvasRef.current)
        ctxRef.current?.clearRect(0,0,canvasRef.current?.width,canvasRef.current?.height)
        shapes.current.map((element)=>{
        ctxRef.current?.strokeRect(element.x,element.y,element.width,element.height)
        })
        const y = InitialPoints.current.y
        const x = InitialPoints.current.x
        const width = MovingPoinst.current.x - InitialPoints.current.x
        const height = MovingPoinst.current.y - InitialPoints.current.y
        ctxRef.current?.strokeRect(x,y,width,height)
    }