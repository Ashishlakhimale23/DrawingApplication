import { circle } from "./shape/Circle";
import { rectangle } from "./shape/Rectangle";
import { line } from "./shape/Line";
import { Pencils } from "./shape/Pencil";
import { texts } from  "./shape/Text";
import { invoker } from "@/utils/Invoker";
import { DraggedCommand, DrawCommand, ResizedCommand, SelectedCommand } from "@/utils/Commands";
import { ShapesFromServer,TypeOfShapes,Rectangle,Circle,Line,Pencil,Text,Shape } from "./shape/types";
import { UtlisFunction } from "@/utils/utilsFunctions";

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
    static typeOfShapes: TypeOfShapes = 'default';
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
    private originalCordinates:{x:number,y:number} = {x:0,y:0};
    private oldshape : ShapesFromServer | null = null
    private utilsFunctions : UtlisFunction

    Socket: WebSocket;


    constructor(canvas: HTMLCanvasElement, roomId: string, Socket: WebSocket, existingShapes: ShapesFromServer[]) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.Socket = Socket;
        this.existingShapes = existingShapes;
        this.rectangle = new rectangle()
        this.circle = new circle()
        this.line = new line()
        this.text = new texts()
        this.pencil = new Pencils()
        this.utilsFunctions = new UtlisFunction(this.ctx)

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
        Game.typeOfShapes = tool;
    }

    Draw() {
        if (this.ctx && this.canvas) {
            document.body.style.cursor = "crosshair"
            switch (Game.typeOfShapes) {
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
                    document.body.style.cursor = "default"
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
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false,
                            Point: ""
                        }
                    )
                })
            )


        }else if(shape.type === "text"){
            this.text.resizingLogic(shape,this.MovingPointX,this.MovingPointY,this.ctx)
            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id: this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            fontSize :shape.fontSize,
                            fontFamily : shape.fontFamily,
                            content :shape.content,
                            type: "text",
                            selected: false,
                            isResizing: true,
                            resizingEdge: "",
                            isDraging: false,
                            Point: ""
                        }
                    )
                })
            )
        } else if (shape.type == "pencil") {

            this.pencil.resizingLogic(shape, this.MovingPointX, this.MovingPointY)
            this.Socket.send(
                JSON.stringify({
                    type: "moving",
                    roomId: "2",
                    id: this.existingShapes[this.SelectedIndex].id,
                    message: JSON.stringify(
                        {
                            x: shape.x,
                            y: shape.y,
                            points:shape.points,
                            type: "pencil",
                            selected: false,
                            isResizing: true,
                            resizingEdge: "",
                            isDraging: false,
                            Point: ""
                        }
                    )
                })
            )
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

    


    getDraggingShape(PointX :number , PointY : number) {
        if ( this.SelectedIndex === -1 || Game.typeOfShapes !== "default" || this.isEditing) {
            return false
        }

        const shape = this.existingShapes[this.SelectedIndex].messageData

        switch (shape.type) {
            case "rectangle":
                const resultRectangle = this.rectangle.insideShape(shape,PointX,PointY)
                return resultRectangle
            case "circle":
                const resultCircle = this.circle.insideShape(shape,PointX,PointY) 
                return resultCircle
            case "line":
                const resultLine = this.line.insideShape(shape,PointX,PointY)
                return resultLine
            case "text":
                const resultText = this.text.insideShape(shape,PointX,PointY,this.ctx)
                return resultText
            case "pencil":
                const resultPencil = this.pencil.DragTest(shape,PointX,PointY)
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
                                isDraging:true
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
                            isDraging: true,
                            fontSize: shape.fontSize,
                            fontFamily: shape.fontFamily
                        })
                    })
                );
                break;

            case "pencil":
                const transformedPoints = []
                shape.x += dx
                shape.y += dy
                for(let i = 0;i<shape.points.length;i++){
                    const [x,y] = shape.points[i]

                    transformedPoints.push([
                        x + dx, y + dy
                    ])
                }

                shape.points = transformedPoints
                this.Socket.send(
                    JSON.stringify({
                        type: "moving",
                        roomId: "2",
                        id: this.existingShapes[this.SelectedIndex].id,
                        message: JSON.stringify({
                            x: shape.x,
                            y: shape.y,
                            points:shape.points,
                            type: "pencil",
                            selected: false,
                            isResizing: false,
                            resizingEdge: "",
                            isDraging: false,
                        })
                    })
                );

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

        const draggingShapeIndex = this.getDraggingShape(this.InitialPointX,this.InitialPointY);
        const selectedShape: ShapesFromServer = this.existingShapes[this.SelectedIndex];
        
        

        if (!selectedShape.messageData) return;

        switch (selectedShape.messageData.type) {
            case "rectangle":
                this.handleRectangle(selectedShape, draggingShapeIndex);
                break;
            case "circle":
                this.handleCircle(selectedShape, draggingShapeIndex);
                break;
            case "line":
                this.handleLine(selectedShape, draggingShapeIndex);
                break;
            case "text":
                this.handleText(selectedShape, draggingShapeIndex)
                break
            case "pencil" : 
                this.handlePencil(selectedShape,draggingShapeIndex)
                break



        }

        if (!this.isDraging && !this.isResizing) this.deselectShape(this.SelectedIndex);
    };

    handleText = (shape:ShapesFromServer, draggingShapeIndex: boolean) => {

        const edgeResult = this.text.resizingEdge(shape.messageData as Text,this.InitialPointX,this.InitialPointY,this.ctx)
        
        if(edgeResult.result && edgeResult.edge !== null){
            this.setResizing(shape,edgeResult.edge) 
        }
        else if (draggingShapeIndex) {
            this.setDragging(shape.messageData);
        }
    };


    handlePencil =(shape: ShapesFromServer, draggingShapeIndex : boolean)=>{
        const edgeResult = this.pencil.resizingEdge(shape.messageData as Pencil,this.InitialPointX,this.InitialPointY)

        if ( edgeResult.result && edgeResult.edge !==null) {
            this.setResizing(shape, edgeResult.edge)
        }
        else if (draggingShapeIndex) {
            this.setDragging(shape.messageData);
        }


    }


    handleRectangle = (shape : ShapesFromServer, draggingShapeIndex: boolean) => {
        const resizeEdge = this.rectangle.resizingEdge(shape.messageData as Rectangle,this.InitialPointX,this.InitialPointY);
        if (resizeEdge?.result && resizeEdge.edge !== null) {
            this.setResizing(shape, resizeEdge.edge);
        } else if (draggingShapeIndex) {
            this.setDragging(shape.messageData);
        }
    };

    handleCircle = (shape:ShapesFromServer, draggingShapeIndex: boolean) => {
        const edgeResult = this.circle.resizingEdge(shape.messageData as Circle,this.InitialPointX,this.InitialPointY)
        if (edgeResult.result && edgeResult.edge !==null) {
            this.setResizing(shape,edgeResult.edge) 
        } else if (draggingShapeIndex) {
            this.setDragging(shape.messageData);
        }
    };

    handleLine = (shape:ShapesFromServer, draggingShapeIndex: boolean) => {

        const onPoint = this.line.getOnWhichPoint(shape.messageData as Line,this.InitialPointX,this.InitialPointY)
        if (onPoint && shape.messageData.type == "line" ) {
            shape.messageData.Point = onPoint
            this.setResizing(shape);
        } else if (draggingShapeIndex && !onPoint) {
            this.setDragging(shape.messageData);
        }
    };

    

    setResizing = (shape: ShapesFromServer, resizingEdge: string = "") => {
        this.oldshape = JSON.parse(JSON.stringify(shape))
        shape.messageData.isResizing = true;
        shape.messageData.isDraging = false;
        this.isResizing = true
        this.isDraging = false;
        shape.messageData.resizingEdge = resizingEdge;

    };

    setDragging = (messageData: Shape) => {
        this.originalCordinates.x = messageData.x
        this.originalCordinates.y = messageData.y
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
            document.body.style.cursor = 'default'
            
            invoker.executeCommand(new SelectedCommand(this,this.SelectedIndex))
        }
    };

    addSelected(selectedIndex:number){
           
        
        this.existingShapes[selectedIndex].messageData.selected = true;
        this.SelectedIndex = selectedIndex
        this.reDrawShapes();
        
    }

    deselectShape (selectedIndex:number) {
        if (selectedIndex !== -1) {

            this.existingShapes.forEach(shape => shape.messageData.selected = false);
            this.SelectedIndex = -1
            this.isDraging = false
            this.isResizing = false
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

        if (Game.typeOfShapes == 'pencil') {
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
                    fontSize: 30,
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
                        fontSize: 30,
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

        switch (Game.typeOfShapes) {
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
    


    // undo redo
    addShape(shape:ShapesFromServer){
        this.existingShapes.push(shape)
        this.Socket.send(
            JSON.stringify({
                type: "created",
                roomId: "2",
                message:JSON.stringify(shape.messageData) 
            })
        )
        this.reDrawShapes()
    }

    removeShape(shape:ShapesFromServer){
        const findIndex = this.existingShapes.findIndex(element => element.id == shape.id)
        this.existingShapes.splice(findIndex,1)
        this.Socket.send(
            JSON.stringify({
                type: "delete",
                roomId: "2",
                id: shape.id,
            })
        )
        this.reDrawShapes()
    }


    ResizedShape(shape:ShapesFromServer,dimensions:Shape){
        Object.assign(shape.messageData,dimensions)
        this.reDrawShapes()
    }

    // cursor change
    getOnshape() {
        let result = this.existingShapes.some(shape =>{
            const result = this.utilsFunctions.getIfOnAnyShapesEdge(shape.messageData,this.MovingPointX,this.MovingPointY)
            return result

        }) 
        return result
    }


MouseMove = (e: MouseEvent) => {
    this.MovingPointX = e.clientX;
    this.MovingPointY = e.clientY;

    if (Game.typeOfShapes !== "default") {
        document.body.style.cursor = "crosshair";
        if (this.isDrawing && this.SelectedIndex == -1 && this.canvas && !this.isDraging) {
            if (Game.typeOfShapes === "pencil") {
                this.Points.push([this.MovingPointX, this.MovingPointY]);
            }
            this.reDrawShapes();
            this.Draw();
        }
    } else {
        if (!this.isEditing && this.SelectedIndex !== -1) {
            const shape = this.existingShapes[this.SelectedIndex].messageData;

            if (shape.isResizing && this.isResizing) {
                this.Resize();
                this.reDrawShapes();
            } else if (this.isDraging && shape.isDraging) {
                this.Drag();
                this.reDrawShapes();
            } else {

                console.log(shape)
                
                let edge = this.utilsFunctions.getOnWhichEdge(shape,this.MovingPointX,this.MovingPointY)
                console.log(edge)

                if (edge) {
                    switch(edge) {
                        case 'top':
                        case 'bottom':
                            document.body.style.cursor = "ns-resize";
                            break;
                        case 'left':
                        case 'right':
                            document.body.style.cursor = "ew-resize";
                            break;
                        case 'top-left':
                        case 'bottom-right':
                            document.body.style.cursor = "nwse-resize";
                            break;
                        case 'top-right':
                        case 'bottom-left':
                            document.body.style.cursor = "nesw-resize";
                            break;

                        case "startingPoint":
                        case "endingPoint":
                        case "midPoint":
                            document.body.style.cursor = 'pointer'
                            break
                        default:
                            document.body.style.cursor = "default";
                    }
                } else if (this.getDraggingShape(this.MovingPointX, this.MovingPointY)) {
                    document.body.style.cursor = "move";
                } else {
                    document.body.style.cursor = "default";
                }
            }
        } else {
            const isOnShape = this.getOnshape();
            document.body.style.cursor = isOnShape ? "move" : "default";
        }
    }
};



    MouseUp = (e: MouseEvent) => {

        if (this.isDrawing) {
            let shape : ShapesFromServer 

            switch (Game.typeOfShapes) {
                case "rectangle":
                    shape = {
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

                    }


                    break;
                case "circle":
                    const radiusX = Math.abs(this.MovingPointX - this.InitialPointX)
                    const radiusY = Math.abs(this.MovingPointY - this.InitialPointY)
                    shape = {
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

                    }


                    break;
                case "line":

                    const midX = (this.InitialPointX + this.MovingPointX) / 2
                    const midY = (this.InitialPointY + this.MovingPointY) / 2
                    shape = {
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

                    }


                    break;
                case "pencil":
                    shape = {
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

                    }

                    break;
                default :
                    return 

            }

            
            invoker.executeCommand(new DrawCommand(this,shape))
            this.isDrawing = false
            this.setTool('default')
            document.body.style.cursor = 'default'
            this.Points = []

        }

        if (this.SelectedIndex !== -1 && this.existingShapes[this.SelectedIndex].messageData.isResizing && !this.isDraging && this.oldshape !== null) {
            let shape = this.existingShapes[this.SelectedIndex]
            shape.messageData.isDraging = false
            shape.messageData.isResizing = false
            shape.messageData.resizingEdge = ''
            shape.messageData.selected = false
            if (shape.messageData.type == 'line') {
                shape.messageData.Point = ''
            }

            let old = { ...this.oldshape.messageData }
            let newshape = {...shape.messageData}
            
            invoker.setCommand(new ResizedCommand(this,shape,old,newshape)) 

            this.Socket.send(
                JSON.stringify({
                    type: "resized",
                    roomId: "2",
                    id: shape.id,
                    message: JSON.stringify(shape.messageData)
                })
            )

            shape.messageData.selected = true 

            shape.messageData.isResizing = false
            shape.messageData.resizingEdge = ""
            this.oldshape = null
            this.isResizing = false

        }

        if (this.SelectedIndex !== -1 && this.existingShapes[this.SelectedIndex].messageData.isDraging && this.isDraging ) {

            let shape = this.existingShapes[this.SelectedIndex]
            shape.messageData.isDraging = false
            shape.messageData.selected= false
            let dx = shape.messageData.x - this.originalCordinates.x 
            let dy = shape.messageData.y - this.originalCordinates.y 

            invoker.setCommand(new DraggedCommand(this,shape,dx,dy)) 

            this.Socket.send(
                JSON.stringify({
                    type: "draged",
                    roomId: "2",
                    id: shape.id,
                    message: JSON.stringify(shape.messageData)
                })
            )

            shape.messageData.selected= true 
            this.originalCordinates.x = 0
            this.originalCordinates.y = 0
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