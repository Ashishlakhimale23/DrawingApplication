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

interface Text extends BaseShape {
    type: "text";
    content: string;
    fontSize: number;
    fontFamily: string;
}
export class texts {

    draw(shape:Text,ctx:CanvasRenderingContext2D){
        ctx.save();

       

        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        ctx.fillStyle = 'white';
        const lines = shape.content.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(
                line,
                Math.round(shape.x),
                Math.round(shape.y) + (index * (shape as Text).fontSize)
            );
        });
        ctx.restore()

    }

    drawSelectedShape(shape: Text, ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    ctx.fillStyle = "white";

    ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
    const metrics = ctx.measureText(shape.content);
    const textWidth = metrics.width;
    const textHeight = shape.fontSize;
    
    const padding = 8;
    const handleSize = 6;
    const boxPadding = 4;

    ctx.strokeRect(
        shape.x - boxPadding,
        shape.y - textHeight - boxPadding,
        textWidth + (boxPadding * 2),
        textHeight + (boxPadding * 4)
    );

    const corners = [
        [shape.x - padding, shape.y - textHeight - padding],             
        [shape.x + textWidth , shape.y - textHeight - padding],  
        [shape.x - padding, shape.y + padding],                          
        [shape.x + textWidth , shape.y + padding]               
    ];

    corners.forEach(([x, y]) => {
        ctx.beginPath()
        ctx.roundRect(x, y, 8,8,2);
        ctx.fill()
        ctx.closePath()
    });

    ctx.restore();
}

    insideShape(shape:Text,InitialPointX:number,InitialPointY:number,ctx:CanvasRenderingContext2D){
        const metrics = ctx.measureText(shape.content);
        const textHeight = shape.fontSize;
        return (
            InitialPointX >= shape.x &&
            InitialPointX <= shape.x + metrics.width &&
            InitialPointY >= shape.y - textHeight &&
            InitialPointY <= shape.y
        );

    }


}
