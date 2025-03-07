export interface BaseShape {
    id?: number
    type: string;
    x: number;
    y: number;
    selected: boolean;
    isResizing: boolean;
    resizingEdge: string;
    isDraging: boolean
}

export interface Text extends BaseShape {
    type: "text";
    content: string;
    fontSize: number;
    fontFamily: string;
}

export interface Rectangle extends BaseShape {
    type: "rectangle";
    width: number;
    height: number;
}

export interface Circle extends BaseShape {
    type: "circle";
    radiusX: number;
    radiusY : number
}

export interface Line extends BaseShape {
    type: "line";
    x1: number;
    y1: number;
    midX: number;
    midY: number
    Point: 'startingPoint' | "endingPoint" | "midPoint" | ""
}

export interface Pencil extends BaseShape {
    type: 'pencil';
    points: number[][]

}

export type Shape = Rectangle | Circle | Line | Pencil | Text;

export interface ShapesFromServer {
    id?: number,
    messageData: Shape
}


export type TypeOfShapes = "rectangle" | "default" | "circle" | "line" | "pencil" | "text"

export interface BaseShapeClass {
    draw : (shape: Shape, ctx: CanvasRenderingContext2D) => void , 
    drawSelectedShape : (shape:Shape, ctx: CanvasRenderingContext2D) => void,
    insideShape : (shape:Shape, actualPointX: number, actualPointY: number) => void ,
    resizingLogic : (shape: Shape, MovingPointX: number, MovingPointY: number) => void


}
export interface Command {
    execute : () => void,
    undo : () => void
}

