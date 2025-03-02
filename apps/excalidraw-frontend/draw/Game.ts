import { circle } from "./shape/Circle";
import { rectangle } from "./shape/Rectangle";
import { line } from "./shape/Line";
import { Pencils } from "./shape/Pencil";
import { texts } from  "./shape/Text";
import { requestToBodyStream } from "next/dist/server/body-streams";
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

interface Rectangle extends BaseShape {
    type: "rectangle";
    width: number;
    height: number;
}

interface Circle extends BaseShape {
    type: "circle";
    radiusX: number;
    radiusY : number
}

interface Line extends BaseShape {
    type: "line";
    x1: number;
    y1: number;
    midX: number;
    midY: number
    Point: 'startingPoint' | "endingPoint" | "midPoint" | ""
}

interface Pencil extends BaseShape {
    type: 'pencil';
    points: number[][]

}

type Shape = Rectangle | Circle | Line | Pencil | Text;

interface ShapesFromServer {
    id?: number,
    messageData: Shape
}


type TypeOfShapes = "rectangle" | "default" | "circle" | "line" | "pencil" | "text"

export class Game {
    private canvas: HTMLCanvasElement;
    private ctx: CanvasRenderingContext2D;
    private existingShapes: ShapesFromServer[];
    private isDrawing: boolean = false;
    private isResizing : boolean = false
    private InitialPointX: number = 0;
    private InitialPointY: number = 0;
    private MovingPointX: number = 0;
    private MovingPointY: number = 0;
    private typeOfShapes: TypeOfShapes = 'default';
    private roomId: string;
    private SelectedIndex: number = -1;
    private isDraging: boolean = false
    private isEditing :boolean = false
    private Points: number[][] = []
    private rectangle : rectangle 
    private circle : circle
    private line : line
    private text : texts
    private pencil : Pencils

    Socket: WebSocket;



    constructor(canvas: HTMLCanvasElement, roomId: string, Socket: WebSocket, existingShapes: ShapesFromServer[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.Socket = Socket;
        this.existingShapes = [...existingShapes];
        this.rectangle = new rectangle()
        this.circle = new circle()
        this.line = new line()
        this.text = new texts()
        this.pencil = new Pencils()

        this.init();
        this.onMessageFromSocket();
        this.initMouseHandlers()

    }

    init() {
        this.reDrawShapes();
    }

    
    reDrawShapes() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = 'black';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.existingShapes.forEach((element) => {
        switch (element.messageData.type) {
            case "rectangle":
                this.rectangle.draw(element.messageData.x, element.messageData.y, element.messageData.width, element.messageData.height, this.ctx);
                break;
            case "circle":
                this.circle.draw(element.messageData,this.ctx);
                break;
            case "line":
                this.line.draw(element.messageData, this.ctx);
                break;
            case "pencil":
                this.pencil.draw(element.messageData, this.ctx);
                break;
            case "text":
                this.text.draw(element.messageData, this.ctx);
                break;
        }
    });

    if(this.SelectedIndex !== -1){
            this.existingShapes.forEach((element) => {
                if (element.messageData.selected) {
                    switch (element.messageData.type) {
                        case "rectangle":
                            this.rectangle.drawSelectedShape(element.messageData, this.ctx);
                            break;
                        case "circle":
                            this.circle.drawSelectedShape(element.messageData, this.ctx);
                            break;
                        case "line":
                            this.line.drawSelectedShape(element.messageData, this.ctx);
                            break;
                        case "text":
                            this.text.drawSelectedShape(element.messageData, this.ctx);
                            break;
                        case "pencil":
                            this.pencil.drawSelectedShape(element.messageData,this.ctx)
                            break
                        

                    }
                }
            })
        }
        ;
}

