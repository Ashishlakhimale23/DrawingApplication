import {RefObject} from "react"
interface Shape {
    type : string ,  
    x : number,
    y : number,
    width :number,
    height:number
}
type TypeOfShapes = {
    type: "Rectangle" | "default"
}


export const reDrawing =(ctxRef:RefObject<CanvasRenderingContext2D | null>,canvasRef:RefObject<HTMLCanvasElement | null>,shapes:RefObject<Shape[]>)=>{
        if(ctxRef.current && canvasRef.current)
        shapes.current.forEach((element)=>{
        ctxRef.current?.strokeRect(element.x,element.y,element.width,element.height)
        })
}


export const Draw = (ctxRef:RefObject<CanvasRenderingContext2D | null>,canvasRef:RefObject<HTMLCanvasElement | null>,InitialPoints:RefObject<{x: number;y: number}>,MovingPoints:RefObject<{x: number;y: number}>,typeOfShape:RefObject<TypeOfShapes>)=>{
   console.log(typeOfShape)
   if(!typeOfShape) return 
    if(ctxRef.current && canvasRef.current && typeOfShape.current){


        switch(typeOfShape.current.type){
            case "Rectangle": 
                ctxRef.current.strokeRect(InitialPoints.current.x,InitialPoints.current.y,MovingPoints.current.x - InitialPoints.current.x,MovingPoints.current.y - InitialPoints.current.y)
            default:
                null
        }

    }

}

