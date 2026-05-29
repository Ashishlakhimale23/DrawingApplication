import { Stack } from "./Stack"

interface Command {
    execute : () => void,
    undo : () => void
}

class Invoker{

    private undoStack : Stack 
    private redoStack : Stack
    private static Instance : Invoker 

    constructor(){
        this.undoStack = new Stack()
        this.redoStack = new Stack()
    }

    static getInstance(){
        if(Invoker.Instance){
            return Invoker.Instance 
        }
        Invoker.Instance = new Invoker()
        return Invoker.Instance
    }

    setCommand(Command:Command){
        this.undoStack.push(Command)
    }

    executeCommand(Command:Command){
        Command?.execute()
        this.undoStack.push(Command)
    }

    undo(){
        if(!this.undoStack.isEmpty()){
            const lastCommand = this.undoStack.pop()
            lastCommand?.undo()
            this.redoStack.push(lastCommand!)
        }
    }

    redo() {
        if (!this.redoStack.isEmpty()) {
            const lastCommand = this.redoStack.pop()
            lastCommand?.execute()
            this.undoStack.push(lastCommand!)
        }

    }

}

export const invoker = Invoker.getInstance()