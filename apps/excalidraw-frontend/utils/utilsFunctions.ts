import { Shape } from "@/utils/types";
import { rectangle } from "@/draw/shape/Rectangle";
import { circle } from "@/draw/shape/Circle";
import { line } from "@/draw/shape/Line";
import { Pencils } from "@/draw/shape/Pencil";
import { texts } from "@/draw/shape/Text";


export class UtlisFunction{
    private rectangle : rectangle
    private circle : circle
    private line : line
    private pencil : Pencils
    private text : texts
    private ctx : CanvasRenderingContext2D

    constructor(ctx:CanvasRenderingContext2D){
        this.rectangle = new rectangle()
        this.circle = new circle()
        this.line = new line()
        this.pencil = new Pencils()
        this.text = new texts()
        this.ctx = ctx
    }

    getIfOnAnyShapesEdge(shape:Shape,MovingPointX:number,MovingPointY:number){

        switch(shape.type){

            case "rectangle":
                const resultRectangle = this.rectangle.handleSelection(shape,MovingPointX,MovingPointY)
                return resultRectangle
                break
            case "circle":
                const resultCircle = this.circle.getOnCirleCircumfurance(shape,MovingPointX,MovingPointY)
                return resultCircle
                break
            case "line":
                const resultLine = this.line.insideShape(shape,MovingPointX,MovingPointY)
                return resultLine
                break
            case "pencil":
                const resultPencil = this.pencil.insideShape(shape,MovingPointX,MovingPointY)
                return resultPencil
                break
            case "text":
                const resultText = this.text.insideShape(shape,MovingPointX,MovingPointY,this.ctx)
                return resultText
            default:
                return
        }

    }


    getOnWhichEdge(shape:Shape,MovingPointX:number,MovingPointY:number){
        if(!shape.selected){
            return 
        }

        switch(shape.type){
            case "rectangle":
                const edgeRectangle = this.rectangle.resizingEdge(shape,MovingPointX,MovingPointY) 
                return edgeRectangle?.edge
               
            case "circle":
                const edgeCircle = this.circle.resizingEdge(shape,MovingPointX,MovingPointY)
                return edgeCircle.edge
            case "line":
                const edgeLine = this.line.getOnWhichPoint(shape,MovingPointX,MovingPointY)
                return edgeLine
            case "pencil":
                const edgePencil = this.pencil.resizingEdge(shape,MovingPointX,MovingPointY)
                return edgePencil.edge
            case "text":
                const edgeText = this.text.resizingEdge(shape,MovingPointX,MovingPointY,this.ctx)
                return edgeText.edge
            default:
                return null
        }

    }

    
}