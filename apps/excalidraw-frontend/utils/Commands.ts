import { Game } from "@/draw/Game"
import { Shape, ShapesFromServer } from "@/utils/types"
interface Command{
    execute : () => void
    undo : () => void
}

export class DrawCommand implements Command {
    private game : Game
    private shape : ShapesFromServer

    constructor(game : Game, shape : ShapesFromServer){
        this.game = game
        this.shape = shape
    }
    
    execute(){
        this.game.addShape(this.shape)
    }

    undo(){
        this.game.removeShape(this.shape)
    }
}

export class SelectedCommand implements Command{
    private game: Game
    private SelectedIndex:number

    constructor(game: Game,selectedIndex:number) {
        this.game = game
        this.SelectedIndex = selectedIndex
    }

    execute() {
        this.game.addSelected(this.SelectedIndex)
    }

    undo() {
        this.game.deselectShape(this.SelectedIndex)
    }

}


export class DraggedCommand implements Command{
    private game: Game
    private shape :ShapesFromServer
    private dx : number
    private dy : number


    constructor(game: Game , shape:ShapesFromServer ,dx :number,dy:number) {
        this.game = game
        this.shape = shape
        this.dx = dx
        this.dy = dy
    }


    execute() {
        this.game.DraggedShape(this.shape,this.dx,this.dy)
    }

    undo() {
      
        this.game.DraggedShape(this.shape,-this.dx,-this.dy)
    }

}

export class ResizedCommand implements Command{
    private game: Game
    private shape :ShapesFromServer
    private oldshape : Shape 
    private newshape : Shape

constructor(game: Game , shape:ShapesFromServer,oldshape:Shape,newShape:Shape) {
        this.game = game
        this.shape = shape
        this.oldshape = oldshape
        this.newshape= newShape
    }


    execute() {
        this.game.ResizedShape(this.shape,this.newshape)

    }

    undo() {
        this.game.ResizedShape(this.shape,this.oldshape)

    }

}