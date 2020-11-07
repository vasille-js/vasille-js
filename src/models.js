// @flow
import {IValue} from "./interfaces/ivalue";
import {Value} from "./value";

type VassileType = IValue | ArrayModel | ObjectModel | MapModel | SetModel;

export class ArrayModel extends Array<VassileType> {
    #onAdded   : Array<Function> = [];
    #onRemoved : Array<Function> = [];

    /* Constructor */

    constructor (data : Array<any> = []) {
        super();

        for (let i = 0; i < data.length; i++) {
            super.push(vassilify(data[i]));
        }
    }

    /* Array members */

    fill (value : any, start : ?number, end : ?number) : this {
        if (!start) start = 0;
        if (!end) end = this.length;

        for (let i = start; i < end; i++) {
            if (this[i] instanceof IValue) {
                this[i].set(value);
            }
        }
        return this;
    }

    pop () : VassileType {
        let v = super.pop();

        if (v) this.emitRemoved(this.length, v);
        return v;
    }

    push (...items : Array<any>) : number {
        for (let item of items) {
            let v = vassilify(item);

            this.emitAdded(this.length, v);
            super.push(v);
        }
        return this.length;
    }

    shift () : VassileType {
        let v = super.shift();

        if (v) this.emitRemoved(0, v);
        return v;
    }

    splice (start : number, deleteCount : ?number, ...items : ?Array<any>) : ArrayModel {
        start = Math.min(start, this.length);
        items = items ? items.map(v => vassilify(v)) : [];
        deleteCount = deleteCount || 0;

        for (let i = 0; i < deleteCount; i++) {
            if (this[start + i]) this.emitRemoved(start + i, this[start + i]);
        }
        for (let i = 0; i < items.length; i++) {
            this.emitAdded(start + i, items[i]);
        }

        return new ArrayModel(super.splice(start, deleteCount, ...items));
    }

    unshift (...items : Array<any>) : number {
        items = items.map(v => vassilify(v));

        for (let i = 0; i < items.length; i++) {
            this.emitAdded(i, items[i]);
        }
        return super.unshift(...items);
    }

    /* Vasile.js array interface */

    get last () : ?VassileType {
        return this.length ? this[this.length - 1] : null;
    }

    append (v : any) : this {
        v = vassilify(v);
        this.emitAdded(this.length, v);
        super.push(v);
        return this;
    }

    clear () : this {
        for (let v of this) {
            this.emitRemoved(0, v);
        }
        super.splice(0);
        return this;
    }

    insert (index : number, v : any) : this {
        v = vassilify(v);
        this.emitAdded(index, v);
        super.splice(index, 0, v);
        return this;
    }

    prepend (v : any) : this {
        v = vassilify(v);
        this.emitAdded(0, v);
        super.unshift(v);
        return this;
    }

    removeAt (index : number) : this {
        if (this[index]) {
            this.emitRemoved(index, this[index]);
            super.splice(index, 1);
        }
        return this;
    }

    removeFirst () : this {
        if (this.length) {
            this.emitRemoved(0, this[0]);
            super.shift();
        }
        return this;
    }

    removeLast () : this {
        if (this.last) {
            this.emitRemoved(this.length - 1, this.last);
            super.pop();
        }
        return this;
    }

    removeOne (v : IValue) : this {
        this.removeAt(this.indexOf(v));
        return this;
    }

    /* Signaling part */

    emitAdded (index : number, value : VassileType) {
        for (let handler of this.#onAdded) {
            handler(index, value);
        }
    }

    emitRemoved (index : number, value : VassileType) {
        for (let handler of this.#onRemoved) {
            handler(index, value);
        }
    }

    onAdd (handler : Function) {
        this.#onAdded.push(handler);
    }

    onRemove (handler : Function) {
        this.#onRemoved.push(handler);
    }

    offAdd (handler : Function) {
        let i = this.#onAdded.indexOf(handler);

        if (i >= 0) {
            this.#onAdded.splice(i, 1);
        }
    }

    offRemove (handler : Function) {
        let i = this.#onRemoved.indexOf(handler);

        if (i >= 0) {
            this.#onRemoved.splice(i, 1);
        }
    }
}

class ObjectModel extends Object {
    constructor(obj : Object = {}) {
        super();
    }

}

class MapModel extends Map<any, any> {
    constructor(map : Map<any, any>) {
        super();
    }
}

class SetModel extends Set<any> {
    constructor(set : Set<any>) {
        super();
    }
}

function vassilify (v : any) : IValue | ArrayModel | ObjectModel | MapModel | SetModel {
    let ret;

    switch (v) {
        case v instanceof IValue:
        case v instanceof ArrayModel:
        case v instanceof ObjectModel:
        case v instanceof MapModel:
        case v instanceof SetModel:
            ret = v;
            break;

        case Array.isArray(v):
            ret = new ArrayModel(v);
            break;

        case v instanceof Map:
            ret = new MapModel(v);
            break;

        case v instanceof Set:
            ret = new SetModel(v);
            break;
            
        case v instanceof Object && !Object.isExtensible(v):
            ret = new ObjectModel(v);
            break;

        default:
            ret = new Value(v);
    }

    return ret;
}
