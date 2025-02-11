interface BaseShape {
  type: string;
  x: number;
  y: number;
  selected: boolean;
  isResizing: boolean;
  resizingEdge: string;
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


type TypeOfShapes = "Rectangle" | "default" | "Circle"

export class Game {
    private canvas : HTMLCanvasElement;
    private ctx : CanvasRenderingContext2D;
    private existingShapes : Shape[];
    private isDrawing : boolean;
    private InitialPointX : number = 0;
    private InitialPointY : number = 0 ;
    private MovingPointX : number = 0;
    private MovingPointY : number = 0;
    private typeOfShapes : TypeOfShapes = 'Rectangle';
    private roomId : string;
    private SelectedIndex : number

    Socket:WebSocket;

    

    constructor(canvas:HTMLCanvasElement,roomId:string,Socket:WebSocket,existingShapes:Shape[]){
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d")!;
        this.roomId = roomId;
        this.Socket = Socket;
        this.existingShapes = [...existingShapes];
        this.isDrawing = false;
        this.SelectedIndex = -1
        this.init();
        this.onMessageFromSocket();
        this.initMouseHandlers()

    }


    
    init(){
        this.reDrawShapes();
    }
    
    reDrawShapes(){
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height)
        if (this.ctx && this.canvas)
            console.log(this.existingShapes)

            this.existingShapes.forEach((element) => {

                if (typeof element == 'string') {
                    let shape:Shape = JSON.parse(element)
                    if(shape.type == "rectangle"){
                        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height)
                    }
                }

                if (typeof element !== "string"){
                    if(element.type == "rectangle"){
                        this.ctx.strokeRect(element.x, element.y, element.width, element.height)
                    }
                }

            })
    }

    onMessageFromSocket(){
        this.Socket.onmessage = (event) => {
            const message = JSON.parse(event.data)
            this.existingShapes.push(message.message)
            this.reDrawShapes()
        }
    }

    setTool(tool:TypeOfShapes) {
        this.typeOfShapes = tool;
    }

    Draw(){
        if (this.ctx && this.canvas) {
            switch (this.typeOfShapes) {
                case "Rectangle":
                    this.ctx.strokeRect(this.InitialPointX, this.InitialPointY, this.MovingPointX - this.InitialPointX, this.MovingPointY - this.InitialPointY)
                default:
                    null
            }

        }

}



    Resize(){

        if (!this.SelectedIndex ||
            this.SelectedIndex === -1 ||
            !this.existingShapes[this.SelectedIndex] || !this.canvas
        ) {
            return;
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
        const shape = this.existingShapes[this.SelectedIndex];

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
        }
    }

    getResizeEdge() {
        let shape = this.existingShapes[this.SelectedIndex]
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

    GetSelectedShape = (shape:Shape) => {
        const tolerance = 10;
        switch(shape.type){
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

    MouseDown=(e:MouseEvent)=>{

        this.InitialPointX = e.clientX;
        this.InitialPointY = e.clientY;

        switch (this.typeOfShapes) {
            case "default":
                const selectedIndex = this.existingShapes.findIndex((shapes) =>
                    this.GetSelectedShape(shapes)
                );

                if (selectedIndex !== -1) {
                    this.SelectedIndex = selectedIndex;
                    this.existingShapes[selectedIndex].selected = true;
                    const edge = this.getResizeEdge()
                    if (edge) {
                        this.existingShapes[selectedIndex].isResizing = true;
                        this.existingShapes[selectedIndex].resizingEdge = edge;
                    }
                }

            case "Rectangle":
              
                this.isDrawing =true

            default:
                null
        }


    }


    MouseMove=(e:MouseEvent)=>{

        if (
            this.isDrawing &&
            this.typeOfShapes == "Rectangle" &&
            this.SelectedIndex == -1 && this.canvas
        ) {
            this.MovingPointX = e.clientX;
            this.MovingPointY = e.clientY;

            this.reDrawShapes();
            this.Draw();
        } else {
            this.Resize();
            this.reDrawShapes()
        }

    }

    MouseUp=(e:MouseEvent)=>{

        if (this.isDrawing && this.typeOfShapes == "Rectangle") {

            this.existingShapes.push({
                x: this.InitialPointX,
                y: this.InitialPointY,
                width: this.MovingPointX - this.InitialPointX,
                height: this.MovingPointY - this.InitialPointY,
                type: "rectangle",
                selected: false,
                isResizing: false,
                resizingEdge: "",
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
                        }
                    )
                })
            )



            this.isDrawing = false
        }

        if (this.SelectedIndex !== -1) {
            this.SelectedIndex = -1;
        }

        this.InitialPointX = 0,
        this.InitialPointY = 0,
        this.MovingPointX = 0
        this.MovingPointY = 0
    }

    initMouseHandlers(){
        
        this.canvas.addEventListener("mousedown",this.MouseDown)
        this.canvas.addEventListener("mousemove",this.MouseMove)
        this.canvas.addEventListener("mouseup",this.MouseUp)
    }


    destroy() {
        this.canvas.removeEventListener("mousedown", this.MouseDown)
        this.canvas.removeEventListener("mouseup", this.MouseUp)

        this.canvas.removeEventListener("mousemove", this.MouseMove)
    }


}