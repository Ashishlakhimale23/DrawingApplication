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

interface Rectangle extends BaseShape {
    type: "rectangle";
    width: number;
    height: number;
}

interface Circle extends BaseShape {
    type: "circle";
    x1: number;
    y1: number;
    radius: number;
}

type Shape = Rectangle | Circle;

interface ShapesFromServer {
    id?: number,
    messageData: Shape
}


type TypeOfShapes = "Rectangle" | "default" | "Circle"

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: ShapesFromServer[];
    private isDrawing: boolean = false;
    private InitialPointX: number = 0;
    private InitialPointY: number = 0;
    private MovingPointX: number = 0;
    private MovingPointY: number = 0;
    private typeOfShapes: TypeOfShapes = 'default';
    private roomId: string;
    private SelectedIndex: number = -1;
    private isDraging: boolean = false

    Socket: WebSocket;



    constructor(canvas: HTMLCanvasElement, roomId: string, Socket: WebSocket, existingShapes: ShapesFromServer[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.Socket = Socket;
        this.existingShapes = [...existingShapes];

        this.init();
        this.onMessageFromSocket();
        this.initMouseHandlers()

    }



    init() {
        this.reDrawShapes();
    }

    reDrawShapes() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)

        this.existingShapes.forEach((element) => {


            if (element.messageData.type == "rectangle") {
                this.ctx.strokeStyle = "black"
                this.ctx.lineWidth = 2
                this.ctx.strokeRect(element.messageData.x, element.messageData.y, element.messageData.width, element.messageData.height)
            }

        })
    }

    onMessageFromSocket() {
        this.Socket.onmessage = (event) => {
            const message = JSON.parse(event.data)

            const messageData = JSON.parse(message.messageData)

            const resizedShapeIndexed = this.existingShapes.findIndex((element) => {
                return element.id === message.id
            })


            if (resizedShapeIndexed !== -1) {
                const shape = this.existingShapes[resizedShapeIndexed]
                shape.messageData = messageData

            } else if (resizedShapeIndexed === -1) {

                const newShapeIndexed = this.existingShapes.findIndex((element) => {
                    return element.id === undefined
                })

                if (newShapeIndexed !== -1) {
                    const shape = this.existingShapes[newShapeIndexed]
                    shape.id = message.id
                    shape.messageData = messageData

                } else {

                    this.existingShapes.push({ messageData: messageData, id: message.id })
                }


            }


                this.reDrawShapes()
        }
    }

    setTool(tool: TypeOfShapes) {
        this.typeOfShapes = tool;
    }

    Draw() {
        if (this.ctx && this.canvas) {

            switch (this.typeOfShapes) {
                case "Rectangle":
                    this.ctx.strokeStyle = "black"
                    this.ctx.lineWidth = 2
                    this.ctx.strokeRect(this.InitialPointX, this.InitialPointY, this.MovingPointX - this.InitialPointX,this.MovingPointY - this.InitialPointY)
                default:
                    null
            }

        }

    }



    Resize() {

        if (
            this.SelectedIndex === -1 ||
            !this.existingShapes[this.SelectedIndex] || !this.canvas
        ) {
            return;
        }

        const shape = this.existingShapes[this.SelectedIndex].messageData;

        if (shape.type === "rectangle") {

            switch (shape.resizingEdge) {
                case "top-left":
                    shape.width += shape.x - this.MovingPointX;
                    shape.height += shape.y - this.MovingPointY;
                    shape.x = this.MovingPointX;
                    shape.y = this.MovingPointY;
                    break;
                case "top-right":
                    shape.width = this.MovingPointX - shape.x;
                    shape.height += shape.y - this.MovingPointY;
                    shape.y = this.MovingPointY;
                    break;
                case "bottom-left":
                    shape.width += shape.x - this.MovingPointX;
                    shape.height = this.MovingPointY - shape.y;
                    shape.x = this.MovingPointX;
                    break;
                case "bottom-right":
                    shape.width = this.MovingPointX - shape.x;
                    shape.height = this.MovingPointY - shape.y;
                    break;
                case "left":
                    shape.width += shape.x - this.MovingPointX;
                    shape.x = this.MovingPointX;
                    break;
                case "right":
                    shape.width = this.MovingPointX - shape.x;
                    break;
                case "top":
                    shape.height += shape.y - this.MovingPointY;
                    shape.y = this.MovingPointY;
                    break;
                case "bottom":
                    shape.height = this.MovingPointY - shape.y;
                    break;
            }
            console.log("shapes id",shape.id)

            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id:this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            width: shape.width,
                            height: shape.height,
                            type: "rectangle",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false
                        }
                    )
                })
            )
        };
    }

    getResizeEdge() {
        let shape = this.existingShapes[this.SelectedIndex].messageData
        if (shape.type == "rectangle") {
            const { x, y, selected, width, height } = shape;
            const threshold = 10;

            if (!selected) {
                return null;
            }

            if (
                Math.abs(this.InitialPointX - (x + width)) < threshold &&
                Math.abs(this.InitialPointY - (y + height)) < threshold
            ) {
                return "bottom-right";
            }
            if (Math.abs(this.InitialPointX - x) < threshold && Math.abs(this.InitialPointY - y) < threshold) {
                return "top-left";
            }
            if (
                Math.abs(this.InitialPointX - (x + width)) < threshold &&
                Math.abs(this.InitialPointY - y) < threshold
            ) {
                return "top-right";
            }
            if (
                Math.abs(this.InitialPointX - x) < threshold &&
                Math.abs(this.InitialPointY - (y + height)) < threshold
            ) {
                return "bottom-left";
            }

            if (Math.abs(this.InitialPointX - x) < threshold) {
                return "left";
            }
            if (Math.abs(this.InitialPointX - (x + width)) < threshold) {
                return "right";
            }
            if (Math.abs(this.InitialPointY - y) < threshold) {
                return "top";
            }
            if (Math.abs(this.InitialPointY - (y + height)) < threshold) {
                return "bottom";
            }

        }
        return null;
    }

    GetSelectedShape = (shape: Shape) => {
        const tolerance = 10;
        switch (shape.type) {
            case "rectangle":
                const minX = Math.min(shape.x, shape.x + shape.width);
                const maxX = Math.max(shape.x, shape.x + shape.width);
                const minY = Math.min(shape.y, shape.y + shape.height);
                const maxY = Math.max(shape.y, shape.y + shape.height);
                return (
                    (Math.abs(this.InitialPointX - minX) <= tolerance &&
                        minY <= this.InitialPointY &&
                        this.InitialPointY <= maxY) ||
                    (Math.abs(this.InitialPointY - minY) <= tolerance &&
                        minX <= this.InitialPointX &&
                        this.InitialPointX <= maxX) ||
                    (Math.abs(this.InitialPointX - maxX) <= tolerance &&
                        minY <= this.InitialPointY &&
                        this.InitialPointY <= maxY) ||
                    (Math.abs(this.InitialPointY - maxY) <= tolerance && minX <= this.InitialPointX && this.InitialPointX <= maxX)
                );


        }

    };

    getDraggingShape() {
        const shape = this.existingShapes[this.SelectedIndex].messageData
        if (!shape.isDraging && this.SelectedIndex === -1 && this.typeOfShapes !== "default") {
            return
        }


        if (shape.type == "rectangle") {
            const x = shape.width < 0 ? shape.x + shape.width : shape.x;
            const y = shape.height < 0 ? shape.y + shape.height : shape.y;
            const width = Math.abs(shape.width);
            const height = Math.abs(shape.height);

            if (x < this.InitialPointX && this.InitialPointX < (x + width) && y < this.InitialPointY && this.InitialPointY < (y + height)) {
                return true;
            }
            return false;
        }


    }

    Drag() {
        if (this.SelectedIndex === -1 || !this.isDraging || !this.existingShapes[this.SelectedIndex].messageData.isDraging) {
            return
        }

        const shape = this.existingShapes[this.SelectedIndex].messageData

        const dx = this.MovingPointX - this.InitialPointX
        const dy = this.MovingPointY - this.InitialPointY
        if (shape.type == "rectangle") {

            shape.x += dx;
            shape.y += dy;

        this.Socket.send(
            JSON.stringify({
                type: "moving",
                roomId: "2",
                id: this.existingShapes[this.SelectedIndex].id,
                message: JSON.stringify(
                    {
                        x: shape.x,
                        y: shape.y,
                        width: shape.width,
                        height: shape.height,
                        type: "rectangle",
                        selected: false,
                        isResizing: false,
                        resizingEdge: "",
                        isDraging: false
                    }
                )
            })
        )

        }
        this.InitialPointX = this.MovingPointX;
        this.InitialPointY = this.MovingPointY;

    }

    MouseDown = (e: MouseEvent) => {

        this.InitialPointX = e.clientX;
        this.InitialPointY = e.clientY;

        switch (this.typeOfShapes) {
            case "default":
                if (this.SelectedIndex !== -1) {
                    const getDraggingShapeIndex = this.getDraggingShape()
                    const edge = this.getResizeEdge()

                    console.log(getDraggingShapeIndex)

                    if (edge) {

                        this.existingShapes[this.SelectedIndex].messageData.isResizing = true;
                        this.existingShapes[this.SelectedIndex].messageData.resizingEdge = edge;
                    }
                    if (getDraggingShapeIndex) {
                        this.existingShapes[this.SelectedIndex].messageData.isDraging = true
                        this.isDraging = true
                    }
                    if (edge == null && !getDraggingShapeIndex) {
                        const selectedIndex = this.existingShapes.findIndex((shapes) =>
                            this.GetSelectedShape(shapes.messageData)
                        );

                        if (selectedIndex !== -1) {
                            this.SelectedIndex = selectedIndex;
                            this.existingShapes[selectedIndex].messageData.selected = true;
                        }
                    }
                } else {
                    const selectedIndex = this.existingShapes.findIndex((shapes) =>
                        this.GetSelectedShape(shapes.messageData)
                    );

                    if (selectedIndex !== -1) {
                        this.SelectedIndex = selectedIndex;
                        this.existingShapes[selectedIndex].messageData.selected = true;
                    }
                }


                break;
            case "Rectangle":

                this.isDrawing = true
                break
            default:
                null
        }


    }


    MouseMove = (e: MouseEvent) => {
        this.MovingPointX = e.clientX;
        this.MovingPointY = e.clientY;

        if (
            this.isDrawing &&
            this.typeOfShapes == "Rectangle" &&
            this.SelectedIndex == -1 && this.canvas && !this.isDraging
        ) {
            this.reDrawShapes();
            this.Draw();
        } else if (this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && !this.isDraging && this.existingShapes[this.SelectedIndex].messageData.isResizing) {
           console.log("reached  herer") 

            this.Resize();
            this.reDrawShapes()
        } else if (this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && this.isDraging) {
            this.Drag()
            this.reDrawShapes()
        }

    }

    MouseUp = (e: MouseEvent) => {

        if (this.isDrawing && this.typeOfShapes == "Rectangle") {

            this.existingShapes.push({
                messageData: {
                    x: this.InitialPointX,
                    y: this.InitialPointY,
                    width: this.MovingPointX - this.InitialPointX,
                    height: this.MovingPointY - this.InitialPointY,
                    type: "rectangle",
                    selected: false,
                    isResizing: false,
                    resizingEdge: "",
                    isDraging: false
                }

            });

            this.Socket.send(
                JSON.stringify({
                    type: "chat",
                    roomId: "2",
                    message: JSON.stringify(
                        {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            width: this.MovingPointX - this.InitialPointX,
                            height: this.MovingPointY - this.InitialPointY,
                            type: "rectangle",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false
                        }
                    )
                })
            )



            this.isDrawing = false

        }

        if (this.SelectedIndex !== -1 && this.existingShapes[this.SelectedIndex].messageData.isResizing && !this.isDraging) {
            let shape = this.existingShapes[this.SelectedIndex]

            switch (shape.messageData.type) {
                case "rectangle":
                    this.Socket.send(
                        JSON.stringify({
                            type: "resized",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    width: shape.messageData.width,
                                    height: shape.messageData.height,
                                    type: "rectangle",
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        })
                    )
                    break;
                default:
                    null;


            }



            shape.messageData.isResizing = false
            shape.messageData.resizingEdge = ""

        }

        if (this.SelectedIndex !== -1 && this.existingShapes[this.SelectedIndex].messageData.isDraging) {
            console.log("reached here")

            let shape = this.existingShapes[this.SelectedIndex]

            switch (shape.messageData.type) {
                case "rectangle":
                    this.Socket.send(
                        JSON.stringify({
                            type: "draged",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    width: shape.messageData.width,
                                    height: shape.messageData.height,
                                    type: "rectangle",
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        })
                    )
                    break;
                default:
                    null;


            }
            this.isDraging = false

        }

        this.InitialPointX = 0,
            this.InitialPointY = 0,
            this.MovingPointX = 0
        this.MovingPointY = 0
    }

    initMouseHandlers() {

        this.canvas.addEventListener("mousedown", this.MouseDown)
        this.canvas.addEventListener("mousemove", this.MouseMove)
        this.canvas.addEventListener("mouseup", this.MouseUp)
    }


    destroy() {
        this.canvas.removeEventListener("mousedown", this.MouseDown)
        this.canvas.removeEventListener("mouseup", this.MouseUp)

        this.canvas.removeEventListener("mousemove", this.MouseMove)
    }


}