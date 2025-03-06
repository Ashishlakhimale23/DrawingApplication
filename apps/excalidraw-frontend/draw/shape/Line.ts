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

interface Lines extends BaseShape {
    type: "line";
    x1: number;
    y1: number;
    midX: number;
    midY: number
    Point: 'startingPoint' | "endingPoint" | "midPoint" | ""
}

export class line{

    getMidPoint(PointsOne: { x: number, y: number }, PointsTwo: { x: number, y: number }) {
        return {
            x: (PointsOne.x + PointsTwo.x) / 2,
            y: (PointsOne.y + PointsTwo.y) / 2,
        };

    }

    draw(shape: Lines, ctx: CanvasRenderingContext2D) {
       
    ctx.save();
    ctx.strokeStyle = "white";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    ctx.beginPath();
    ctx.moveTo(shape.x, shape.y);
    ctx.quadraticCurveTo(shape.midX, shape.midY, shape.x1, shape.y1);
    ctx.stroke();
    ctx.closePath();
    ctx.restore();
}

drawSelectedShape(shape: Lines, ctx: CanvasRenderingContext2D) {
    const midstarttomid = this.getMidPoint({ x: shape.x, y: shape.y }, { x: shape.midX, y: shape.midY })
    const midmidtoend = this.getMidPoint({ x: shape.midX, y: shape.midY }, { x: shape.x1, y: shape.y1 })
    const midPoint = this.getMidPoint(midstarttomid, midmidtoend)


    ctx.save();

    
    ctx.fillStyle = "gray";
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 1;
    [
        { x: shape.x, y: shape.y },          
        { x: midPoint.x, y:midPoint.y },    
        { x: shape.x1, y: shape.y1 }         
    ].forEach(point => {
        ctx.beginPath();
        ctx.arc(point.x, point.y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.closePath();
    });

    ctx.restore();
}

    insideShape(shape:Lines, actualPointX: number, actualPointY: number, tolerance = 5) {
        function quadraticBezier(t: number, xory: number, midX: number, x1ory1: number) {
            return (1 - t) * (1 - t) * xory + 2 * (1 - t) * t * midX + t * t * x1ory1;
        }
        const steps = 1000;
        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const PredictedX = quadraticBezier(t, shape.x, shape.midX, shape.x1);
            const PredictedY = quadraticBezier(t, shape.y, shape.midY, shape.y1);

            if (Math.abs(PredictedX - actualPointX) <= tolerance && Math.abs(PredictedY - actualPointY) <= tolerance) {
                return true;
            }
        }
        return false;
    }


    getOnWhichPoint(shape:Lines,InitialPointX:number,InitialPointY:number) {
        
            const { x, y, x1, y1, midX, midY } = shape
            const tolerance = 10

            const distanceToStart = Math.sqrt(
                Math.pow(InitialPointX - x + 2, 2) + Math.pow(InitialPointY - y + 2, 2)
            );

            const distanceToEnd = Math.sqrt(
                Math.pow(InitialPointX - x1 - 2, 2) + Math.pow(InitialPointY - y1 - 2, 2)
            );

            const midstarttomid = this.getMidPoint({ x: x, y: y }, { x: midX, y: midY })
            const midmidtoend = this.getMidPoint({ x: midX, y: midY }, { x: x1, y: y1 })
            const midPoint = this.getMidPoint(midstarttomid, midmidtoend)

            const distanceToMid = Math.sqrt(
                Math.pow(InitialPointX - midPoint.x, 2) + Math.pow(InitialPointY - midPoint.y, 2)
            );

            if (distanceToStart <= tolerance) {
                return "startingPoint";
            }

            if (distanceToEnd <= tolerance) {
                return "endingPoint";
            }

            if (distanceToMid <= tolerance) {
                return "midPoint";
            }

            return false;


    }

    resizingLogic(shape: Lines, MovingPointX: number, MovingPointY: number) {
        switch (shape.Point) {
            case "startingPoint":


                shape.x = MovingPointX;
                shape.y = MovingPointY;

                break
            case "endingPoint":

                shape.x1 = MovingPointX;
                shape.y1 = MovingPointY;

                break

            case "midPoint":

                const midstarttomid = this.getMidPoint({ x: shape.x, y: shape.y }, { x: shape.midX, y: shape.midY })
                const midmidtoend = this.getMidPoint({ x: shape.midX, y: shape.midY }, { x: shape.x1, y: shape.y1 })
                const midPoint = this.getMidPoint(midstarttomid, midmidtoend)

                const dxMid = MovingPointX - midPoint.x;
                const dyMid = MovingPointY - midPoint.y;

                shape.midX += dxMid;
                shape.midY += dyMid;
                break
        }
    }


}
