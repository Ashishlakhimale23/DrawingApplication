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
    const boxPadding = 4;

    ctx.strokeRect(
        shape.x - boxPadding,
        shape.y - textHeight - boxPadding,
        textWidth + (boxPadding * 2),
        textHeight + (boxPadding * 4)
    );

    const corners = [
        [shape.x - padding, shape.y - textHeight - padding],         // top left    
        [shape.x + textWidth , shape.y - textHeight - padding], // top right
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


    insideShape(shape: Text, InitialPointX: number, InitialPointY: number, ctx: CanvasRenderingContext2D) {
        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        const metrics = ctx.measureText(shape.content);
        const textWidth = metrics.width;
        const textHeight = shape.fontSize;
        const boxPadding = 4;

        const bounds = {
            x: shape.x - boxPadding,
            y: shape.y - textHeight - boxPadding,
            width: textWidth + (boxPadding * 2),
            height: textHeight + (boxPadding * 4)
        };

        return InitialPointX >= bounds.x && 
               InitialPointX <= bounds.x + bounds.width &&
               InitialPointY >= bounds.y &&
               InitialPointY <= bounds.y + bounds.height;
    }

    onCorner(shape: Text, InitialPointX: number, InitialPointY: number, ctx: CanvasRenderingContext2D) {
        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        const metrics = ctx.measureText(shape.content);
        const textWidth = metrics.width;
        const textHeight = shape.fontSize;
        const handleSize = 8;
        const tolerance = 5;

        const handles = [
            { pos: [shape.x - handleSize, shape.y - textHeight - handleSize], type: 'top-left' },
            { pos: [shape.x + textWidth, shape.y - textHeight - handleSize], type: 'top-right' },
            { pos: [shape.x - handleSize, shape.y + handleSize], type: 'bottom-left' },
            { pos: [shape.x + textWidth, shape.y + handleSize], type: 'bottom-right' }
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

    handleSelection(shape: Text, InitialPointX: number, InitialPointY: number, ctx: CanvasRenderingContext2D) {
        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        const metrics = ctx.measureText(shape.content);
        const textWidth = metrics.width;
        const textHeight = shape.fontSize;
        const boxPadding = 4;
        const tolerance = 3;

        const bounds = {
            x: shape.x - boxPadding,
            y: shape.y - textHeight - boxPadding,
            width: textWidth + (boxPadding * 2),
            height: textHeight + (boxPadding * 4)
        };

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

    resizingLogic(shape: Text, MovingPointX: number, MovingPointY: number, ctx: CanvasRenderingContext2D) {
        const MIN_FONT_SIZE = 8;
        const MAX_FONT_SIZE = 128;

        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
        const originalMetrics = ctx.measureText(shape.content);
        const originalWidth = originalMetrics.width;
        const originalHeight = shape.fontSize;

        const originalTopLeft = { x: shape.x, y: shape.y - originalHeight };
        const originalTopRight = { x: shape.x + originalWidth, y: shape.y - originalHeight };
        const originalBottomLeft = { x: shape.x, y: shape.y };
        const originalBottomRight = { x: shape.x + originalWidth, y: shape.y };

        let newFontSize;

        switch (shape.resizingEdge) {
            case "top-right":
                const widthScaleTR = (MovingPointX - originalBottomLeft.x) / originalWidth;
                newFontSize = Math.max(
                    MIN_FONT_SIZE,
                    Math.min(MAX_FONT_SIZE, Math.floor(shape.fontSize * widthScaleTR))
                );

                shape.fontSize = newFontSize;
                break;

            case "bottom-right":
                const widthScaleBR = (MovingPointX - originalTopLeft.x) / originalWidth;
                newFontSize = Math.max(
                    MIN_FONT_SIZE,
                    Math.min(MAX_FONT_SIZE, Math.floor(shape.fontSize * widthScaleBR))
                );

                shape.fontSize = newFontSize;
                shape.y = originalTopLeft.y + newFontSize;
                break;

            case "top-left":
                const widthScaleTL = (originalBottomRight.x - MovingPointX) / originalWidth;
                newFontSize = Math.max(
                    MIN_FONT_SIZE,
                    Math.min(MAX_FONT_SIZE, Math.floor(shape.fontSize * widthScaleTL))
                );

                shape.fontSize = newFontSize;

                ctx.font = `${newFontSize}px ${shape.fontFamily}`;
                const newWidthTL = ctx.measureText(shape.content).width;

                shape.x = originalBottomRight.x - newWidthTL;
                shape.y = originalBottomRight.y;
                break;

            case "bottom-left":
                const widthScaleBL = (originalTopRight.x - MovingPointX) / originalWidth;
                newFontSize = Math.max(
                    MIN_FONT_SIZE,
                    Math.min(MAX_FONT_SIZE, Math.floor(shape.fontSize * widthScaleBL))
                );

                shape.fontSize = newFontSize;

                ctx.font = `${newFontSize}px ${shape.fontFamily}`;
                const newWidthBL = ctx.measureText(shape.content).width;

                shape.x = originalTopRight.x - newWidthBL;
                shape.y = originalTopLeft.y + newFontSize;
                break;
        }

        ctx.font = `${shape.fontSize}px ${shape.fontFamily}`;
    }
}
