import { getStroke } from "perfect-freehand"
import { Pencil } from "../../utils/types";


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


    insideShape(shape: Pencil, InitialPointX: number, InitialPointY: number): boolean {
        if (shape.points.length < 2) return false;

        const stroke = getStroke(shape.points, {
            size: 12, 
            smoothing: 0.2,
            thinning: 0.5,
            streamline: 0.99,
        });

        for (let i = 1; i < stroke.length; i++) {
            const [x1, y1] = stroke[i - 1];
            const [x2, y2] = stroke[i];

            const distance = this.distanceToSegment(
                InitialPointX,
                InitialPointY,
                x1,
                y1,
                x2,
                y2
            );

            if (distance <= 6) { 
                return true;
            }
        }
        return false;
    }

    private distanceToSegment(
        px: number,
        py: number,
        x1: number,
        y1: number,
        x2: number,
        y2: number
    ): number {
        const A = px - x1;
        const B = py - y1;
        const C = x2 - x1;
        const D = y2 - y1;

        const dot = A * C + B * D;
        const lenSq = C * C + D * D;
        let param = -1;

        if (lenSq !== 0) {
            param = dot / lenSq;
        }

        let xx, yy;

        if (param < 0) {
            xx = x1;
            yy = y1;
        } else if (param > 1) {
            xx = x2;
            yy = y2;
        } else {
            xx = x1 + param * C;
            yy = y1 + param * D;
        }

        const dx = px - xx;
        const dy = py - yy;

        return Math.sqrt(dx * dx + dy * dy);
    }

    drawSelectedShape(shape: Pencil, ctx: CanvasRenderingContext2D) {
    ctx.save();
    
    const stroke = getStroke(shape.points, {
        size: 12,
        smoothing: 0.2,
        thinning: 0.5,
        streamline: 0.99,
    });
    
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    
    stroke.forEach(([x, y]) => {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
    });
    
    const padding = 6; 

    ctx.strokeStyle = "gray";
        ctx.lineWidth = 1;
        ctx.fillStyle = "white"

        const rect = {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + (padding * 2),
            height: maxY - minY + (padding * 2)
        }
        ctx.strokeRect(
            rect.x, rect.y, rect.width, rect.height
        );

        const corners = [
            [rect.x - 4, rect.y - 4],
            [rect.x + rect.width - 4, rect.y - 4],
            [rect.x - 4, rect.y + rect.height - 4],
            [rect.x + rect.width - 4, rect.y + rect.height - 4]
        ]

        corners.forEach(([x, y]) => {
            ctx.beginPath()
            ctx.roundRect(x, y, 8, 8, 2);
            ctx.fill()
            ctx.closePath()
        });



        ctx.restore();
    }


    resizingEdge(shape: Pencil, InitialPointX: number, InitialPointY: number) {

        const tolerance = 5

        let edge = null;

        const stroke = getStroke(shape.points, {
            size: 12,
            smoothing: 0.2,
            thinning: 0.5,
            streamline: 0.99,
        });

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        stroke.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        const padding = 6;

        const bounds = {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + (padding * 2),
            height: maxY - minY + (padding * 2)
        }

        const handles = [
            { pos: [bounds.x - 4, bounds.y - 4], type: 'top-left' },
            { pos: [bounds.x + bounds.width - 4, bounds.y - 4], type: 'top-right' },
            { pos: [bounds.x - 4, bounds.y + bounds.height - 4], type: 'bottom-left' },
            { pos: [bounds.x + bounds.width - 4, bounds.y + bounds.height - 4], type: 'bottom-right' }
        ];

        if (Math.abs(InitialPointX - bounds.x) <= tolerance &&
            InitialPointY >= bounds.y &&
            InitialPointY <= bounds.y + bounds.height) {
            edge = 'left';
        } else if (Math.abs(InitialPointX - (bounds.x + bounds.width)) <= tolerance &&
            InitialPointY >= bounds.y &&
            InitialPointY <= bounds.y + bounds.height) {
            edge = 'right';
        } else if (Math.abs(InitialPointY - bounds.y) <= tolerance &&
            InitialPointX >= bounds.x &&
            InitialPointX <= bounds.x + bounds.width) {
            edge = 'top';
        } else if (Math.abs(InitialPointY - (bounds.y + bounds.height)) <= tolerance &&
            InitialPointX >= bounds.x &&
            InitialPointX <= bounds.x + bounds.width) {
            edge = 'bottom';
        }
    

        for (const handle of handles) {
            const [x, y] = handle.pos;
            if (Math.abs(x - InitialPointX) <= tolerance &&
                Math.abs(y - InitialPointY) <= tolerance) {
                edge =  handle.type 
            }
        }
        const result = edge !== null;
        return { result, edge };
    }



    resizingLogic(shape:Pencil,MovingPointX:number,MovingPointY:number){
        const stroke = getStroke(shape.points, {
            size: 12,
            smoothing: 0.2,
            thinning: 0.5,
            streamline: 0.99,
        });

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        stroke.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        const padding = 6;

        const rect = {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + (padding * 2),
            height: maxY - minY + (padding * 2)
        }

        const corners = [
            { pos: [rect.x - 4, rect.y - 4], type: 'top-left' },
            { pos: [rect.x + rect.width - 4, rect.y - 4], type: 'top-right' },
            { pos: [rect.x - 4, rect.y + rect.height - 4], type: 'bottom-left' },
            { pos: [rect.x + rect.width - 4, rect.y + rect.height - 4], type: 'bottom-right' }
        ];

        
        switch(shape.resizingEdge){
            case 'top-right':
                const fixedX = minX - padding ;
                const fixedY = maxY + padding ;

                const originalWidth = rect.width -  (padding * 2);
                const originalHeight = rect.height -  (padding * 2);

                let newWidth = Math.max(10, MovingPointX - fixedX); 
                let newHeight = Math.max(10, fixedY - MovingPointY);

                let scaleX = newWidth / originalWidth;
                let scaleY = newHeight / originalHeight;

                let transformedPoints = [];

                for (let i = 0; i < shape.points.length; i++) {
                    const [x, y] = shape.points[i];
                    
                    const relX = x - fixedX;
                    const relY =y - fixedY ;

                    transformedPoints.push([
                        fixedX + relX * scaleX,
                        fixedY + relY * scaleY
                    ]);
                }

                shape.points = transformedPoints;
                break;
                 
                case "top-left":
                    const bottonRightX = maxX - padding
                    const bottonRightY = maxY - padding

                    let newWidthBr = bottonRightX - (MovingPointX - padding)
                    let newHeightBr = bottonRightY - (MovingPointY - padding)

                    let scaleXBr = newWidthBr / (rect.width - (padding * 2))
                    let scaleYBr = newHeightBr / (rect.height - (padding * 2))


                    let transformedPointsBr = []

                for (let i = 0; i < shape.points.length; i++) {
                    const [x, y] = shape.points[i];

                    const relX = bottonRightX - x;
                    const relY = bottonRightY - y;


                    transformedPointsBr.push([
                        bottonRightX - relX * scaleXBr,
                        bottonRightY - relY * scaleYBr
                    ]);
                }

                shape.points = transformedPointsBr

                    break

                case "bottom-right":

                    const topLeftX = minX - padding
                    const topLeftY = minY - padding 

                    const newWidthTl = (MovingPointX - padding) - topLeftX 
                    const newHeightTl = (MovingPointY - padding) - topLeftY

                    const scaleXTl = newWidthTl / (rect.width - (padding * 2))
                    const scaleYTl = newHeightTl / (rect.height - (padding * 2))

                let transformedPointsTL = []
                for (let i = 0; i < shape.points.length; i++) {
                    const [x, y] = shape.points[i]

                    const relX = x - topLeftX
                    const relY = y - topLeftY

                    transformedPointsTL.push([
                        topLeftX + relX * scaleXTl,
                        topLeftY +  relY * scaleYTl
                    ]);


                }
                shape.points = transformedPointsTL


                    break
                
                case "bottom-left":
                    const topRightX = (minX - padding) + (rect.width - (padding * 2))
                    const topRightY = minY - padding

                    const newWidthTR = topRightX - (MovingPointX - padding)
                    const newHeightTR = (MovingPointY - padding) - topRightY  

                    const scaleXTR = newWidthTR / (rect.width - (padding*2))
                    const scaleYTR = newHeightTR / (rect.height - (padding*2))

                    const transformedPointsTR = []

                    for(let i = 0 ;i<shape.points.length;i++){
                        const [x,y] = shape.points[i]

                        const relX = x - topRightX 
                        const relY = y - topRightY

                        transformedPointsTR.push([
                            topRightX + relX * scaleXTR,
                            topRightY + relY * scaleYTR
                        ])

                    }

                    shape.points = transformedPointsTR
                    break
            case 'left':
                const fixedXLeft = maxX + padding;

                const originalWidthLeft = rect.width - (padding * 2);

                const newWidthLeft = Math.max(10, fixedXLeft - MovingPointX);

                const scaleXLeft = newWidthLeft / originalWidthLeft;

                shape.points = shape.points.map(([x, y]) => {
                    const relX = fixedXLeft - x;

                    return [
                        fixedXLeft - relX * scaleXLeft,
                        y
                    ];
                });
                break;
            case 'right':
                const fixedXRight= minX + padding;

                const originalWidthRight= rect.width - (padding * 2);

                const newWidthRight= Math.max(10, MovingPointX - fixedXRight );

                const scaleXRight= newWidthRight/ originalWidthRight;

                shape.points = shape.points.map(([x, y]) => {
                    const relX = x - fixedXRight ;

                    return [
                        fixedXRight + relX * scaleXRight,
                        y
                    ];
                });
                break;
            case 'bottom':
                const fixedYTop= minY + padding;

                const originalHeightTop= rect.height - (padding * 2);

                const newHeightTop = Math.max(10, MovingPointY - fixedYTop);

                const scaleXTop = newHeightTop / originalHeightTop;

                shape.points = shape.points.map(([x, y]) => {
                    const relX = y - fixedYTop;

                    return [
                        x,
                        fixedYTop + relX * scaleXTop
                    ];
                });
                break;
            case 'top':
                const fixedYbottom = maxY + padding;

                const originalHeightbottom = rect.height - (padding * 2);

                const newHeightbottom = Math.max(10,fixedYbottom - MovingPointY);

                const scaleXbottom = newHeightbottom / originalHeightbottom;

                shape.points = shape.points.map(([x, y]) => {
                    const relX =  fixedYbottom - y;

                    return [
                        x,
                        fixedYbottom - relX * scaleXbottom
                    ];
                });
                break;


        }
    }

    DragTest(shape:Pencil,InitialPointX:number,InitialPointY:number){
        const stroke = getStroke(shape.points, {
            size: 12,
            smoothing: 0.2,
            thinning: 0.5,
            streamline: 0.99,
        });

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        stroke.forEach(([x, y]) => {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
        });

        const padding = 6;

        const rect = {
            x: minX - padding,
            y: minY - padding,
            width: maxX - minX + (padding * 2),
            height: maxY - minY + (padding * 2)
        }
        const x = rect.width < 0 ? rect.x + rect.width : rect.x;
        const y = rect.height < 0 ? rect.y + rect.height : rect.y;
        const width = Math.abs(rect.width)
        const height = Math.abs(rect.height);
        return (x < InitialPointX && InitialPointX < (x + width) && y < InitialPointY && InitialPointY < (y + height))

    }

}
