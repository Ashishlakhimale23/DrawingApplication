import { Rectangle } from "./types"

export class rectangle{

    draw(x:number,y:number,width:number,height:number,ctx:CanvasRenderingContext2D){
        if(!ctx)return 
        ctx.save()
        ctx.strokeStyle = "white"
        ctx.lineWidth = 4
        ctx.beginPath()
        ctx.roundRect(x,y,width,height,10)
        ctx.stroke()
        ctx.closePath()
        ctx.restore()
    }

    drawSelectedShape(shape:Rectangle,ctx:CanvasRenderingContext2D){
        ctx.save()
        ctx.strokeStyle = "gray"
        ctx.lineWidth = 1

        ctx.fillStyle = "white"

        const rect = {
           x : shape.x - 5 ,
           y : shape.y - 5 ,
           width : shape.width + 10,
           height : shape.height + 10
        }

        const corners = [
            [rect.x - 4 ,rect.y - 4 ] ,
            [rect.x + rect.width  -4 , rect.y - 4],
            [rect.x - 4 , rect.y + rect.height - 4 ],
            [rect.x + rect.width - 4 , rect.y + rect.height - 4]
        ]
        ctx.strokeRect(rect.x, rect.y,rect.width, rect.height)

        corners.forEach(([x, y]) => {

        ctx.save() 
        ctx.beginPath()
        ctx.roundRect(x, y,8,8,2);
        ctx.fill()
        ctx.closePath()
        ctx.restore()
       
    });

        ctx.restore()

    }


    insideShape(shape:Rectangle,InitialPointX:number,InitialPointY:number){
        const x = shape.width < 0 ? shape.x + shape.width : shape.x;
        const y = shape.height < 0 ? shape.y + shape.height : shape.y;
        const width = Math.abs(shape.width)
        const height = Math.abs(shape.height);
        return (x < InitialPointX && InitialPointX < (x + width) && y < InitialPointY && InitialPointY < (y + height))

    }

    resizingEdge(shape: Rectangle, InitialPointX: number, InitialPointY: number) {

        if (shape.type == "rectangle") {
            const { x, y, selected, width, height } = shape;
            const tolerance = 10

            const rect = {
                x: shape.x - 5,
                y: shape.y - 5,
                width: shape.width + 10,
                height: shape.height + 10
            }

            const handle = [
                [rect.x - 4, rect.y - 4],
                [rect.x + rect.width - 4, rect.y - 4],
                [rect.x - 4, rect.y + rect.height - 4],
                [rect.x + rect.width - 4, rect.y + rect.height - 4]
            ]

            const corners = {
                0: 'top-left',
                1: 'top-right',
                2: 'bottom-left',
                3: 'bottom-right'
            }


            let edge = null;

            if (Math.abs(InitialPointX - rect.x) <= tolerance &&
                InitialPointY >= rect.y &&
                InitialPointY <= rect.y + rect.height) {
                edge = 'left';
            } else if (Math.abs(InitialPointX - (rect.x + rect.width)) <= tolerance &&
                InitialPointY >= rect.y &&
                InitialPointY <= rect.y + rect.height) {
                edge = 'right';
            } else if (Math.abs(InitialPointY - rect.y) <= tolerance &&
                InitialPointX >= rect.x &&
                InitialPointX <= rect.x + rect.width) {
                edge = 'top';
            } else if (Math.abs(InitialPointY - (rect.y + rect.height)) <= tolerance &&
                InitialPointX >= rect.x &&
                InitialPointX <= rect.x + rect.width) {
                edge = 'bottom';
            }



            handle.forEach(([x, y], i) => {


                if (Math.abs(x - InitialPointX) < tolerance && Math.abs(y - InitialPointY) < tolerance) {
                    edge = corners[i as keyof typeof corners]
                }
            });


            const result = edge !== null
            return { result, edge }


        }

    }

    handleSelection(shape:Rectangle,InitialPointX:number,InitialPointY:number){
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

    resizingLogic(shape:Rectangle,MovingPointX:number,MovingPointY:number){
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
