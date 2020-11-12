// @flow
export class Executor {
    constructor () {
    }

    addClass ( el : ?HTMLElement, cl : string ) {
        throw "Must be overwritten";
    }

    removeClass ( el : ?HTMLElement, cl : string ) {
        throw "Must be overwritten";
    }
}

export class FastExecutor extends Executor {
    addClass ( el : ?HTMLElement, cl : string ) {
        if (el) {
            el.classList.add ( cl );
        }
    }

    removeClass ( el : ?HTMLElement, cl : string ) {
        if (el) {
            el.classList.remove ( cl );
        }
    }
}
