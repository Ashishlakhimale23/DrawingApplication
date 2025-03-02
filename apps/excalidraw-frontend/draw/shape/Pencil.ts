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
        x : minX - padding,
        y : minY - padding,
        width : maxX - minX + (padding * 2),
        height : maxY - minY + (padding * 2)
    }
    ctx.strokeRect(
        rect.x,rect.y,rect.width,rect.height
    );

    const corners = [
        [rect.x - 4 ,rect.y - 4],
        [rect.x + rect.width - 4, rect.y - 4],
        [rect.x -4  , rect.y + rect.height -4 ],
        [rect.x + rect.width - 4 , rect.y + rect.height - 4]
    ] 

        corners.forEach(([x, y]) => {
            ctx.beginPath()
            ctx.roundRect(x, y, 8, 8, 2);
            ctx.fill()
            ctx.closePath()
        });


    
    ctx.restore();
}

    onCorner(shape: Pencil, InitialPointX: number, InitialPointY: number) {
        const tolerance = 5;
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

        const handles = [
            { pos:[rect.x - 4 ,rect.y - 4] , type: 'top-left' },
            { pos: [rect.x + rect.width - 4, rect.y - 4], type: 'top-right' },
            { pos: [rect.x -4  , rect.y + rect.height -4 ], type: 'bottom-left' },
            { pos: [rect.x + rect.width - 4 , rect.y + rect.height - 4], type: 'bottom-right' }
        ];

        for (const handle of handles) {
            const [x, y] = handle.pos;
            if (Math.abs(x - InitialPointX) <= tolerance &&
                Math.abs(y - InitialPointY) <= tolerance) {
                return { result: true, corner: handle.type };
            }
        }

        return { result: false, corner: '' };
    }

    handleSelection(shape: Pencil, InitialPointX: number, InitialPointY: number) {
        
        const tolerance = 3;
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
        let edge = '';
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

        const result = edge !== '';
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
                const fixedX = minX - padding;
                const fixedY = maxY + padding;

                const originalWidth = maxX - minX + padding * 2;
                const originalHeight = maxY - minY + padding * 2;

                const newWidth = Math.max(10, MovingPointX - fixedX); 
                const newHeight = Math.max(10, fixedY - MovingPointY);

                const scaleX = newWidth / originalWidth;
                const scaleY = newHeight / originalHeight;

                const transformedPoints = [];

                for (let i = 0; i < shape.points.length; i++) {
                    const [x, y] = shape.points[i];
                    
                    const relX = x - fixedX;
                    const relY = fixedY - y;

                    transformedPoints.push([
                        fixedX + relX * scaleX,
                        fixedY - relY * scaleY
                    ]);
                }

                shape.points = transformedPoints;
                break;
            }
    }


}
