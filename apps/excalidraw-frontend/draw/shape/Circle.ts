import { ValueOf } from "next/dist/shared/lib/constants";

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
    radiusX: number;
    radiusY :number
}

export class circle {
    
    draw(shape:Circles,ctx:CanvasRenderingContext2D){
       
        ctx.strokeStyle = "white"
        ctx.lineWidth = 4
    
        ctx.beginPath()
        ctx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI, false);
        ctx.stroke()
        ctx.closePath()
       

    }

    drawSelectedShape(shape: Circles, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    ctx.fillStyle = "white";

    const bounds = {
        x: shape.x - shape.radiusX,
        y: shape.y - shape.radiusY,
        width: shape.radiusX * 2,
        height: shape.radiusY * 2
    };

    ctx.strokeRect(
        bounds.x - 5,
        bounds.y - 5,
        bounds.width + 10,
        bounds.height + 10
    );

    const handleSize = 8;
    const handles = [
        [bounds.x - 10  , bounds.y - 10],                           
        [bounds.x + bounds.width + 2 , bounds.y - 10],            
        [bounds.x - 10, bounds.y + bounds.height ],           
        [bounds.x + bounds.width , bounds.y + bounds.height]  
    ];

    handles.forEach(([x, y]) => {

        ctx.save() 
        ctx.beginPath()
        ctx.roundRect(x, y,8,8,2);
        ctx.fill()
        ctx.closePath()
        ctx.restore()
       
    });

    ctx.restore();
}

    insideShape(shape:Circles,InitialPointX:number,InitialPointY:number){
       const dx = InitialPointX - shape.x 
       const dy = InitialPointY - shape.y

       const tolerance = 0.1
       const result =(Math.pow(dx, 2) / Math.pow(shape.radiusX, 2)) + 
                  (Math.pow(dy, 2) / Math.pow(shape.radiusY, 2)); 

        return result <= (1 + tolerance )
    }

    getOnCirleCircumfurance(shape: Circles, InitialPointX: number, InitialPointY: number) {
    const dx = InitialPointX - shape.x;
    const dy = InitialPointY - shape.y;
    
    const result = (Math.pow(dx, 2) / Math.pow(shape.radiusX, 2)) + 
                  (Math.pow(dy, 2) / Math.pow(shape.radiusY, 2));
    
    const tolerance = 0.1; 
    return Math.abs(result - 1) <= tolerance;
}

