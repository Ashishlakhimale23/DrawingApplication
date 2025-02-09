"use client"
import { MouseEvent, useEffect, useRef, useState } from "react"
import { drawing } from "@/draw/Drawing"

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
type TypeOfShapes = {
    type: "Rectangle" | "default"
}

export default function Canvas(){
    const canvasRef = useRef<HTMLCanvasElement | null>(null)
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null)
    const shapes = useRef<Shape[]>([{
        type:"Rectangle",
        x:100,
        y:110,
        width:210,
        height:220,
        selected:false,
        isResizing:false,
        resizingEdge:""

    }])
    const typeOfShapes = useRef<TypeOfShapes>({type:'default'})

    const [isDrawing,setIsDrawing] = useState(false)
    const InitialPoints = useRef<{x:number,y:number}>({x:0,y:0})
    const MovingPoinst = useRef<{x:number,y:number}>({x:0,y:0})
    const SelectedIndex = useRef<number>(-1)
   
    
    useEffect(()=>{
        const canvas = canvasRef.current;
        if(canvas){
            canvas.width = window.innerWidth
            canvas.height = window.innerHeight
            ctxRef.current = canvas.getContext("2d")
        }

        if(ctxRef.current){
        ctxRef.current.strokeStyle = 'black'
        ctxRef.current.lineWidth = 2 
        }

       shapes.current.map((element)=>{
        ctxRef.current?.strokeRect(element.x,element.y,element.width,element.height)
        })


    },[])

    

    const GetSelectedShape = (shape:Shape,mouseX:number,mouseY:number)=>{
    const tolerance = 10

    const minX = Math.min(shape.x, shape.x+shape.width);
    const maxX = Math.max(shape.x, shape.x+shape.width);
    const minY = Math.min(shape.y, shape.y+shape.height);
    const maxY = Math.max(shape.y, shape.y+shape.height);
    return (
      (Math.abs(mouseX - minX) <= tolerance && minY <= mouseY && mouseY <= maxY) ||
      (Math.abs(mouseY - minY) <= tolerance && minX <= mouseX && mouseX <= maxX) ||
      (Math.abs(mouseX - maxX) <= tolerance && minY <= mouseY && mouseY <= maxY) ||
      (Math.abs(mouseY - maxY) <= tolerance && minX <= mouseX && mouseX <= maxX) 
    );
    }


   

    function getResizeEdge(mouseX:number, mouseY:number,shape:Shape) {
      const { x,y,selected,width,height} = shape;
      const threshold = 10; 

      if(!selected){
        return null
      }


      if (Math.abs(mouseX - (x + width)) < threshold && Math.abs(mouseY - (y + height)) < threshold) {
        return 'bottom-right';
      }
      if (Math.abs(mouseX - x) < threshold && Math.abs(mouseY - y) < threshold) {
        return 'top-left';
      }
      if (Math.abs(mouseX - (x + width)) < threshold && Math.abs(mouseY - y) < threshold) {
        return 'top-right';
      }
      if (Math.abs(mouseX - x) < threshold && Math.abs(mouseY - (y + height)) < threshold) {
        return 'bottom-left';
      }

      if (Math.abs(mouseX - x) < threshold) {
        return 'left';
      }
      if (Math.abs(mouseX - (x + width)) < threshold) {
        return 'right';
      }
      if (Math.abs(mouseY - y) < threshold) {
        return 'top';
      }
      if (Math.abs(mouseY - (y + height)) < threshold) {
        return 'bottom';
      }

      return null; 
    }



    const Resize = (mouseX:number,mouseY:number) => {
         if (SelectedIndex.current === -1 || !shapes.current[SelectedIndex.current]) {
        return;
    }
         switch (shapes.current[SelectedIndex.current].resizingEdge) {
          case 'top-left':
            shapes.current[SelectedIndex.current].width += shapes.current[SelectedIndex.current].x - mouseX;
            shapes.current[SelectedIndex.current].height += shapes.current[SelectedIndex.current].y - mouseY;
            shapes.current[SelectedIndex.current].x = mouseX;
            shapes.current[SelectedIndex.current].y = mouseY;
            break;
          case 'top-right':
            shapes.current[SelectedIndex.current].width = mouseX - shapes.current[SelectedIndex.current].x;
            shapes.current[SelectedIndex.current].height += shapes.current[SelectedIndex.current].y - mouseY;
            shapes.current[SelectedIndex.current].y = mouseY;
            break;
          case 'bottom-left':
            shapes.current[SelectedIndex.current].width += shapes.current[SelectedIndex.current].x - mouseX;
            shapes.current[SelectedIndex.current].height = mouseY - shapes.current[SelectedIndex.current].y;
            shapes.current[SelectedIndex.current].x = mouseX;
            break;
          case 'bottom-right':
            shapes.current[SelectedIndex.current].width = mouseX - shapes.current[SelectedIndex.current].x;
            shapes.current[SelectedIndex.current].height = mouseY - shapes.current[SelectedIndex.current].y;
            break;
          case 'left':
            shapes.current[SelectedIndex.current].width += shapes.current[SelectedIndex.current].x - mouseX;
            shapes.current[SelectedIndex.current].x = mouseX;
            break;
          case 'right':
            shapes.current[SelectedIndex.current].width = mouseX - shapes.current[SelectedIndex.current].x;
            break;
          case 'top':
            shapes.current[SelectedIndex.current].height += shapes.current[SelectedIndex.current].y - mouseY;
            shapes.current[SelectedIndex.current].y = mouseY;
            break;
          case 'bottom':
            shapes.current[SelectedIndex.current].height = mouseY - shapes.current[SelectedIndex.current].y;
            break;
        }

        drawing(ctxRef,canvasRef,shapes,InitialPoints,MovingPoinst)
    }

    const MouseDown =(e:MouseEvent)=>{
       //change this logic 
        InitialPoints.current.x = e.clientX 
        InitialPoints.current.y = e.clientY 
        setIsDrawing(true)
        const selectedIndex = shapes.current.findIndex(shapes => GetSelectedShape(shapes,e.clientX,e.clientY))
        if(selectedIndex!==-1 ){

            SelectedIndex.current = selectedIndex
            shapes.current[selectedIndex].selected = true
        const edge =  getResizeEdge(e.clientX,e.clientY,shapes.current[SelectedIndex.current])
        if(edge){
            shapes.current[selectedIndex].isResizing = true
            shapes.current[selectedIndex].resizingEdge = edge
        }
            
        }
        
    }




    const MouseMove=(e:MouseEvent)=>{
        
        if(isDrawing && typeOfShapes.current.type=="Rectangle" && SelectedIndex.current == -1){
        MovingPoinst.current.x = e.clientX
        MovingPoinst.current.y = e.clientY
        drawing(ctxRef,canvasRef,shapes,InitialPoints,MovingPoinst)
        }else{

            Resize(e.clientX,e.clientY)

            
        }

    }

    const MouseUp=(e:MouseEvent)=>{
        shapes.current.push(            
            {
                x: InitialPoints.current.x,
                y: InitialPoints.current.y,
                width: MovingPoinst.current.x - InitialPoints.current.x ,
                height: MovingPoinst.current.y - InitialPoints.current.y,
                type: 'Rectangle',
                selected:false,
                isResizing:false,
                resizingEdge:""
            }
        )
        InitialPoints.current.x = 0,
        InitialPoints.current.y = 0,
        MovingPoinst.current.x = 0 ,       
        MovingPoinst.current.y =0         
        setIsDrawing(false)
    }




    return (
           <canvas
           ref={canvasRef}
           onMouseDown={MouseDown}
           onMouseMove={MouseMove}
           onMouseUp={MouseUp}
           ></canvas> 
    )

}