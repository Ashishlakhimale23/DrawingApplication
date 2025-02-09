"use client";
import { MouseEvent, useEffect, useRef, useState } from "react";

interface Shape {
    type: string;
    x: number;
    y: number;
    width: number;
    height: number;
    selected: boolean;
    isResizing: boolean;
    resizingEdge: string;
}

type TypeOfShapes = {
    type: "Rectangle" | "default";
};

export default function Canvas() {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const shapes = useRef<Shape[]>([{
        type: "Rectangle",
        x: 100,
        y: 110,
        width: 210,
        height: 220,
        selected: false,
        isResizing: false,
        resizingEdge: ""
    }]);
    const typeOfShapes = useRef<TypeOfShapes>({ type: 'default' });

    const [isDrawing, setIsDrawing] = useState(false);
    const InitialPoints = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const MovingPoints = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
    const SelectedIndex = useRef<number>(-1);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (canvas) {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            ctxRef.current = canvas.getContext("2d");
        }

        if (ctxRef.current) {
            ctxRef.current.strokeStyle = 'black';
            ctxRef.current.lineWidth = 2;
        }

        redrawShapes();
    }, []);

    const redrawShapes = () => {
        const ctx = ctxRef.current;
        if (!ctx) return;

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        shapes.current.forEach(shape => {
            ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
            
        });
    };

    const drawSelectionHandles = (ctx: CanvasRenderingContext2D, shape: Shape) => {
        ctx.strokeStyle = 'blue';
        ctx.lineWidth = 2;
        ctx.strokeRect(shape.x - 5, shape.y - 5, shape.width + 10, shape.height + 10);
    };

    const GetSelectedShape = (shape: Shape, mouseX: number, mouseY: number) => {
        const tolerance = 10;
        const minX = Math.min(shape.x, shape.x + shape.width);
        const maxX = Math.max(shape.x, shape.x + shape.width);
        const minY = Math.min(shape.y, shape.y + shape.height);
        const maxY = Math.max(shape.y, shape.y + shape.height);
        return (
            (Math.abs(mouseX - minX) <= tolerance && minY <= mouseY && mouseY <= maxY) ||
            (Math.abs(mouseY - minY) <= tolerance && minX <= mouseX && mouseX <= maxX) ||
            (Math.abs(mouseX - maxX) <= tolerance && minY <= mouseY && mouseY <= maxY) ||
            (Math.abs(mouseY - maxY) <= tolerance && minX <= mouseX && mouseX <= maxX)
        );
    };

    const getResizeEdge = (mouseX: number, mouseY: number, shape: Shape) => {
        const { x, y, selected, width, height } = shape;
        const threshold = 10; 

        if (!selected) return null;

        if (Math.abs(mouseX - (x + width)) < threshold && Math.abs(mouseY - (y + height)) < threshold) return 'bottom-right';
        if (Math.abs(mouseX - x) < threshold && Math.abs(mouseY - y) < threshold) return 'top-left';
        if (Math.abs(mouseX - (x + width)) < threshold && Math.abs(mouseY - y) < threshold) return 'top-right';
        if (Math.abs(mouseX - x) < threshold && Math.abs(mouseY - (y + height)) < threshold) return 'bottom-left';

        if (Math.abs(mouseX - x) < threshold) return 'left';
        if (Math.abs(mouseX - (x + width)) < threshold) return 'right';
        if (Math.abs(mouseY - y) < threshold) return 'top';
        if (Math.abs(mouseY - (y + height)) < threshold) return 'bottom';

        return null; 
    };

    const Resize = (mouseX: number, mouseY: number) => {
        if (SelectedIndex.current === -1 || !shapes.current[SelectedIndex.current]) return;

        const shape = shapes.current[SelectedIndex.current];
        switch (shape.resizingEdge) {
          case 'top-left':
            shape.width += shape.x - mouseX;
            shape.height += shape.y - mouseY;
            shape.x = mouseX;
            shape.y = mouseY;
            break;
          case 'top-right':
            shape.width = mouseX - shape.x;
            shape.height += shape.y - mouseY;
            shape.y = mouseY;
            break;
          case 'bottom-left':
            shape.width += shape.x - mouseX;
            shape.height = mouseY - shape.y;
            shape.x = mouseX;
            break;
          case 'bottom-right':
            shape.width = mouseX - shape.x;
            shape.height = mouseY - shape.y;
            break;
          case 'left':
            shape.width += shape.x - mouseX;
            shape.x = mouseX;
            break;
          case 'right':
            shape.width = mouseX - shape.x;
            break;
          case 'top':
            shape.height += shape.y - mouseY;
            shape.y = mouseY;
            break;
          case 'bottom':
            shape.height = mouseY - shape.y;
            break;
        }

        redrawShapes()

    };

    const MouseDown = (e: MouseEvent) => {
        InitialPoints.current.x = e.clientX;
        InitialPoints.current.y = e.clientY;
        setIsDrawing(true);

        const selectedIndex = shapes.current.findIndex(shape => GetSelectedShape(shape, e.clientX, e.clientY));
        if (selectedIndex !== -1) {
            SelectedIndex.current = selectedIndex;
            shapes.current[selectedIndex].selected = true;
            const edge = getResizeEdge(e.clientX, e.clientY, shapes.current[selectedIndex]);
            if (edge) {
                shapes.current[selectedIndex].isResizing = true;
                shapes.current[selectedIndex].resizingEdge = edge;
            }
        }
    };

    const MouseMove = (e: MouseEvent) => {
        if (isDrawing && typeOfShapes.current.type === "Rectangle" && SelectedIndex.current === -1) {
            MovingPoints.current.x = e.clientX;
            MovingPoints.current.y = e.clientY;
            redrawShapes();
        } else if (SelectedIndex.current !== -1 && shapes.current[SelectedIndex.current].isResizing) {
            Resize(e.clientX, e.clientY);
        }
    };

    const MouseUp = (e: MouseEvent) => {
        if (typeOfShapes.current.type === "Rectangle" && SelectedIndex.current === -1) {
            shapes.current.push({
                x: InitialPoints.current.x,
                y: InitialPoints.current.y,
                width: MovingPoints.current.x - InitialPoints.current.x,
                height: MovingPoints.current.y - InitialPoints.current.y,
                type: 'Rectangle',
                selected: false,
                isResizing: false,
                resizingEdge: ""
            })

            
        }

       if(SelectedIndex.current!=-1){
                SelectedIndex.current = -1
            }

        InitialPoints.current.x = 0;
        InitialPoints.current.y = 0;
        MovingPoints.current.x = 0;
        MovingPoints.current.y = 0;
        setIsDrawing(false);
        redrawShapes();
    };

    return (
        <canvas
            ref={canvasRef}
            onMouseDown={MouseDown}
            onMouseMove={MouseMove}
            onMouseUp={MouseUp}
        ></canvas>
    );
}