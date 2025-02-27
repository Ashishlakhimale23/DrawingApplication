import { getStroke } from "perfect-freehand"

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

interface Pencil extends BaseShape {
    type: 'pencil';
    points: number[][]

}

export class Pencils{

    draw(shape:Pencil,ctx:CanvasRenderingContext2D){
        ctx.save()
        if (shape.points.length > 1) {
            ctx.fillStyle = "white";
            const stroke = getStroke(shape.points, {
                size: 12,
                smoothing: 0.2,
                thinning: 0.5,
                streamline: 0.99,
            });

            ctx.beginPath();
            stroke.forEach(([x, y], i) => {
                if (i === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            ctx.fill();
        }
        ctx.restore()

    }

    drawSelectedShape(shape:Pencil,ctx:CanvasRenderingContext2D){


    }

    





}
