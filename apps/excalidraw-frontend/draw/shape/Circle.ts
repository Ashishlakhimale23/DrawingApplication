import { Circle  } from "../../utils/types";

export class circle {

    draw(shape: Circle, ctx: CanvasRenderingContext2D) {

        ctx.strokeStyle = "white"
        ctx.lineWidth = 4

        ctx.beginPath()
        ctx.ellipse(shape.x, shape.y, shape.radiusX, shape.radiusY, 0, 0, 2 * Math.PI, false);
        ctx.stroke()
        ctx.closePath()

    }

    drawSelectedShape(shape: Circle, ctx: CanvasRenderingContext2D) {
        ctx.save();
        ctx.strokeStyle = "gray";
        ctx.lineWidth = 2;
        ctx.fillStyle = "white";

        const bounds = {
            x: shape.x - shape.radiusX,
            y: shape.y - shape.radiusY,
            width: shape.radiusX * 2,
            height: shape.radiusY * 2
        };

        ctx.strokeRect(
            bounds.x - 5,
            bounds.y - 5,
            bounds.width + 10,
            bounds.height + 10
        );

        const handles = [
            [bounds.x - 10, bounds.y - 10],
            [bounds.x + bounds.width + 2, bounds.y - 10],
            [bounds.x - 10, bounds.y + bounds.height],
            [bounds.x + bounds.width, bounds.y + bounds.height]
        ];

        handles.forEach(([x, y]) => {

            ctx.save()
            ctx.beginPath()
            ctx.roundRect(x, y, 8, 8, 2);
            ctx.fill()
            ctx.closePath()
            ctx.restore()

        });

        ctx.restore();
    }

    insideShape(shape: Circle, InitialPointX: number, InitialPointY: number) {
        const dx = InitialPointX - shape.x
        const dy = InitialPointY - shape.y

        const tolerance = 0.1
        const result = (Math.pow(dx, 2) / Math.pow(shape.radiusX, 2)) +
            (Math.pow(dy, 2) / Math.pow(shape.radiusY, 2));

        return result <= (1 + tolerance)
    }

    getOnCirleCircumfurance(shape: Circle, InitialPointX: number, InitialPointY: number) {
        const dx = InitialPointX - shape.x;
        const dy = InitialPointY - shape.y;

        const result = (Math.pow(dx, 2) / Math.pow(shape.radiusX, 2)) +
            (Math.pow(dy, 2) / Math.pow(shape.radiusY, 2));

        const tolerance = 0.1;
        return Math.abs(result - 1) <= tolerance;
    }

    resizingLogic(shape: Circle, MovingPointX: number, MovingPointY: number) {
        const minRadius = 5;

        if (shape.radiusX <= minRadius && shape.radiusY > minRadius) {


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

        if (shape.radiusY <= minRadius && shape.radiusX > minRadius) {

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

        if (shape.radiusX <= minRadius && shape.radiusY <= minRadius) {


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
                const bottomRightX = shape.x + shape.radiusX;
                const bottomRightY = shape.y + shape.radiusY;

                shape.radiusX = Math.max(Math.abs(bottomRightX - MovingPointX) / 2, minRadius);
                shape.radiusY = Math.max(Math.abs(bottomRightY - MovingPointY) / 2, minRadius);

                shape.x = MovingPointX + shape.radiusX;
                shape.y = MovingPointY + shape.radiusY;
                break;

            case "top-right":
                const bottomLeftX = shape.x - shape.radiusX;
                const bottomLeftY = shape.y + shape.radiusY;

                shape.radiusX = Math.max(Math.abs(MovingPointX - bottomLeftX) / 2, minRadius);
                shape.radiusY = Math.max(Math.abs(bottomLeftY - MovingPointY) / 2, minRadius);

                shape.x = bottomLeftX + shape.radiusX;
                shape.y = bottomLeftY - shape.radiusY;
                break;

            case "bottom-left":
                const topRightX = shape.x + shape.radiusX;
                const topRightY = shape.y - shape.radiusY;

                shape.radiusX = Math.max(Math.abs(topRightX - MovingPointX) / 2, minRadius);
                shape.radiusY = Math.max(Math.abs(MovingPointY - topRightY) / 2, minRadius);

                shape.x = topRightX - shape.radiusX;
                shape.y = topRightY + shape.radiusY;
                break;

            case "bottom-right":
                const topLeftX = shape.x - shape.radiusX;
                const topLeftY = shape.y - shape.radiusY;

                shape.radiusX = Math.max(Math.abs(MovingPointX - topLeftX) / 2, minRadius);
                shape.radiusY = Math.max(Math.abs(MovingPointY - topLeftY) / 2, minRadius);

                shape.x = topLeftX + shape.radiusX;
                shape.y = topLeftY + shape.radiusY;
                break

            case 'left':
                const rightEdgeX = shape.x + shape.radiusX;
                const newRadiusX = Math.max((rightEdgeX - MovingPointX) / 2, minRadius);

                shape.x = rightEdgeX - newRadiusX;
                shape.radiusX = newRadiusX;
                break;

            case 'right':
                const leftEdgeX = shape.x - shape.radiusX

                shape.x = leftEdgeX + Math.max((MovingPointX - leftEdgeX) / 2, minRadius)
                shape.radiusX = Math.max((MovingPointX - leftEdgeX) / 2, minRadius)
                break

            case "top":
                const bottomEdgeY = shape.y + shape.radiusY
                const newRadiusY = Math.max((bottomEdgeY - MovingPointY) / 2, minRadius)
                shape.y = bottomEdgeY - newRadiusY
                shape.radiusY = newRadiusY
                break

            case 'bottom':
                const topEdgeY = shape.y - shape.radiusY;
                const newBottomRadiusY = Math.max((MovingPointY - topEdgeY) / 2, minRadius);

                shape.y = topEdgeY + newBottomRadiusY;
                shape.radiusY = newBottomRadiusY;
                break;



        }
    }

    resizingEdge(shape: Circle, InitialPointX: number, InitialPointY: number) {
    let edge = null;
    const tolerance = 10;

    const bounds = {
        x: shape.x - shape.radiusX,
        y: shape.y - shape.radiusY,
        width: shape.radiusX * 2,
        height: shape.radiusY * 2
    };

    const rect = {
        x: bounds.x - 5,
        y: bounds.y - 5,
        width: bounds.width + 10,
        height: bounds.height + 10
    };

    const handles = [
        [bounds.x - 10, bounds.y - 10], // top left 
        [bounds.x + bounds.width + 2, bounds.y - 10], // top right
        [bounds.x - 10, bounds.y + bounds.height], // bottom left
        [bounds.x + bounds.width, bounds.y + bounds.height] // bottom right
    ];

    const corners = {
        0: 'top-left',
        1: 'top-right',
        2: 'bottom-left',
        3: 'bottom-right'
    };

    // Check if the mouse is near any of the edges
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

    // Check if the mouse is near any of the corners
    handles.forEach(([x, y], i) => {
        if (Math.abs(x - InitialPointX) <= tolerance && Math.abs(y - InitialPointY) <= tolerance) {
            edge = corners[i as keyof typeof corners];
        }
    });

    console.log(edge);
    const result = edge !== null;
    return { result, edge };
}
}