    onMessageFromSocket() {
    this.Socket.onmessage = (event) => {
        const message = JSON.parse(event.data);
        let messageData;

        if (message.messageData) {
            messageData = JSON.parse(message.messageData);
        }

        

        if (message.type === "deleted") {
            if (this.SelectedIndex !== -1) {
                const deletedShapeId = message.id;
                const selectedShapeId = this.existingShapes[this.SelectedIndex].id;
                
                if (deletedShapeId === selectedShapeId) {
                    this.SelectedIndex = -1;
                }
            }
            this.existingShapes = this.existingShapes.filter(
                (element) => element.id !== message.id
            );
        }

        if(message.type === "edited"){
            
            const index = this.existingShapes.findIndex(element => element.id == message.id)
            this.existingShapes[index].messageData = messageData

        }

        if (message.type === "created") {
            const newShapeIndex = this.existingShapes.findIndex(
                (element) => element.id === undefined
            );
            if (newShapeIndex !== -1) {
                const shape = this.existingShapes[newShapeIndex];
                shape.id = message.id;
                shape.messageData = messageData;
            } else {
                this.existingShapes.push({
                    messageData,
                    id: message.id
                });
            }
        }

        this.reDrawShapes();
    };
}

    setTool(tool: TypeOfShapes) {
        this.typeOfShapes = tool;
    }

