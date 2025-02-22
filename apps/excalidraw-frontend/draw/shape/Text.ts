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
class Texts {

    draw(shape:Text,ctx:CanvasRenderingContext2D){
        ctx.save();
        ctx.fillStyle = "white";
        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        const lines = shape.content.split('\n');
        lines.forEach((line, index) => {
            ctx.fillText(
                line,
                shape.x,
                shape.y + (index * (shape as Text).fontSize)
            );
        });
        ctx.restore()

    }

    drawSelectedShape(shape: Text, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        ctx.fillStyle = "white";

        const metrics = ctx.measureText(shape.content);
        const textWidth = metrics.width;
        const textHeight = shape.fontSize;

        ctx.strokeRect(
            shape.x - 5,
            shape.y - textHeight - 5,
            textWidth + 10,
            textHeight + 10
        );

        ctx.beginPath();
        ctx.arc(shape.x - 5, shape.y - textHeight - 5, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(shape.x + textWidth + 5, shape.y - textHeight - 5, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(shape.x - 5, shape.y + 5, 5, 0, 2 * Math.PI);
        ctx.fill();

        ctx.beginPath();
        ctx.arc(shape.x + textWidth + 5, shape.y + 5, 5, 0, 2 * Math.PI);
        ctx.fill();

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

export const text = new Texts()