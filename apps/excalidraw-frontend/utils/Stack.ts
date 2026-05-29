import { Command } from "@/utils/types";

export class Stack {

    private items :Command[]
    constructor() {
        this.items = [];
    }

    push(command : Command) {
        this.items.push(command);
    }

    pop = ():Command | null=>  {
        if (this.items.length === 0) {

            return null
        }
        const lastCommand = this.items.pop();
        return lastCommand !== undefined ? lastCommand : null;
    }

    isEmpty(){
        const result =  this.items.length == 0 ? true : false
        return result
    }

}