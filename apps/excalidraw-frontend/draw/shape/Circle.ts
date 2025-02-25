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

export class circle {
    
    draw(x:number,y:number,radius:number,ctx:CanvasRenderingContext2D){
       
        ctx.strokeStyle = "white"
        ctx.lineWidth = 4
    
        ctx.beginPath()
        ctx.arc(x,y,radius, 0, 2 * Math.PI);
        ctx.closePath()
        ctx.stroke()
       

    }

    drawSelectedShape(shape: Circles, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;
    ctx.fillStyle = "white";

    const bounds = {
        x: shape.x - shape.radius,
        y: shape.y - shape.radius,
        width: shape.radius * 2,
        height: shape.radius * 2
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
        ctx.fillRect(x, y,8,8);
       
    });

    ctx.restore();
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
    
    onCorner(shape:Circles,InitialPointX:number,InitialPointY:number){
        //rectangle
        const bounds = {
            x: shape.x - shape.radius,
            y: shape.y - shape.radius,
            width: shape.radius * 2,
            height: shape.radius * 2
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
         handles.forEach(([x,y],i) => {
            console.log(i , x-InitialPointX , y - InitialPointY)

            if(Math.abs(x - InitialPointX) < tolerance  && Math.abs(y - InitialPointY) < tolerance){
                console.log(corners[i as keyof typeof corners])
                result  = true        
            }
        }); 

        console.log(result)
        return result
        


    }


    handleSelection(shape: Circles, InitialPointX: number, InitialPointY: number):boolean {
        const tolerance = 10
        const bounds = {
            x: shape.x - shape.radius,
            y: shape.y - shape.radius,
            width: shape.radius * 2,
            height: shape.radius * 2
        };
        const minX = Math.min(bounds.x, bounds.x + bounds.width);
        const maxX = Math.max(bounds.x, bounds.x + bounds.width);
        const minY = Math.min(bounds.y, bounds.y + bounds.height);
        const maxY = Math.max(bounds.y, bounds.y + bounds.height);
        return (
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
    }
}


