interface BaseShape {
    id?: number
    type: string;
    x: number;
    y: number;
    selected: boolean;
    isResizing: boolean;
    resizingEdge: string;
    isDraging: boolean
}

interface Circles extends BaseShape {
    type: "circle";
    radius: number;
}

export class Circle {
    
    draw(x:number,y:number,radius:number,ctx:CanvasRenderingContext2D){
       
        ctx.strokeStyle = "white"
        ctx.lineWidth = 4
    
        ctx.beginPath()
        ctx.arc(x,y,radius, 0, 2 * Math.PI);
        ctx.closePath()
        ctx.stroke()
       

    }

    drawSelectedShape(shape:Circles,ctx:CanvasRenderingContext2D){
        if(!shape.selected){
            return
        }
       
        ctx.strokeStyle = "gray"
        ctx.lineWidth = 2

        ctx.beginPath()
        ctx.arc(shape.x, shape.y, shape.radius + 7, 0, 2 * Math.PI);
        ctx.stroke()
        ctx.closePath()
        

    }

    insideShape(shape:Circles,InitialPointX:number,InitialPointY:number){
        const calculatedRadius = Math.sqrt(Math.pow(shape.x - InitialPointX, 2) + Math.pow(shape.y - InitialPointY, 2))
        return (calculatedRadius + 5 <= shape.radius)
    }

    getOnCirleCircumfurance(shape:Circles,InitialPointX:number,InitialPointY:number){
            const calculatedRadius = Math.sqrt(Math.pow(shape.x - InitialPointX, 2) + Math.pow(shape.y - InitialPointY, 2))
            return (Math.abs(calculatedRadius - shape.radius) <= 5)
    }

    resizingLogic(shape:Circles,MovingPointX:number,MovingPointY:number){
        let radius = Math.sqrt(Math.pow(MovingPointX - shape.x, 2) + Math.pow(MovingPointY - shape.y, 2))
        shape.radius = radius
    }
    
}


export const circle = new Circle()