import { RefObject } from "react"
interface Shape {
    type : string ,  
    x : number,
    y : number,
    width :number,
    height:number,
    selected : boolean,
    isResizing:boolean,
    resizingEdge : string 
}

export function getResizeEdge(mouseX: number, mouseY: number, shape: Shape) {
    const { x, y, selected, width, height } = shape;
    const threshold = 10;

    if (!selected) {
      return null;
    }

    if (
      Math.abs(mouseX - (x + width)) < threshold &&
      Math.abs(mouseY - (y + height)) < threshold
    ) {
      return "bottom-right";
    }
    if (Math.abs(mouseX - x) < threshold && Math.abs(mouseY - y) < threshold) {
      return "top-left";
    }
    if (
      Math.abs(mouseX - (x + width)) < threshold &&
      Math.abs(mouseY - y) < threshold
    ) {
      return "top-right";
    }
    if (
      Math.abs(mouseX - x) < threshold &&
      Math.abs(mouseY - (y + height)) < threshold
    ) {
      return "bottom-left";
    }

    if (Math.abs(mouseX - x) < threshold) {
      return "left";
    }
    if (Math.abs(mouseX - (x + width)) < threshold) {
      return "right";
    }
    if (Math.abs(mouseY - y) < threshold) {
      return "top";
    }
    if (Math.abs(mouseY - (y + height)) < threshold) {
      return "bottom";
    }

    return null;
  }

export  const Resize = (mouseX: number, mouseY: number,ctxRef:RefObject<CanvasRenderingContext2D | null>,canvasRef:RefObject<HTMLCanvasElement | null>,SelectedIndex:RefObject<number>,shapes:RefObject<Shape[]>) => {
    if (!SelectedIndex ||
      SelectedIndex.current === -1 ||
      !shapes.current[SelectedIndex.current] || !canvasRef.current
    ) {
      return;
    }

    ctxRef.current?.clearRect(0,0,canvasRef.current?.width,canvasRef.current?.height)
    switch (shapes.current[SelectedIndex.current].resizingEdge) {
      case "top-left":
        shapes.current[SelectedIndex.current].width +=
          shapes.current[SelectedIndex.current].x - mouseX;
        shapes.current[SelectedIndex.current].height +=
          shapes.current[SelectedIndex.current].y - mouseY;
        shapes.current[SelectedIndex.current].x = mouseX;
        shapes.current[SelectedIndex.current].y = mouseY;
        break;
      case "top-right":
        shapes.current[SelectedIndex.current].width =
          mouseX - shapes.current[SelectedIndex.current].x;
        shapes.current[SelectedIndex.current].height +=
          shapes.current[SelectedIndex.current].y - mouseY;
        shapes.current[SelectedIndex.current].y = mouseY;
        break;
      case "bottom-left":
        shapes.current[SelectedIndex.current].width +=
          shapes.current[SelectedIndex.current].x - mouseX;
        shapes.current[SelectedIndex.current].height =
          mouseY - shapes.current[SelectedIndex.current].y;
        shapes.current[SelectedIndex.current].x = mouseX;
        break;
      case "bottom-right":
        shapes.current[SelectedIndex.current].width =
          mouseX - shapes.current[SelectedIndex.current].x;
        shapes.current[SelectedIndex.current].height =
          mouseY - shapes.current[SelectedIndex.current].y;
        break;
      case "left":
        shapes.current[SelectedIndex.current].width +=
          shapes.current[SelectedIndex.current].x - mouseX;
        shapes.current[SelectedIndex.current].x = mouseX;
        break;
      case "right":
        shapes.current[SelectedIndex.current].width =
          mouseX - shapes.current[SelectedIndex.current].x;
        break;
      case "top":
        shapes.current[SelectedIndex.current].height +=
          shapes.current[SelectedIndex.current].y - mouseY;
        shapes.current[SelectedIndex.current].y = mouseY;
        break;
      case "bottom":
        shapes.current[SelectedIndex.current].height =
          mouseY - shapes.current[SelectedIndex.current].y;
        break;
    }
    
  };

