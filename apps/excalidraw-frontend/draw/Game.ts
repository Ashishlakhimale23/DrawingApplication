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
    radius: number;
}

interface Line extends BaseShape {
    type: "line";
    x1: number;
    y1: number;
    Point: 'startingPoint' | "endingPoint" | ""
}

type Shape = Rectangle | Circle | Line;

interface ShapesFromServer {
    id?: number,
    messageData: Shape
}


type TypeOfShapes = "rectangle" | "default" | "circle" | "line"

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
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
        this.ctx.fillStyle = 'black'

        this.existingShapes.forEach((element) => {


            switch (element.messageData.type) {
                case "rectangle":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 2
                    this.ctx.strokeRect(element.messageData.x, element.messageData.y, element.messageData.width, element.messageData.height)
                    if(element.messageData.selected){
                        this.DrawSelectedShape()
                    }
                    break

                case "circle":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 2
                    this.ctx.beginPath()
                    this.ctx.arc(element.messageData.x, element.messageData.y, element.messageData.radius, 0, 2 * Math.PI);
                    this.ctx.stroke()
                    this.ctx.closePath()
                    if(element.messageData.selected){
                        this.DrawSelectedShape()
                    } 
                    break

                case "line":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 3
                    this.ctx.beginPath()
                    this.ctx.moveTo(element.messageData.x, element.messageData.y)
                    this.ctx.lineTo(element.messageData.x1, element.messageData.y1)
                    this.ctx.stroke()
                    this.ctx.closePath()
                    if(element.messageData.selected){
                        this.DrawSelectedShape()
                    } 
                    break;

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
            console.log(this.typeOfShapes)

            switch (this.typeOfShapes) {
                case "rectangle":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 2
                    this.ctx.strokeRect(this.InitialPointX, this.InitialPointY,this.MovingPointX - this.InitialPointX,this.MovingPointY - this.InitialPointY)
                    break
                case "circle":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 2
                    const radius = Math.sqrt(Math.pow(this.MovingPointX - this.InitialPointX, 2) + Math.pow(this.MovingPointY - this.InitialPointY, 2));
                    this.ctx.beginPath()
                    this.ctx.arc(this.InitialPointX, this.InitialPointY, radius, 0, 2 * Math.PI);
                    this.ctx.stroke()
                    this.ctx.closePath()
                    break
                case "line":
                    this.ctx.strokeStyle = "white"
                    this.ctx.lineWidth = 2
                    this.ctx.beginPath()
                    this.ctx.moveTo(this.InitialPointX, this.InitialPointY)
                    this.ctx.lineTo(this.MovingPointX, this.MovingPointY)
                    this.ctx.stroke()
                    this.ctx.closePath()
                    break
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
            const x1 = (shape.width + shape.x)
            const y1 = shape.height + shape.y
            if(shape.x > x1 && shape.y < y1 ){
                shape.width = shape.x - x1
                shape.x = x1
                switch(shape.resizingEdge){
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
                switch(shape.resizingEdge){
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
            
            if(shape.x > x1 && shape.y > y1){
                shape.width = shape.x - x1
                shape.x = x1
                shape.height = shape.y - y1
                shape.y = y1

                switch(shape.resizingEdge){
                    case "top-left" :
                        shape.resizingEdge = "bottom-right"
                        break
                    case "top-right" : 
                        shape.resizingEdge = "bottom-left" 
                        break
                    case 'bottom-right' :
                        shape.resizingEdge = "top-left"
                        break
                    case "bottom-left":
                        shape.resizingEdge = "top-right"
                        break


                }
                
            }

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
        } else if (shape.type == "circle") {
            let radius = Math.sqrt(Math.pow(this.MovingPointX - shape.x, 2) + Math.pow(this.MovingPointY - shape.y, 2))
            shape.radius = radius
            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id: this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            radius: radius,
                            type: "circle",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false
                        }
                    )
                })
            )
        } else if (shape.type == "line") {

            switch (shape.Point) {
                case "startingPoint":
                    shape.x = this.MovingPointX
                    shape.y = this.MovingPointY
                    break
                case "endingPoint":
                    shape.x1 = this.MovingPointX
                    shape.y1 = this.MovingPointY
                    break
            }

            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id: this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            x1:shape.x1,
                            y1:shape.y1,
                            type: "line",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false
                        }
                    )
                })
            )

        }
    }

    getResizeEdge() {
        let shape = this.existingShapes[this.SelectedIndex].messageData
        if (shape.type == "rectangle") {
            const { x, y, selected, width, height } = shape;
            const threshold = 5;

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
            case "circle":
                const calculatedRadius = Math.sqrt(Math.pow(shape.x - this.InitialPointX, 2) + Math.pow(shape.y - this.InitialPointY, 2))
                return (Math.abs(calculatedRadius - shape.radius) <= 5)
            case "line":
                const slope = (shape.y1 - shape.y) / (shape.x1 - shape.x)
                if (!isFinite(slope)) {
                    return Math.abs(this.InitialPointX - shape.x) <= 3;
                }
                const expectedY = slope * (this.InitialPointX - shape.x) + shape.y
                return Math.abs(this.InitialPointY - expectedY) <= 3
        }

    };


    getOnCirleCircumfurance() {
        if (this.existingShapes[this.SelectedIndex].messageData.type == "circle") {
            const shape = this.existingShapes[this.SelectedIndex].messageData
            const calculatedRadius = Math.sqrt(Math.pow(shape.x - this.InitialPointX, 2) + Math.pow(shape.y - this.InitialPointY, 2))
            //@ts-ignore
            return (Math.abs(calculatedRadius - shape.radius) <= 5)
        }
        return false


    }

    getDraggingShape() {
        const shape = this.existingShapes[this.SelectedIndex].messageData
        if (!shape.isDraging && this.SelectedIndex === -1 && this.typeOfShapes !== "default") {
            return
        }


        switch (shape.type) {
            case "rectangle":
                const x = shape.width < 0 ? shape.x + shape.width : shape.x;
                const y = shape.height < 0 ? shape.y + shape.height : shape.y;
                const width = Math.abs(shape.width);
                const height = Math.abs(shape.height);
                return (x < this.InitialPointX && this.InitialPointX < (x + width) && y < this.InitialPointY && this.InitialPointY < (y + height))
            case "circle":
                const calculatedRadius = Math.sqrt(Math.pow(shape.x - this.InitialPointX, 2) + Math.pow(shape.y - this.InitialPointY, 2))
                return (calculatedRadius + 5 <= shape.radius )
            case "line":
                const slope = (shape.y1 - shape.y) / (shape.x1 - shape.x)
                const tolerance = 1
                if (!isFinite(slope)) {
                    return Math.abs(this.InitialPointX - shape.x) <= tolerance ;
                }
                const expectedY = slope * (this.InitialPointX - shape.x) + shape.y
                return Math.abs(this.InitialPointY - expectedY) <= tolerance


            default:
                return false
                

        }

    }

    DrawSelectedShape(){
       
        if(this.SelectedIndex == -1){
            return
        }
        const shape = this.existingShapes[this.SelectedIndex].messageData
        if(!shape.selected){
            return 
        }
       
        switch(shape.type){
            case "rectangle":
                this.ctx.strokeStyle = "white"
                this.ctx.lineWidth = 2
                const minX = Math.min(shape.x,(Math.abs(shape.width) + shape.x))
                const minY = Math.min(shape.y,(Math.abs(shape.height) + shape.y))
                this.ctx.strokeRect(minX - 10, minY - 10, shape.width + 20,shape.height + 20)
                break 
            case "circle":
                this.ctx.strokeStyle = "white"
                this.ctx.lineWidth = 2
                this.ctx.beginPath()
                this.ctx.arc(shape.x, shape.y, shape.radius + 5, 0, 2 * Math.PI);
                this.ctx.stroke()
                this.ctx.closePath()
                break
            case "line":
                
                this.ctx.strokeStyle = "white"
                this.ctx.beginPath()
                this.ctx.arc(shape.x-2,shape.y-2,5,0,2*Math.PI)
                this.ctx.stroke()
                this.ctx.closePath()

                this.ctx.beginPath()
                this.ctx.arc(shape.x1+2,shape.y1+2,5,0,2*Math.PI)
                this.ctx.stroke()
                this.ctx.closePath()

                break
        }

    }


    Drag() {
        if (this.SelectedIndex === -1 || !this.isDraging || !this.existingShapes[this.SelectedIndex].messageData.isDraging) {
            return
        }

        const shape = this.existingShapes[this.SelectedIndex].messageData

        const dx = this.MovingPointX - this.InitialPointX
        const dy = this.MovingPointY - this.InitialPointY

        switch (shape.type) {
            case "rectangle":
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

                break
            case "circle":
                shape.x += dx
                shape.y += dy
                this.Socket.send(
                    JSON.stringify({
                        type: "moving",
                        roomId: "2",
                        id: this.existingShapes[this.SelectedIndex].id,
                        message: JSON.stringify(
                            {
                                x: shape.x,
                                y: shape.y,
                                radius: shape.radius,
                                type: "circle",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging: false
                            }
                        )
                    })
                )
                break
            case "line":
                shape.x += dx
                shape.y += dy
                shape.x1 += dx
                shape.y1 += dy
                this.Socket.send(
                    JSON.stringify({
                        type: "moving",
                        roomId: "2",
                        id: this.existingShapes[this.SelectedIndex].id,
                        message: JSON.stringify(
                            {
                                x: shape.x,
                                y: shape.y,
                                x1: shape.x1,
                                y1 :shape.y1,
                                type: "line",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging: false
                            }
                        )
                    })
                ) 
                break
        }

        this.InitialPointX = this.MovingPointX;
        this.InitialPointY = this.MovingPointY;

    }


    getOnWhichPoint() {
        if (this.SelectedIndex === -1 && !this.existingShapes[this.SelectedIndex].messageData.isResizing && this.existingShapes[this.SelectedIndex].messageData.type !== 'line') {
            return null
        }


        if (this.existingShapes[this.SelectedIndex].messageData.type === 'line') {
            //@ts-ignore
            const { x, y, x1, y1 } = this.existingShapes[this.SelectedIndex].messageData;
            const tolerance = 4

            const distanceToStart = Math.sqrt(
                Math.pow(this.InitialPointX - x + 2, 2) + Math.pow(this.InitialPointY - y + 2, 2)
            );

            const distanceToEnd = Math.sqrt(
                Math.pow(this.InitialPointX - x1 - 2 , 2) + Math.pow(this.InitialPointY - y1-2, 2)
            );

            if (distanceToStart <= tolerance) {
                return "startingPoint";
            }

            if (distanceToEnd <= tolerance) {
                return "endingPoint";
            }

            return null;

        }
        return null


    }


    handleDefaultMode = () => {
        if (this.SelectedIndex !== -1) {
            const draggingShapeIndex = this.getDraggingShape();
            const resizeEdge = this.getResizeEdge();
            const onPoint = this.getOnWhichPoint();
            const onCircumfurance = this.getOnCirleCircumfurance()
            console.log(onPoint)

            const selectedShape = this.existingShapes[this.SelectedIndex];
            const { messageData } = selectedShape;

            if (resizeEdge !==null && messageData.type === "rectangle") {
                messageData.isResizing = true;
                messageData.isDraging = false;
                this.isDraging = false;
                messageData.resizingEdge = resizeEdge;
            } else if (draggingShapeIndex && !messageData.isResizing) {
                messageData.isDraging = true;
                this.isDraging = true;
            } else if (resizeEdge ==null && messageData.type === "circle" && !draggingShapeIndex && onCircumfurance) {
                messageData.isResizing = true;
                messageData.isDraging = false
                this.isDraging = false;
            } else if (resizeEdge==null && messageData.type === "line" && onPoint !== null) {
                messageData.isResizing = true;
                messageData.isDraging = false;
                //@ts-ignore
                messageData.Point = onPoint;
                this.isDraging = false;
            } else if (messageData.type === "line" && draggingShapeIndex && onPoint === null) {
                this.isDraging = true;
                messageData.isResizing = false;
                messageData.isDraging = true;
            } else if (resizeEdge ==null && !draggingShapeIndex && onPoint==null) {
                const selectedIndex = this.existingShapes.findIndex((shape) =>
                    this.GetSelectedShape(shape.messageData)
                );

                if (selectedIndex !== -1) {
                    this.existingShapes[this.SelectedIndex].messageData.selected = false
                    this.SelectedIndex = selectedIndex;
                    this.existingShapes[selectedIndex].messageData.selected = true;
                    this.reDrawShapes()
                }else{
                    this.SelectedIndex = -1
                    messageData.isDraging = false;
                    messageData.isResizing = false;
                    messageData.selected = false
                    this.isDraging = false;
                    this.SelectedIndex = -1;
                    this.reDrawShapes()

                }

                
            }else if(onPoint == null && !onCircumfurance  && resizeEdge == null && !draggingShapeIndex  ){
                messageData.isDraging = false;
                messageData.isResizing = false;
                messageData.selected = false
                this.isDraging = false;
                this.SelectedIndex = -1;
                this.reDrawShapes()

            }
        } else {
            const selectedIndex = this.existingShapes.findIndex((shape) =>
                this.GetSelectedShape(shape.messageData)
            );

            if (selectedIndex !== -1) {
                this.SelectedIndex = selectedIndex;
                this.existingShapes[selectedIndex].messageData.selected = true;
                this.reDrawShapes()
            }
        }
    };

    handleDrawingMode = () => {
        this.isDrawing = true;
        this.isDraging = false;
        this.SelectedIndex !== -1 ? this.existingShapes[this.SelectedIndex].messageData.selected = false: -1 ;
        
    };

    MouseDown = (e: MouseEvent) => {

        this.InitialPointX = e.clientX;
        this.InitialPointY = e.clientY;

        switch (this.typeOfShapes) {
            case "default":
                this.handleDefaultMode();

                break;
            case "rectangle":
                this.handleDrawingMode()
                break
            case "circle":

                this.handleDrawingMode()

                break
            case "line":

                this.handleDrawingMode()

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

            this.SelectedIndex == -1 && this.canvas && !this.isDraging
        ) {
            this.reDrawShapes();
            this.Draw();
        } else if (this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && !this.isDraging && this.existingShapes[this.SelectedIndex].messageData.isResizing) {
            console.log("reached here....")
            this.Resize();
            this.reDrawShapes()
        } else if (this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && this.isDraging) {
            this.Drag()
            this.reDrawShapes()
        }

    }
 
    MouseUp = (e: MouseEvent) => {

        if (this.isDrawing) {

            switch (this.typeOfShapes) {
                case "rectangle":
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
                                    width: Math.abs(this.MovingPointX - this.InitialPointX),
                                    height: Math.abs(this.MovingPointY - this.InitialPointY),
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
                case "circle":
                    this.existingShapes.push({
                        messageData: {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            radius: Math.sqrt(Math.pow(this.MovingPointX - this.InitialPointX, 2) + Math.pow(this.MovingPointY - this.InitialPointY, 2)),
                            type: "circle",
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
                            message: JSON.stringify({
                                x: this.InitialPointX,
                                y: this.InitialPointY,
                                radius: Math.sqrt(Math.pow(this.MovingPointX - this.InitialPointX, 2) + Math.pow(this.MovingPointY - this.InitialPointY, 2)),
                                type: "circle",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging: false
                            })
                        })
                    )

                    break;
                case "line":
                    this.existingShapes.push({
                        messageData: {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            x1: this.MovingPointX,
                            y1: this.MovingPointY,
                            type: "line",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false,
                            Point: ""
                        }

                    });

                    this.Socket.send(
                        JSON.stringify({
                            type: "chat",
                            roomId: "2",
                            message: JSON.stringify({
                                x: this.InitialPointX,
                                y: this.InitialPointY,
                                x1: this.MovingPointX,
                                y1: this.MovingPointY,
                                type: "line",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging: false
                            })
                        })
                    )
                    break;

            }


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

                case "circle":
                    this.Socket.send(
                        JSON.stringify({
                            type: "resized",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    type: "circle",
                                    radius: shape.messageData.radius,
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        }))
                    break
                case "line":

                    this.Socket.send(
                        JSON.stringify({
                            type: "resized",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    x1:shape.messageData.x1,
                                    y1:shape.messageData.y1,
                                    type: "line",
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        }))
                    break


                default:
                    null;


            }



            shape.messageData.isResizing = false
            shape.messageData.resizingEdge = ""


        }

        if (this.SelectedIndex !== -1 && this.existingShapes[this.SelectedIndex].messageData.isDraging) {

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
                case "circle":
                    this.Socket.send(
                        JSON.stringify({
                            type: "draged",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    radius: shape.messageData.radius,
                                    type: "circle",
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        })
                    )
                    break
                case "line":
                    this.Socket.send(
                        JSON.stringify({
                            type: "draged",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify(
                                {
                                    x: shape.messageData.x,
                                    y: shape.messageData.y,
                                    x1:shape.messageData.x1,
                                    y1:shape.messageData.y1,
                                    type: "line",
                                    selected: false,
                                    isResizing: false,
                                    resizingEdge: "",
                                    isDraging: false
                                }
                            )
                        })
                    )
                    break
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