resizingLogic(shape: Circles, MovingPointX: number, MovingPointY: number) {
    const minRadius = 5;
    
    if (shape.radiusX <= minRadius && shape.radiusY > minRadius) {

        
        switch (shape.resizingEdge) {
            case "right":
                shape.resizingEdge = "left"
                break
            case 'left':
                shape.resizingEdge = 'right'
                break
            case "top-left":
                shape.resizingEdge = "top-right"
                break
            case "top-right":
                shape.resizingEdge = "top-left"
                break
            case "bottom-left":
                shape.resizingEdge = 'bottom-right'
                break
            case "bottom-right":
                shape.resizingEdge = "bottom-left"
                break
            default:
                break

        }

    }

    if (shape.radiusY <= minRadius && shape.radiusX > minRadius) {

        switch (shape.resizingEdge) {
            case "right":
                shape.resizingEdge = "left"
                break
            case 'left':
                shape.resizingEdge = 'right'
                break
            case "top":
                shape.resizingEdge = "bottom"
                break
            case "bottom":
                shape.resizingEdge = "top"
                break
            case "top-left":
                shape.resizingEdge = "bottom-right"
                break
            case "top-right":
                shape.resizingEdge = "bottom-left"
                break
            case "bottom-left":
                shape.resizingEdge = 'top-right'
                break
            case "bottom-right":
                shape.resizingEdge = "top-left"
                break
            default:
                break

        }
    }

    if (shape.radiusX <=minRadius && shape.radiusY <=minRadius ) {


        switch (shape.resizingEdge) {
            case "top-left":
                shape.resizingEdge = "bottom-right"
                break
            case "top-right":
                shape.resizingEdge = "bottom-left"
                break
            case 'bottom-right':
                shape.resizingEdge = "top-left"
                break
            case "bottom-left":
                shape.resizingEdge = "top-right"
                break


        }

    }

    switch (shape.resizingEdge) {
        case "top-left":
            const bottomRightX = shape.x + shape.radiusX;
            const bottomRightY = shape.y + shape.radiusY;
            
            shape.radiusX = Math.max(Math.abs(bottomRightX - MovingPointX) / 2, minRadius);
            shape.radiusY = Math.max(Math.abs(bottomRightY - MovingPointY) / 2, minRadius);
            
            shape.x = MovingPointX + shape.radiusX;
            shape.y = MovingPointY + shape.radiusY;
            break;

        case "top-right":
            const bottomLeftX = shape.x - shape.radiusX;
            const bottomLeftY = shape.y + shape.radiusY;
            
            shape.radiusX = Math.max(Math.abs(MovingPointX - bottomLeftX) / 2, minRadius);
            shape.radiusY = Math.max(Math.abs(bottomLeftY - MovingPointY) / 2, minRadius);
            
            shape.x = bottomLeftX + shape.radiusX;
            shape.y = bottomLeftY - shape.radiusY;
            break;

        case "bottom-left":
            const topRightX = shape.x + shape.radiusX;
            const topRightY = shape.y - shape.radiusY;
            
            shape.radiusX = Math.max(Math.abs(topRightX - MovingPointX) / 2, minRadius);
            shape.radiusY = Math.max(Math.abs(MovingPointY - topRightY) / 2, minRadius);
            
            shape.x = topRightX - shape.radiusX;
            shape.y = topRightY + shape.radiusY;
            break;

        case "bottom-right":
            const topLeftX = shape.x - shape.radiusX;
            const topLeftY = shape.y - shape.radiusY;
            
            shape.radiusX = Math.max(Math.abs(MovingPointX - topLeftX) / 2, minRadius);
            shape.radiusY = Math.max(Math.abs(MovingPointY - topLeftY) / 2, minRadius);
            
            shape.x = topLeftX + shape.radiusX;
            shape.y = topLeftY + shape.radiusY;
            break

        case 'left':
            const rightEdgeX = shape.x + shape.radiusX;
            const newRadiusX = Math.max((rightEdgeX - MovingPointX) / 2, minRadius);

            shape.x = rightEdgeX - newRadiusX;
            shape.radiusX = newRadiusX;
            break;

        case 'right':
            const leftEdgeX = shape.x - shape.radiusX
           
            shape.x = leftEdgeX + Math.max(( MovingPointX - leftEdgeX )/2,minRadius)
            shape.radiusX =  Math.max((MovingPointX - leftEdgeX )/2,minRadius)
            break

        case "top" :
            const bottomEdgeY = shape.y + shape.radiusY
            const newRadiusY = Math.max((bottomEdgeY - MovingPointY )/2,minRadius) 
            shape.y = bottomEdgeY - newRadiusY
            shape.radiusY = newRadiusY
            break
        
        case 'bottom':
            const topEdgeY = shape.y - shape.radiusY;
            const newBottomRadiusY = Math.max((MovingPointY - topEdgeY) / 2, minRadius);

            shape.y = topEdgeY + newBottomRadiusY;
            shape.radiusY = newBottomRadiusY;
            break;


        
    }
}
    
    onCorner(shape:Circles,InitialPointX:number,InitialPointY:number){
        //rectangle
        const bounds = {
            x: shape.x - shape.radiusX,
            y: shape.y - shape.radiusY,
            width: shape.radiusX * 2,
            height: shape.radiusY * 2
        };
        //corners 
        const handles = [
            [bounds.x - 10, bounds.y - 10], // top left 
            [bounds.x + bounds.width + 2, bounds.y - 10], // top right
            [bounds.x - 10, bounds.y + bounds.height], // bottom left
            [bounds.x + bounds.width, bounds.y + bounds.height] // bottom right
        ];

        const corners = {
            0 : 'top-left',
            1 : 'top-right',
            2 : 'bottom-left',
            3 : 'bottom-right'
        }

        const tolerance = 10
        let result = false
        let corner : ValueOf<typeof corners> = ""
         handles.forEach(([x,y],i) => {
            console.log(i , x-InitialPointX , y - InitialPointY)

            if(Math.abs(x - InitialPointX) < tolerance  && Math.abs(y - InitialPointY) < tolerance){
                corner = corners[i as keyof typeof corners]
                result  = true        
            }
        }); 

        return {result,corner}
        


    }


    handleSelection(shape: Circles, InitialPointX: number, InitialPointY: number){
        const tolerance = 10
        const bounds = {
            x: shape.x - shape.radiusX,
            y: shape.y - shape.radiusY,
            width: shape.radiusX * 2,
            height: shape.radiusY * 2
        };
        let edge ;
        const minX = Math.min(bounds.x, bounds.x + bounds.width);
        const maxX = Math.max(bounds.x, bounds.x + bounds.width);
        const minY = Math.min(bounds.y, bounds.y + bounds.height);
        const maxY = Math.max(bounds.y, bounds.y + bounds.height);
        const result  = (
            (Math.abs(InitialPointX - minX) <= tolerance &&
                minY <= InitialPointY &&
                InitialPointY <= maxY) ||
            (Math.abs(InitialPointY - minY) <= tolerance &&
                minX <= InitialPointX &&
                InitialPointX <= maxX) ||
            (Math.abs(InitialPointX - maxX) <= tolerance &&
                minY <= InitialPointY &&
                InitialPointY <= maxY) ||
            (Math.abs(InitialPointY - maxY) <= tolerance && minX <= InitialPointX && InitialPointX <= maxX)
        );

         if (Math.abs(InitialPointX - bounds.x) < tolerance) {
                edge = "left";
            }
            if (Math.abs(InitialPointX - (bounds.x + bounds.width)) <tolerance) {
                edge = "right";
            }
            if (Math.abs(InitialPointY - bounds.y) <tolerance) {
                edge = "top";
            }
            if (Math.abs(InitialPointY - (bounds.y + bounds.height)) < tolerance) {
                edge = "bottom";
            } 
        return {result,edge} 


    }
}


