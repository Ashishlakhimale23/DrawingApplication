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

interface Rectangles extends BaseShape {
    type: "rectangle";
    width: number;
    height: number;
}

class Rectangle{

    draw(x:number,y:number,width:number,height:number,ctx:CanvasRenderingContext2D){
        ctx.save()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 4
        ctx.roundRect(x,y,width,height,10)
        ctx.stroke()
        ctx.restore()
    }

    drawSelectedShape(shape:Rectangles,ctx:CanvasRenderingContext2D){
        ctx.strokeStyle = "gray"
        ctx.lineWidth = 1
        ctx.fillStyle = "white"

        const minX = Math.min(shape.x, (Math.abs(shape.width) + shape.x))
        const minY = Math.min(shape.y, (Math.abs(shape.height) + shape.y))

        ctx.strokeRect(minX - 5, minY - 5, shape.width + 10, shape.height + 10)
        ctx.beginPath()
        ctx.arc((minX - 5), (minY - 5), 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.arc(shape.x + 5 + shape.width, (minY - 5), 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath()
        ctx.arc((minX - 5), shape.y + 5 + shape.height, 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.closePath()

        ctx.beginPath();
        ctx.arc(shape.x + shape.width + 5, shape.y + shape.height + 5, 5, 0, 2 * Math.PI);
        ctx.fill();
        ctx.closePath();



    }


    insideShape(shape:Rectangles,InitialPointX:number,InitialPointY:number){
        const x = shape.width < 0 ? shape.x + shape.width : shape.x;
        const y = shape.height < 0 ? shape.y + shape.height : shape.y;
        const width = Math.abs(shape.width)
        const height = Math.abs(shape.height);
        return (x < InitialPointX && InitialPointX < (x + width) && y < InitialPointY && InitialPointY < (y + height))

    }

    resizingEdge(shape:Rectangles,InitialPointX:number,InitialPointY:number){
    
        if (shape.type == "rectangle") {
            const { x, y, selected, width, height } = shape;
            const threshold = 5;

            if (!selected) {
                return null;
            }

            if (
                Math.abs(InitialPointX - (x + width)) < threshold &&
                Math.abs(InitialPointY - (y + height)) < threshold
            ) {
                return "bottom-right";
            }
            if (Math.abs(InitialPointX - x) < threshold && Math.abs(InitialPointY - y) < threshold) {
                return "top-left";
            }
            if (
                Math.abs(InitialPointX - (x + width)) < threshold &&
                Math.abs(InitialPointY - y) < threshold
            ) {
                return "top-right";
            }
            if (
                Math.abs(InitialPointX - x) < threshold &&
                Math.abs(InitialPointY - (y + height)) < threshold
            ) {
                return "bottom-left";
            }

            if (Math.abs(InitialPointX - x) < threshold) {
                return "left";
            }
            if (Math.abs(InitialPointX - (x + width)) < threshold) {
                return "right";
            }
            if (Math.abs(InitialPointY - y) < threshold) {
                return "top";
            }
            if (Math.abs(InitialPointY - (y + height)) < threshold) {
                return "bottom";
            }

        }
        return null;

    }

    handleSelection(shape:Rectangles,InitialPointX:number,InitialPointY:number){
        const tolerance = 10
        const minX = Math.min(shape.x, shape.x + shape.width);
        const maxX = Math.max(shape.x, shape.x + shape.width);
        const minY = Math.min(shape.y, shape.y + shape.height);
        const maxY = Math.max(shape.y, shape.y + shape.height);
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

    resizingLogic(shape:Rectangles,MovingPointX:number,MovingPointY:number){
            const x1 = (shape.width + shape.x)
            const y1 = shape.height + shape.y
            if (shape.x > x1 && shape.y < y1) {
                shape.width = shape.x - x1
                shape.x = x1
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
            if (shape.y > y1 && shape.x < x1) {
                shape.height = shape.y - y1
                shape.y = y1
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

            if (shape.x > x1 && shape.y > y1) {
                shape.width = shape.x - x1
                shape.x = x1
                shape.height = shape.y - y1
                shape.y = y1

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
                    shape.width += shape.x - MovingPointX;
                    shape.height += shape.y - MovingPointY;
                    shape.x = MovingPointX;
                    shape.y = MovingPointY;
                    break;
                case "top-right":
                    shape.width = MovingPointX - shape.x;
                    shape.height += shape.y - MovingPointY;
                    shape.y = MovingPointY;
                    break;
                case "bottom-left":
                    shape.width += shape.x - MovingPointX;
                    shape.height = MovingPointY - shape.y;
                    shape.x = MovingPointX;
                    break;
                case "bottom-right":
                    shape.width =MovingPointX - shape.x;
                    shape.height = MovingPointY - shape.y;
                    break;
                case "left":
                    shape.width += shape.x - MovingPointX;
                    shape.x = MovingPointX;
                    break;
                case "right":
                    shape.width = MovingPointX - shape.x;
                    break;
                case "top":
                    shape.height += shape.y - MovingPointY;
                    shape.y = MovingPointY;
                    break;
                case "bottom":
                    shape.height = MovingPointY - shape.y;
                    break;
            }


        }

}

export const rectangle = new Rectangle()