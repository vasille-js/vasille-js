// @flow
export class Executor {
    constructor () {
    }

    addClass ( el : HTMLElement, cl : string ) {
        throw "Must be overwritten";
    }

    removeClass ( el : HTMLElement, cl : string ) {
        throw "Must be overwritten";
    }
    
    setAttribute ( el : HTMLElement, name : string, value : string ) {
        throw "Must be overwritten";
    }

    removeAttribute ( el : HTMLElement, name : string ) {
        throw "Must be overwritten";
    }

    setStyle ( el : HTMLElement, prop : string, value : string ) {
        throw "Must be overwritten";
    }
}

export class FastExecutor extends Executor {
    addClass ( el : HTMLElement, cl : string ) {
        if (el) {
            el.classList.add ( cl );
        }
    }

    removeClass ( el : HTMLElement, cl : string ) {
        if (el) {
            el.classList.remove ( cl );
        }
    }
}