    Draw() {
        if (this.ctx && this.canvas) {
            

            switch (this.typeOfShapes) {
                case "rectangle":
                    const width = this.MovingPointX - this.InitialPointX
                    const height = this.MovingPointY - this.InitialPointY
                    this.rectangle.draw(this.InitialPointX, this.InitialPointY,width,height,this.ctx)

                    break
                case "circle":
                    const radiusX = Math.abs(this.MovingPointX - this.InitialPointX)
                    const radiusY = Math.abs(this.MovingPointY - this.InitialPointY)
                    const shapeCircle  =  {
                        x:this.InitialPointX,
                        y:this.InitialPointY,
                        radiusX:radiusX,
                        radiusY:radiusY
                    }
                    this.circle.draw(shapeCircle as Circle,this.ctx) 
                    break
                case "line":
                    const midX = (this.InitialPointX + this.MovingPointX) / 2 
                    const midY = (this.InitialPointY + this.MovingPointY) / 2

                    const shape ={
                        x:this.InitialPointX,
                        y:this.InitialPointY,
                        midX:midX,
                        midY:midY,
                        x1:this.MovingPointX,
                        y1:this.MovingPointY

                    }
                    this.line.draw(shape as Line,this.ctx)
                    break;
                case "pencil":
                    const pencilShape = {
                        points:this.Points
                    }
                    this.pencil.draw(pencilShape as Pencil,this.ctx) 

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
            
            this.rectangle.resizingLogic(shape,this.MovingPointX,this.MovingPointY)


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
            this.circle.resizingLogic(shape,this.MovingPointX,this.MovingPointY)
            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id: this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            radiusX: shape.radiusX,
                            radiusY: shape.radiusY,
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
            
            this.line.resizingLogic(shape,this.MovingPointX,this.MovingPointY) 
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
                            y1: shape.y1,
                            midX: shape.midX,
                            midY: shape.midY,
                            type: "line",
                            selected: false,
                            isResizing: true,
                            resizingEdge: "",
                            isDraging: false,
                            Point: ""
                        }
                    )
                })
            )


        }else if(shape.type === "text"){
            this.text.resizingLogic(shape,this.MovingPointX,this.MovingPointY,this.ctx)
        }else if(shape.type == "pencil"){
            this.pencil.resizingLogic(shape,this.MovingPointX,this.MovingPointY)
        }

            this.reDrawShapes()
    }


    GetSelectedShape = (shape: Shape) => {
        switch (shape.type) {
            case "rectangle":
                const rectangleSelection = this.rectangle.handleSelection(shape,this.InitialPointX,this.InitialPointY)
                return rectangleSelection
            case "circle":
                const circleSelection = this.circle.getOnCirleCircumfurance(shape,this.InitialPointX,this.InitialPointY) 
                return circleSelection
            case "line":
                const lineSelection = this.line.insideShape(shape,this.InitialPointX,this.InitialPointY)
                return lineSelection
            case "text":
                const textSelection = this.text.insideShape(shape,this.InitialPointX,this.InitialPointY,this.ctx)
                return textSelection
            case "pencil":
                const pencilSelection = this.pencil.insideShape(shape,this.InitialPointX,this.InitialPointY)
                return pencilSelection

        }

    };

    


    getDraggingShape() {
        if ( this.SelectedIndex === -1 || this.typeOfShapes !== "default" || this.isEditing) {
            return false
        }

        const shape = this.existingShapes[this.SelectedIndex].messageData

        switch (shape.type) {
            case "rectangle":
                const resultRectangle = this.rectangle.insideShape(shape,this.InitialPointX,this.InitialPointY)
                return resultRectangle
            case "circle":
                const resultCircle = this.circle.insideShape(shape,this.InitialPointX,this.InitialPointY) 
                return resultCircle
            case "line":
                const resultLine = this.line.insideShape(shape,this.InitialPointX,this.InitialPointY)
                return resultLine
            case "text":
                const resultText = this.text.insideShape(shape,this.InitialPointX,this.InitialPointY,this.ctx)
                return resultText
            case "pencil":
                const resultPencil = this.pencil.DragTest(shape,this.InitialPointX,this.InitialPointY)
                return resultPencil
            default:
                return false

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
                                isDraging: true
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
                                radiusX: shape.radiusX,
                                radiusY :shape.radiusY,
                                type: "circle",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging:false 
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
                shape.midX += dx
                shape.midY += dy

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
                                y1: shape.y1,
                                midX: shape.midX,
                                midY: shape.midY,
                                type: "line",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging:false 
                            }
                        )
                    })
                )
                break

            case "text":

                shape.x += dx;
                shape.y += dy;

                this.Socket.send(
                    JSON.stringify({
                        type: "moving",
                        roomId: "2",
                        id: this.existingShapes[this.SelectedIndex].id,
                        message: JSON.stringify({
                            x: shape.x,
                            y: shape.y,
                            content: shape.content,
                            type: "text",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false,
                            fontSize: shape.fontSize,
                            fontFamily: shape.fontFamily
                        })
                    })
                );
                break;

            case "pencil":
                const transformedPoints = []
                for(let i = 0;i<shape.points.length;i++){
                    const [x,y] = shape.points[i]

                    transformedPoints.push([
                        x + dx, y + dy
                    ])
                }

                shape.points = transformedPoints

                break

        }

        this.InitialPointX = this.MovingPointX;
        this.InitialPointY = this.MovingPointY;

        
    }


    handleDefaultMode = (e: MouseEvent) => {
        
        if (this.SelectedIndex === -1 && !this.isEditing) {
            this.selectShape();
            return;
        }

        if(this.isEditing){
            const textArea = document.getElementById('textarea')
            if(!textArea){
                this.isEditing = false
                return
            }
            if (e.target !== textArea) {

                if (document.body.contains(textArea)) {
                    document.body.removeChild(textArea);
                    const escapeEvent = new KeyboardEvent('keydown', {
                        key: 'Escape',
                        bubbles: true,
                        cancelable: true,
                        code: "Escape"
                    });
                    textArea.dispatchEvent(escapeEvent);
                }

            }

        }

        const draggingShapeIndex = this.getDraggingShape();
        const selectedShape: ShapesFromServer = this.existingShapes[this.SelectedIndex];
        const messageData = selectedShape?.messageData;
        
        

        if (!messageData) return;

        switch (messageData.type) {
            case "rectangle":
                this.handleRectangle(messageData, draggingShapeIndex);
                break;
            case "circle":
                this.handleCircle(messageData, draggingShapeIndex);
                break;
            case "line":
                this.handleLine(messageData, draggingShapeIndex);
                break;
            case "text":
                this.handleText(messageData, draggingShapeIndex)
                break
            case "pencil" : 
                this.handlePencil(messageData,draggingShapeIndex)
                break



        }

        if (!this.isDraging && !this.isResizing) this.deselectShape();
    };

    handleText = (messageData: Text, draggingShapeIndex: boolean) => {

        const cornersResult = this.text.onCorner(messageData,this.InitialPointX,this.InitialPointY,this.ctx)
        const edgeResult = this.text.handleSelection(messageData,this.InitialPointX,this.InitialPointY,this.ctx)
        
        if(cornersResult.result || edgeResult.result){
            cornersResult.result ?  this.setResizing(messageData,cornersResult.corner) : this.setResizing(messageData,edgeResult.edge) 
        }
        else if (draggingShapeIndex) {
            this.setDragging(messageData);
        }
    };


    handlePencil =(messageData : Pencil, draggingShapeIndex : boolean)=>{
        const cornersResult = this.pencil.onCorner(messageData,this.InitialPointX,this.InitialPointY)
        const edgeResult = this.pencil.handleSelection(messageData,this.InitialPointX,this.InitialPointY)

        if (cornersResult.result || edgeResult.result) {
            cornersResult.result ? this.setResizing(messageData, cornersResult.corner) : this.setResizing(messageData, edgeResult.edge)
        }
        else if (draggingShapeIndex) {
            this.setDragging(messageData);
        }


    }


    handleRectangle = (messageData: Rectangle, draggingShapeIndex: boolean) => {
        const resizeEdge = this.rectangle.resizingEdge(messageData,this.InitialPointX,this.InitialPointY);
        if (resizeEdge !== null) {
            this.setResizing(messageData, resizeEdge);
        } else if (draggingShapeIndex) {
            this.setDragging(messageData);
        }
    };

    handleCircle = (messageData: Circle, draggingShapeIndex: boolean) => {
        const cornersResult = this.circle.onCorner(messageData,this.InitialPointX,this.InitialPointY)
        const edgeResult = this.circle.handleSelection(messageData,this.InitialPointX,this.InitialPointY)
        if ( cornersResult.result || edgeResult.result ) {
            
            cornersResult.result ?  this.setResizing(messageData,cornersResult.corner) : this.setResizing(messageData,edgeResult.edge) 
            console.log(edgeResult.edge)
        } else if (draggingShapeIndex) {
            
            this.setDragging(messageData);
        }
    };

    handleLine = (messageData: Line, draggingShapeIndex: boolean) => {

        const onPoint = this.line.getOnWhichPoint(messageData,this.InitialPointX,this.InitialPointY)
        if (onPoint) {
            messageData.Point = onPoint
            this.setResizing(messageData);
        } else if (draggingShapeIndex && !onPoint) {
            this.setDragging(messageData);
        }
    };

    

    setResizing = (messageData: Shape, resizingEdge: string = "") => {
        messageData.isResizing = true;
        messageData.isDraging = false;
        this.isResizing = true
        this.isDraging = false;
        messageData.resizingEdge = resizingEdge;

    };

    setDragging = (messageData: Shape) => {
        messageData.isDraging = true;
        this.isDraging = true;
        messageData.isResizing = false;
        messageData.resizingEdge = "";
    };

    selectShape = () => {
        const selectedIndex = this.existingShapes.findIndex((shape) =>
            this.GetSelectedShape(shape.messageData)
        );

        if (selectedIndex !== -1) {
            this.isDraging = false
            this.SelectedIndex = selectedIndex;
            this.existingShapes[selectedIndex].messageData.selected = true;
            this.reDrawShapes();
            console.log(this.existingShapes)
        }
    };

    deselectShape = () => {
        if (this.SelectedIndex !== -1) {
            this.existingShapes.forEach(shape => shape.messageData.selected = false);
            this.SelectedIndex = -1
            this.isDraging = false
            this.reDrawShapes();
        }
    };


    handleDrawingMode = () => {

        this.isDrawing = true;
        this.isDraging = false;
        if(this.SelectedIndex !== -1){
            this.existingShapes[this.SelectedIndex].messageData.selected = false
            this.SelectedIndex = -1
            this.reDrawShapes()
        }

        if (this.typeOfShapes == 'pencil') {
            this.Points.push([this.InitialPointX, this.InitialPointY])

        }


    };

    handlePushNewText = (text: string, x: number, y: number) => {
        if (text) {
            this.existingShapes.push({
                messageData: {
                    x: x ,
                    y: y ,
                    content: text,
                    type: "text",
                    selected: false,
                    isResizing: false,
                    resizingEdge: "",
                    isDraging: false,
                    fontSize: 20,
                    fontFamily: 'san'
                }
            });

            this.Socket.send(
                JSON.stringify({
                    type: "created",
                    roomId: "2",
                    message: JSON.stringify({
                        x: x ,
                        y: y ,
                        content: text,
                        type: "text",
                        selected: false,
                        isResizing: false,
                        resizingEdge: "",
                        isDraging: false,
                        fontSize: 20,
                        fontFamily: 'san-serif  '
                    })
                })
            );
        }

    }

    handleEditText(shape:ShapesFromServer){

        if(shape.messageData.type !== "text"){
            return
        }

        this.existingShapes.splice(this.SelectedIndex,0,shape)


        this.Socket.send(
            JSON.stringify({
                type: "edited",
                roomId: "2",
                id : shape.id,
                message: JSON.stringify({
                    x: shape.messageData.x ,
                    y: shape.messageData.y ,
                    content: shape.messageData.content,
                    type: "text",
                    selected: false,
                    isResizing: false,
                    resizingEdge: "",
                    isDraging: false,
                    fontSize: shape.messageData.fontSize,
                    fontFamily: 'san-serif  '
                })
            })
        )
        
    }
    

    handlekeydown = (e: KeyboardEvent, textArea: HTMLTextAreaElement, x: number, y: number, Content: ShapesFromServer | null,selectedIndex:number) => {
    if (e.key === 'Enter' && !e.shiftKey || e.key === "Escape") {
        e.preventDefault();

        if (e.key === 'Enter') {
            const textContent = textArea.value.trim();
            
            if (textContent) {
                if (Content && Content.messageData.type === "text") {
                    Content.messageData.content = textContent;
                    
                    if (this.isEditing) {
                        this.handleEditText(Content);
                    }
                } else {
                    this.handlePushNewText(textContent, x, y);
                }
            }
        } else if (e.key === "Escape" && this.isEditing && Content) {
            this.existingShapes.splice(selectedIndex, 0, Content);
            this.existingShapes[selectedIndex].messageData.selected = false
        }

        if (document.body.contains(textArea)) {
            document.body.removeChild(textArea);
        }

        this.isEditing = false;
        this.SelectedIndex = -1;
        this.reDrawShapes();
    }
}


    MouseDown = (e: MouseEvent) => {

        this.InitialPointX = e.clientX;
        this.InitialPointY = e.clientY;

        switch (this.typeOfShapes) {
            case "default":
                this.handleDefaultMode(e);

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
            case "pencil":
                this.handleDrawingMode();
                break
            case "text":
                this.text.createTextArea(null,e.clientX, e.clientY,this.SelectedIndex,this.handlekeydown);
                break;
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
            if (this.typeOfShapes === "pencil") {
                this.Points.push([this.MovingPointX, this.MovingPointY]);
            }

            this.reDrawShapes();
            this.Draw();
        } else if (!this.isEditing && this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && !this.isDraging && this.existingShapes[this.SelectedIndex].messageData.isResizing) {
            this.Resize();
            this.reDrawShapes()
        } else if (this.SelectedIndex !== -1 && this.typeOfShapes == 'default' && this.isDraging && this.existingShapes[this.SelectedIndex].messageData.isDraging) {

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
                            type: "created",
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
                    const radiusX = Math.abs(this.MovingPointX - this.InitialPointX)
                    const radiusY = Math.abs(this.MovingPointY - this.InitialPointY)
                    this.existingShapes.push({
                        messageData: {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            radiusX:radiusX,
                            radiusY:radiusY,
                            type: "circle",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false
                        }

                    });

                    this.Socket.send(
                        JSON.stringify({
                            type: "created",
                            roomId: "2",
                            message: JSON.stringify({
                                x: this.InitialPointX,
                                y: this.InitialPointY,
                                radiusX:radiusX,
                                radiusY:radiusY,
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

                    const midX = (this.InitialPointX + this.MovingPointX) / 2
                    const midY = (this.InitialPointY + this.MovingPointY) / 2
                    this.existingShapes.push({
                        messageData: {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            x1: this.MovingPointX,
                            y1: this.MovingPointY,
                            midX: midX,
                            midY: midY,
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
                            type: "created",
                            roomId: "2",
                            message: JSON.stringify({
                                x: this.InitialPointX,
                                y: this.InitialPointY,
                                midX: (this.InitialPointX + this.MovingPointX) / 2,
                                midY: (this.InitialPointY + this.MovingPointY) / 2,
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
                case "pencil":
                    this.existingShapes.push({
                        messageData: {
                            x: this.InitialPointX,
                            y: this.InitialPointY,
                            points: this.Points,
                            type: "pencil",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false,
                        }

                    });

                    this.Socket.send(
                        JSON.stringify({
                            type: "created",
                            roomId: "2",
                            message: JSON.stringify({
                                x: this.InitialPointX,
                                y: this.InitialPointY,
                                points: this.Points,
                                type: "pencil",
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
            this.setTool('default')
            this.Points = []

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
                                    radiusX: shape.messageData.radiusX,
                                    radiusY: shape.messageData.radiusY,
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
                                    x1: shape.messageData.x1,
                                    y1: shape.messageData.y1,
                                    midX: shape.messageData.midX,
                                    midY: shape.messageData.midY,
                                    type: "line",
                                    selected:false,
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
            this.isResizing = false

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
                                    radiusX: shape.messageData.radiusX,
                                    radiusY: shape.messageData.radiusY,
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
                                    x1: shape.messageData.x1,
                                    y1: shape.messageData.y1,
                                    midX: shape.messageData.midX,
                                    midY: shape.messageData.midY,
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
                case "text":
                    this.Socket.send(
                        JSON.stringify({
                            type: "draged",
                            roomId: "2",
                            id: shape.id,
                            message: JSON.stringify({
                                x: shape.messageData.x,
                                y: shape.messageData.y,
                                content: shape.messageData.content,
                                type: "text",
                                selected: false,
                                isResizing: false,
                                resizingEdge: "",
                                isDraging: false,
                                fontSize: shape.messageData.fontSize,
                                fontFamily: shape.messageData.fontFamily
                            })
                        })
                    );
                    break;
                default:
                    null;


            }
            this.isDraging = false

        }

        this.InitialPointX = 0
        this.InitialPointY = 0
        this.MovingPointX = 0
        this.MovingPointY = 0

    }

    KeyDown = (e: KeyboardEvent) => {
        if (this.SelectedIndex === -1 || this.isEditing) {
            return
        }
        if (e.key == "Backspace" || e.key == 'Delete') {

            const shape = this.existingShapes[this.SelectedIndex]
            this.existingShapes.splice(this.SelectedIndex, 1)

            this.Socket.send(
                JSON.stringify({
                    type: "delete",
                    roomId: "2",
                    id: shape.id,
                })
            )
            
            shape.messageData.selected = false
            this.SelectedIndex = -1
            this.reDrawShapes()

        }

    }

    DoubleClick=(e:MouseEvent)=>{
        if(this.SelectedIndex == -1 ){
            return 
        }
        const shape = this.existingShapes[this.SelectedIndex]

        if(shape.messageData.type !== 'text'){
            return
        }

        const result = this.text.insideShape(shape.messageData,e.clientX,e.clientY,this.ctx)

        if(result){
            this.isEditing = true
            this.existingShapes.splice(this.SelectedIndex,1)
            this.reDrawShapes()
            this.text.createTextArea(shape,shape.messageData.x ,shape.messageData.y,this.SelectedIndex,this.handlekeydown)
            this.SelectedIndex = -1 

        }

        



    }



    initMouseHandlers() {

        this.canvas.addEventListener("mousedown", this.MouseDown)
        this.canvas.addEventListener("mousemove", this.MouseMove)
        this.canvas.addEventListener("mouseup", this.MouseUp)
        window.addEventListener("keydown", this.KeyDown)
        window.addEventListener("dblclick",this.DoubleClick)

    }


    destroy() {

        this.canvas.removeEventListener("mousedown", this.MouseDown)
        this.canvas.removeEventListener("mouseup", this.MouseUp)
        this.canvas.removeEventListener("mousemove", this.MouseMove)


    }


}