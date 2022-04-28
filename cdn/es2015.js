(function(){
// ./lib/v/index.js

const v = Object.assign(Object.assign({ ref(value) {
        return current.ref(value);
    }, expr: expr, of: valueOf, sv: setValue, alwaysFalse: new Reference(false), app,
    component,
    fragment,
    extension,
    text,
    tag,
    create }, vx), { merge,
    destructor() {
        return current.destroy.bind(current);
    },
    runOnDestroy(callback) {
        current.runOnDestroy(callback);
    } });

window.v = v;

// ./lib/models/model.js



// ./lib/models/listener.js
/**
 * Represent a listener for a model
 * @class Listener
 */
class Listener {
    constructor() {
        Object.defineProperties(this, {
            onAdded: {
                value: new Set,
                writable: false,
                configurable: false
            },
            onRemoved: {
                value: new Set,
                writable: false,
                configurable: false
            },
            frozen: {
                value: false,
                writable: true,
                configurable: false
            },
            queue: {
                value: [],
                writable: false,
                configurable: false
            }
        });
    }
    /**
     * Exclude the repeated operation in queue
     * @private
     */
    excludeRepeat(index) {
        this.queue.forEach((item, i) => {
            if (item.index === index) {
                this.queue.splice(i, 1);
                return true;
            }
        });
        return false;
    }
    /**
     * Emits added event to listeners
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    emitAdded(index, value) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: true, index, value });
            }
        }
        else {
            this.onAdded.forEach(handler => {
                handler(index, value);
            });
        }
    }
    /**
     * Emits removed event to listeners
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    emitRemoved(index, value) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: false, index, value });
            }
        }
        else {
            this.onRemoved.forEach(handler => {
                handler(index, value);
            });
        }
    }
    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    onAdd(handler) {
        this.onAdded.add(handler);
    }
    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    onRemove(handler) {
        this.onRemoved.add(handler);
    }
    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    offAdd(handler) {
        this.onAdded.delete(handler);
    }
    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    offRemove(handler) {
        this.onRemoved.delete(handler);
    }
    /**
     * Run all queued operation and enable reactivity
     */
    enableReactivity() {
        this.queue.forEach(item => {
            if (item.sign) {
                this.onAdded.forEach(handler => {
                    handler(item.index, item.value);
                });
            }
            else {
                this.onRemoved.forEach(handler => {
                    handler(item.index, item.value);
                });
            }
        });
        this.queue.splice(0);
        this.frozen = false;
    }
    /**
     * Disable the reactivity and enable the queue
     */
    disableReactivity() {
        this.frozen = true;
    }
}

window.Listener = Listener;

// ./lib/models/object-model.js
/**
 * Object based model
 * @extends Object
 */
class ObjectModel extends Object {
    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    constructor(obj = {}) {
        super();
        this.container = Object.create(null);
        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        for (const i in obj) {
            Object.defineProperty(this.container, i, {
                value: obj[i],
                configurable: true,
                writable: true,
                enumerable: true
            });
            this.listener.emitAdded(i, obj[i]);
        }
    }
    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    get(key) {
        return this.container[key];
    }
    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    set(key, v) {
        if (Reflect.has(this.container, key)) {
            this.listener.emitRemoved(key, this.container[key]);
            this.container[key] = v;
        }
        else {
            Object.defineProperty(this.container, key, {
                value: v,
                configurable: true,
                writable: true,
                enumerable: true
            });
        }
        this.listener.emitAdded(key, this.container[key]);
        return this;
    }
    /**
     * Deletes an object property
     * @param key {string} property name
     */
    delete(key) {
        if (this.container[key]) {
            this.listener.emitRemoved(key, this.container[key]);
            delete this.container[key];
        }
    }
    proxy() {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const ts = this;
        return new Proxy(this.container, {
            get(target, p) {
                return ts.get(p);
            },
            set(target, p, value) {
                ts.set(p, value);
                return true;
            },
            deleteProperty(target, p) {
                ts.delete(p);
                return true;
            }
        });
    }
    enableReactivity() {
        this.listener.enableReactivity();
    }
    disableReactivity() {
        this.listener.disableReactivity();
    }
}

window.ObjectModel = ObjectModel;

// ./lib/models/set-model.js
/**
 * A Set based model
 * @class SetModel
 * @extends Set
 * @implements IModel
 */
class SetModel extends Set {
    /**
     * Constructs a set model based on a set
     * @param set {Set} input data
     */
    constructor(set = []) {
        super();
        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        set.forEach(item => {
            super.add(item);
        });
    }
    /**
     * Calls Set.add and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    add(value) {
        if (!super.has(value)) {
            this.listener.emitAdded(value, value);
            super.add(value);
        }
        return this;
    }
    /**
     * Calls Set.clear and notify abut changes
     */
    clear() {
        this.forEach(item => {
            this.listener.emitRemoved(item, item);
        });
        super.clear();
    }
    /**
     * Calls Set.delete and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete(value) {
        if (super.has(value)) {
            this.listener.emitRemoved(value, value);
        }
        return super.delete(value);
    }
    enableReactivity() {
        this.listener.enableReactivity();
    }
    disableReactivity() {
        this.listener.disableReactivity();
    }
}

window.SetModel = SetModel;

// ./lib/models/map-model.js
/**
 * A Map based memory
 * @class MapModel
 * @extends Map
 * @implements IModel
 */
class MapModel extends Map {
    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     */
    constructor(map = []) {
        super();
        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        map.forEach(([key, value]) => {
            super.set(key, value);
        });
    }
    /**
     * Calls Map.clear and notify abut changes
     */
    clear() {
        this.forEach((value, key) => {
            this.listener.emitRemoved(key, value);
        });
        super.clear();
    }
    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    delete(key) {
        const tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        return super.delete(key);
    }
    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    set(key, value) {
        const tmp = super.get(key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        super.set(key, value);
        this.listener.emitAdded(key, value);
        return this;
    }
    enableReactivity() {
        this.listener.enableReactivity();
    }
    disableReactivity() {
        this.listener.disableReactivity();
    }
}

window.MapModel = MapModel;

// ./lib/models/array-model.js
/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
class ArrayModel extends Array {
    /**
     * @param data {Array} input data
     */
    constructor(data = []) {
        super();
        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        for (let i = 0; i < data.length; i++) {
            super.push(data[i]);
        }
    }
    // proxy
    proxy() {
        return new Proxy(this, {
            set(target, p, value) {
                target.splice(parseInt(p), 1, value);
                return true;
            }
        });
    }
    /* Array members */
    /**
     * Gets the last item of array
     * @return {*} the last item of array
     */
    get last() {
        return this.length ? this[this.length - 1] : null;
    }
    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    fill(value, start, end) {
        if (!start) {
            start = 0;
        }
        if (!end) {
            end = this.length;
        }
        for (let i = start; i < end; i++) {
            this.listener.emitRemoved(this[i], this[i]);
            this[i] = value;
            this.listener.emitAdded(value, value);
        }
        return this;
    }
    /**
     * Calls Array.pop and notify about changes
     * @return {*} removed value
     */
    pop() {
        const v = super.pop();
        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }
    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    push(...items) {
        items.forEach(item => {
            this.listener.emitAdded(item, item);
            super.push(item);
        });
        return this.length;
    }
    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    shift() {
        const v = super.shift();
        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    }
    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    splice(start, deleteCount, ...items) {
        start = Math.min(start, this.length);
        deleteCount = deleteCount || this.length - start;
        const before = this[start + deleteCount];
        for (let i = 0; i < deleteCount; i++) {
            const index = start + deleteCount - i - 1;
            if (this[index] !== undefined) {
                this.listener.emitRemoved(this[index], this[index]);
            }
        }
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(before, items[i]);
        }
        return new ArrayModel(super.splice(start, deleteCount, ...items));
    }
    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    unshift(...items) {
        for (let i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }
        return super.unshift(...items);
    }
    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     */
    append(v) {
        this.listener.emitAdded(null, v);
        super.push(v);
        return this;
    }
    /**
     * Clears array
     * @return {this} a pointer to this
     */
    clear() {
        this.forEach(v => {
            this.listener.emitRemoved(v, v);
        });
        super.splice(0);
        return this;
    }
    /**
     * Inserts a value to position `index`
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    insert(index, v) {
        this.listener.emitAdded(this[index], v);
        super.splice(index, 0, v);
        return this;
    }
    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    prepend(v) {
        this.listener.emitAdded(this[0], v);
        super.unshift(v);
        return this;
    }
    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    removeAt(index) {
        if (index > 0 && index < this.length) {
            this.listener.emitRemoved(this[index], this[index]);
            super.splice(index, 1);
        }
        return this;
    }
    /**
     * Removes the first value of array
     * @return {this} a pointer to this
     */
    removeFirst() {
        if (this.length) {
            this.listener.emitRemoved(this[0], this[0]);
            super.shift();
        }
        return this;
    }
    /**
     * Removes the ast value of array
     * @return {this} a pointer to this
     */
    removeLast() {
        const last = this.last;
        if (last != null) {
            this.listener.emitRemoved(this[this.length - 1], last);
            super.pop();
        }
        return this;
    }
    /**
     * Remove the first occurrence of value
     * @param v {*} value to remove
     * @return {this}
     */
    removeOne(v) {
        this.removeAt(this.indexOf(v));
        return this;
    }
    enableReactivity() {
        this.listener.enableReactivity();
    }
    disableReactivity() {
        this.listener.disableReactivity();
    }
}

window.ArrayModel = ArrayModel;

// ./lib/functional/merge.js
function merge(main, ...targets) {
    function refactorClass(obj) {
        if (Array.isArray(obj.class)) {
            const out = {
                $: []
            };
            obj.class.forEach(item => {
                if (item instanceof IValue) {
                    out.$.push(item);
                }
                else if (typeof item === 'string') {
                    out[item] = true;
                }
                else if (typeof item === 'object') {
                    Object.assign(out, item);
                }
            });
            obj.class = out;
        }
    }
    refactorClass(main);
    targets.forEach(target => {
        Reflect.ownKeys(target).forEach((prop) => {
            if (!Reflect.has(main, prop)) {
                main[prop] = target[prop];
            }
            else if (typeof main[prop] === 'object' && typeof target[prop] === 'object') {
                if (prop === 'class') {
                    refactorClass(target);
                }
                if (prop === '$' && Array.isArray(main[prop]) && Array.isArray(target[prop])) {
                    main.$.push(...target.$);
                }
                else {
                    merge(main[prop], target[prop]);
                }
            }
        });
    });
}

window.merge = merge;

// ./lib/functional/stack.js
function app(renderer) {
    return (node, opts) => {
        return new App(node, opts).runFunctional(renderer, opts);
    };
}
function component(renderer) {
    return (opts, callback) => {
        const component = new Component(opts);
        if (!(current instanceof Fragment))
            throw userError('missing parent node', 'out-of-context');
        let ret;
        if (callback)
            opts.slot = callback;
        current.create(component, node => {
            ret = node.runFunctional(renderer, opts);
        });
        return ret;
    };
}
function fragment(renderer) {
    return (opts, callback) => {
        const frag = new Fragment(opts);
        if (!(current instanceof Fragment))
            throw userError('missing parent node', 'out-of-context');
        if (callback)
            opts.slot = callback;
        current.create(frag);
        return frag.runFunctional(renderer, opts);
    };
}
function extension(renderer) {
    return (opts, callback) => {
        const ext = new Extension(opts);
        if (!(current instanceof Fragment))
            throw userError('missing parent node', 'out-of-context');
        if (callback)
            opts.slot = callback;
        current.create(ext);
        return ext.runFunctional(renderer, opts);
    };
}
function tag(name, opts, callback) {
    if (!(current instanceof Fragment))
        throw userError('missing parent node', 'out-of-context');
    return {
        node: current.tag(name, opts, (node) => {
            callback && node.runFunctional(callback);
        })
    };
}
function create(node, callback) {
    if (!(current instanceof Fragment))
        throw userError('missing current node', 'out-of-context');
    current.create(node, (node, ...args) => {
        callback && node.runFunctional(callback, ...args);
    });
    return node;
}
const vx = {
    if(condition, callback) {
        if (current instanceof Fragment) {
            current.if(condition, node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.if` function", "logic-error");
        }
    },
    else(callback) {
        if (current instanceof Fragment) {
            current.else(node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.else` function", "logic-error");
        }
    },
    elif(condition, callback) {
        if (current instanceof Fragment) {
            current.elif(condition, node => node.runFunctional(callback));
        }
        else {
            throw userError("wrong use of `v.elif` function", "logic-error");
        }
    },
    for(model, callback) {
        if (model instanceof ArrayModel) {
            // for arrays T & K are the same type
            create(new ArrayView({ model }), callback);
        }
        else if (model instanceof MapModel) {
            create(new MapView({ model }), callback);
        }
        else if (model instanceof SetModel) {
            // for sets T & K are the same type
            create(new SetView({ model }), callback);
        }
        else if (model instanceof ObjectModel) {
            // for objects K is always string
            create(new ObjectView({ model }), callback);
        }
        else {
            throw userError("wrong use of `v.for` function", 'wrong-model');
        }
    },
    watch(model, callback) {
        const opts = { model };
        create(new Watch(opts), callback);
    },
    nextTick(callback) {
        const node = current;
        window.setTimeout(() => {
            node.runFunctional(callback);
        }, 0);
    }
};

window.app = app;
window.component = component;
window.fragment = fragment;
window.extension = extension;
window.tag = tag;
window.create = create;
window.vx = vx;

// ./lib/functional/models.js
function arrayModel(arr = []) {
    if (!current)
        throw userError('missing parent node', 'out-of-context');
    return current.register(new ArrayModel(arr)).proxy();
}
function mapModel(map = []) {
    if (!current)
        throw userError('missing parent node', 'out-of-context');
    return current.register(new MapModel(map));
}
function setModel(arr = []) {
    if (!current)
        throw userError('missing parent node', 'out-of-context');
    return current.register(new SetModel(arr));
}
function objectModel(obj = {}) {
    if (!current)
        throw userError('missing parent node', 'out-of-context');
    return current.register(new ObjectModel(obj));
}

window.arrayModel = arrayModel;
window.mapModel = mapModel;
window.setModel = setModel;
window.objectModel = objectModel;

// ./lib/functional/options.js



// ./lib/functional/reactivity.js
function ref(value) {
    const ref = current.ref(value);
    return [ref, (value) => ref.$ = value];
}
function mirror(value) {
    return current.mirror(value);
}
function forward(value) {
    return current.forward(value);
}
function point(value) {
    return current.point(value);
}
function expr(func, ...values) {
    return current.expr(func, ...values);
}
function watch(func, ...values) {
    current.watch(func, ...values);
}
function valueOf(value) {
    return value.$;
}
function setValue(ref, value) {
    if (ref instanceof Pointer && value instanceof IValue) {
        ref.point(value);
    }
    else {
        ref.$ = value instanceof IValue ? value.$ : value;
    }
}

window.ref = ref;
window.mirror = mirror;
window.forward = forward;
window.point = point;
window.expr = expr;
window.watch = watch;
window.valueOf = valueOf;
window.setValue = setValue;

// ./lib/functional/components.js
function text(text) {
    if (!(current instanceof Fragment))
        throw userError('missing parent node', 'out-of-context');
    ;
    current.text(text);
}
function debug(text) {
    if (!(current instanceof Fragment))
        throw userError('missing parent node', 'out-of-context');
    current.debug(text);
}
function predefine(slot, predefined) {
    return slot || predefined;
}

window.text = text;
window.debug = debug;
window.predefine = predefine;

// ./lib/core/signal.js
/**
 * Signal is an event generator
 * @class Signal
 */
class Signal {
    constructor() {
        /**
         * Handler of event
         * @type {Set}
         * @private
         */
        this.handlers = new Set;
    }
    /**
     * Emit event
     * @param a1 {*} argument
     * @param a2 {*} argument
     * @param a3 {*} argument
     * @param a4 {*} argument
     * @param a5 {*} argument
     * @param a6 {*} argument
     * @param a7 {*} argument
     * @param a8 {*} argument
     * @param a9 {*} argument
     */
    emit(a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        this.handlers.forEach(handler => {
            try {
                handler(a1, a2, a3, a4, a5, a6, a7, a8, a9);
            }
            catch (e) {
                console.error(`Vasille.js: Handler throw exception: `, e);
            }
        });
    }
    /**
     * Subscribe to event
     * @param func {function} handler
     */
    subscribe(func) {
        this.handlers.add(func);
    }
    /**
     * Unsubscribe from event
     * @param func {function} handler
     */
    unsubscribe(func) {
        this.handlers.delete(func);
    }
}

window.Signal = Signal;

// ./lib/core/slot.js
/**
 * Component slot
 * @class Slot
 */
class Slot {
    /**
     * Sets the runner
     * @param func {function} the function to run
     */
    insert(func) {
        this.runner = func;
    }
    /**
     * @param a0 {Fragment} node to paste content
     * @param a1 {*} 1st argument
     * @param a2 {*} 2nd argument
     * @param a3 {*} 3rd argument
     * @param a4 {*} 4th argument
     * @param a5 {*} 5th argument
     * @param a6 {*} 6th argument
     * @param a7 {*} 7th argument
     * @param a8 {*} 8th argument
     * @param a9 {*} 9th argument
     */
    release(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        if (this.runner) {
            this.runner(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        }
    }
    /**
     * Predefine a handler for a slot
     * @param func {function(node : Fragment)} Function to run if no handler specified
     * @param a0 {Fragment} node to paste content
     * @param a1 {*} 1st argument
     * @param a2 {*} 2nd argument
     * @param a3 {*} 3rd argument
     * @param a4 {*} 4th argument
     * @param a5 {*} 5th argument
     * @param a6 {*} 6th argument
     * @param a7 {*} 7th argument
     * @param a8 {*} 8th argument
     * @param a9 {*} 9th argument
     */
    predefine(func, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        (this.runner || func)(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    }
}

window.Slot = Slot;

// ./lib/core/errors.js
const reportIt = "Report it here: https://gitlab.com/vasille-js/vasille-js/-/issues";
function notOverwritten() {
    console.error("Vasille-SFP: Internal error", "Must be overwritten", reportIt);
    return "not-overwritten";
}
function internalError(msg) {
    console.error("Vasille-SFP: Internal error", msg, reportIt);
    return "internal-error";
}
function userError(msg, err) {
    console.error("Vasille-SFP: User error", msg);
    return err;
}
function wrongBinding(msg) {
    return userError(msg, "wrong-binding");
}

window.notOverwritten = notOverwritten;
window.internalError = internalError;
window.userError = userError;
window.wrongBinding = wrongBinding;

// ./lib/core/executor.js
/**
 * Represents an executor unit interface
 * @class Executor
 */
class Executor {
    /**
     * Adds a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be added
     */
    addClass(el, cl) {
        throw notOverwritten();
    }
    /**
     * Removes a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be removed
     */
    removeClass(el, cl) {
        throw notOverwritten();
    }
    /**
     * Sets a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     * @param value {string} value of attribute
     */
    setAttribute(el, name, value) {
        throw notOverwritten();
    }
    /**
     * Removes a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     */
    removeAttribute(el, name) {
        throw notOverwritten();
    }
    /**
     * Sets a style attribute
     * @param el {HTMLElement} element to manipulate
     * @param prop {string} property name
     * @param value {string} property value
     */
    setStyle(el, prop, value) {
        throw notOverwritten();
    }
    /**
     * Inserts a child before target
     * @param target {Element} target element
     * @param child {Node} element to insert before
     */
    insertBefore(target, child) {
        throw notOverwritten();
    }
    /**
     * Appends a child to element
     * @param el {Element} element
     * @param child {Node} child to be inserted
     */
    appendChild(el, child) {
        throw notOverwritten();
    }
    /**
     * Calls a call-back function
     * @param cb {function} call-back function
     */
    callCallback(cb) {
        throw notOverwritten();
    }
}
/**
 * Executor which execute any commands immediately
 * @class InstantExecutor
 * @extends Executor
 */
class InstantExecutor extends Executor {
    addClass(el, cl) {
        el.classList.add(cl);
    }
    removeClass(el, cl) {
        el.classList.remove(cl);
    }
    setAttribute(el, name, value) {
        el.setAttribute(name, value);
    }
    removeAttribute(el, name) {
        el.removeAttribute(name);
    }
    setStyle(el, prop, value) {
        el.style.setProperty(prop, value);
    }
    insertBefore(target, child) {
        const parent = target.parentNode;
        if (!parent) {
            throw internalError('element don\'t have a parent node');
        }
        parent.insertBefore(child, target);
    }
    appendChild(el, child) {
        el.appendChild(child);
    }
    callCallback(cb) {
        cb();
    }
}
/**
 * Executor which execute any commands over timeout
 * @class TimeoutExecutor
 * @extends InstantExecutor
 */
class TimeoutExecutor extends InstantExecutor {
    addClass(el, cl) {
        setTimeout(() => {
            super.addClass(el, cl);
        }, 0);
    }
    removeClass(el, cl) {
        setTimeout(() => {
            super.removeClass(el, cl);
        }, 0);
    }
    setAttribute(el, name, value) {
        setTimeout(() => {
            super.setAttribute(el, name, value);
        }, 0);
    }
    removeAttribute(el, name) {
        setTimeout(() => {
            super.removeAttribute(el, name);
        }, 0);
    }
    setStyle(el, prop, value) {
        setTimeout(() => {
            super.setStyle(el, prop, value);
        }, 0);
    }
    insertBefore(target, child) {
        setTimeout(() => {
            super.insertBefore(target, child);
        }, 0);
    }
    appendChild(el, child) {
        setTimeout(() => {
            super.appendChild(el, child);
        }, 0);
    }
    callCallback(cb) {
        setTimeout(cb, 0);
    }
}
const instantExecutor = new InstantExecutor();
const timeoutExecutor = new TimeoutExecutor();

window.Executor = Executor;
window.InstantExecutor = InstantExecutor;
window.TimeoutExecutor = TimeoutExecutor;
window.instantExecutor = instantExecutor;
window.timeoutExecutor = timeoutExecutor;

// ./lib/core/destroyable.js
/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
class Destroyable {
    /**
     * Make object fields non configurable
     * @protected
     */
    seal() {
        const $ = this;
        Object.keys($).forEach(i => {
            // eslint-disable-next-line no-prototype-builtins
            if (this.hasOwnProperty(i)) {
                const config = Object.getOwnPropertyDescriptor($, i);
                if (config.configurable) {
                    let descriptor;
                    if (config.set || config.get) {
                        descriptor = {
                            configurable: false,
                            get: config.get,
                            set: config.set,
                            enumerable: config.enumerable
                        };
                    }
                    else {
                        descriptor = {
                            value: $[i],
                            configurable: false,
                            writable: config.writable,
                            enumerable: config.enumerable
                        };
                    }
                    Object.defineProperty($, i, descriptor);
                }
            }
        });
    }
    /**
     * Garbage collector method
     */
    destroy() {
        // nothing here
    }
}

window.Destroyable = Destroyable;

// ./lib/core/ivalue.js
class Switchable extends Destroyable {
    /**
     * Enable update handlers triggering
     */
    enable() {
        throw notOverwritten();
    }
    /**
     * disable update handlers triggering
     */
    disable() {
        throw notOverwritten();
    }
}
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
class IValue extends Switchable {
    /**
     * @param isEnabled {boolean} initial is enabled state
     */
    constructor(isEnabled) {
        super();
        this.isEnabled = isEnabled;
    }
    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    get $() {
        throw notOverwritten();
    }
    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    set $(value) {
        throw notOverwritten();
    }
    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    on(handler) {
        throw notOverwritten();
    }
    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    off(handler) {
        throw notOverwritten();
    }
}

window.Switchable = Switchable;
window.IValue = IValue;

// ./lib/index.js



// ./lib/spec/svg.js



// ./lib/spec/react.js



// ./lib/spec/html.js



// ./lib/value/expression.js
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
class Expression extends IValue {
    /**
     * Creates a function bounded to N values
     * @param func {Function} the function to bound
     * @param values
     * @param link {Boolean} links immediately if true
     */
    constructor(func, link, ...values) {
        super(false);
        /**
         * Expression will link different handler for each value of list
         */
        this.linkedFunc = [];
        const handler = (i) => {
            if (i != null) {
                this.valuesCache[i] = this.values[i].$;
            }
            this.sync.$ = func.apply(this, this.valuesCache);
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.valuesCache = values.map(item => item.$);
        this.sync = new Reference(func.apply(this, this.valuesCache));
        let i = 0;
        values.forEach(() => {
            this.linkedFunc.push(handler.bind(this, Number(i++)));
        });
        this.values = values;
        this.func = handler;
        if (link) {
            this.enable();
        }
        else {
            handler();
        }
        this.seal();
    }
    get $() {
        return this.sync.$;
    }
    set $(value) {
        this.sync.$ = value;
    }
    on(handler) {
        this.sync.on(handler);
        return this;
    }
    off(handler) {
        this.sync.off(handler);
        return this;
    }
    enable() {
        if (!this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].on(this.linkedFunc[i]);
                this.valuesCache[i] = this.values[i].$;
            }
            this.func();
            this.isEnabled = true;
        }
        return this;
    }
    disable() {
        if (this.isEnabled) {
            for (let i = 0; i < this.values.length; i++) {
                this.values[i].off(this.linkedFunc[i]);
            }
            this.isEnabled = false;
        }
        return this;
    }
    destroy() {
        this.disable();
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
        super.destroy();
    }
}

window.Expression = Expression;

// ./lib/value/reference.js
/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
class Reference extends IValue {
    /**
     * @param value {any} the initial value
     */
    constructor(value) {
        super(true);
        this.value = value;
        this.onchange = new Set;
        this.seal();
    }
    get $() {
        return this.value;
    }
    set $(value) {
        if (this.value !== value) {
            this.value = value;
            if (this.isEnabled) {
                this.onchange.forEach(handler => {
                    handler(value);
                });
            }
        }
    }
    enable() {
        if (!this.isEnabled) {
            this.onchange.forEach(handler => {
                handler(this.value);
            });
            this.isEnabled = true;
        }
    }
    disable() {
        this.isEnabled = false;
    }
    on(handler) {
        this.onchange.add(handler);
    }
    off(handler) {
        this.onchange.delete(handler);
    }
    destroy() {
        super.destroy();
        this.onchange.clear();
    }
}

window.Reference = Reference;

// ./lib/value/mirror.js
/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
class Mirror extends Reference {
    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    constructor(value, forwardOnly = false) {
        super(value.$);
        this.handler = (v) => {
            this.$ = v;
        };
        this.pointedValue = value;
        this.forwardOnly = forwardOnly;
        value.on(this.handler);
        this.seal();
    }
    get $() {
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        return super.$;
    }
    set $(v) {
        if (!this.forwardOnly) {
            this.pointedValue.$ = v;
        }
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        super.$ = v;
    }
    enable() {
        if (!this.isEnabled) {
            this.isEnabled = true;
            this.pointedValue.on(this.handler);
            this.$ = this.pointedValue.$;
        }
    }
    disable() {
        if (this.isEnabled) {
            this.pointedValue.off(this.handler);
            this.isEnabled = false;
        }
    }
    destroy() {
        this.disable();
        super.destroy();
    }
}

window.Mirror = Mirror;

// ./lib/value/pointer.js
/**
 * r/w pointer to a value
 * @class Pointer
 * @extends Mirror
 */
class Pointer extends Mirror {
    /**
     * @param value {IValue} value to point
     * @param forwardOnly {boolean} forward only data flow
     */
    constructor(value, forwardOnly = false) {
        super(value, forwardOnly);
    }
    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    point(value) {
        if (this.pointedValue !== value) {
            this.disable();
            this.pointedValue = value;
            this.enable();
        }
    }
}

window.Pointer = Pointer;

// ./lib/binding/binding.js
/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
class Binding extends Destroyable {
    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    constructor(value) {
        super();
        this.binding = value;
        this.seal();
    }
    init(bounded) {
        this.func = bounded;
        this.binding.on(this.func);
        this.func(this.binding.$);
    }
    /**
     * Just clear bindings
     */
    destroy() {
        this.binding.off(this.func);
        super.destroy();
    }
}

window.Binding = Binding;

// ./lib/core/core.js

const currentStack = [];
function stack(node) {
    currentStack.push(current);
    current = node;
}
function unstack() {
    current = currentStack.pop();
}
/**
 * Private stuff of a reactive object
 * @class ReactivePrivate
 * @extends Destroyable
 */
class ReactivePrivate extends Destroyable {
    constructor() {
        super();
        /**
         * A list of user-defined values
         * @type {Set}
         */
        this.watch = new Set;
        /**
         * A list of user-defined bindings
         * @type {Set}
         */
        this.bindings = new Set;
        /**
         * A list of user defined models
         */
        this.models = new Set;
        /**
         * Reactivity switch state
         * @type {boolean}
         */
        this.enabled = true;
        /**
         * The frozen state of object
         * @type {boolean}
         */
        this.frozen = false;
        this.seal();
    }
    destroy() {
        this.watch.forEach(value => value.destroy());
        this.watch.clear();
        this.bindings.forEach(binding => binding.destroy());
        this.bindings.clear();
        this.models.forEach(model => model.disableReactivity());
        this.models.clear();
        this.freezeExpr && this.freezeExpr.destroy();
        this.onDestroy && this.onDestroy();
        super.destroy();
    }
}
/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
class Reactive extends Destroyable {
    constructor(input, $) {
        super();
        this.input = input;
        this.$ = $ || new ReactivePrivate;
        this.seal();
    }
    /**
     * Get parent node
     */
    get parent() {
        return this.$.parent;
    }
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    ref(value) {
        const $ = this.$;
        const ref = new Reference(value);
        $.watch.add(ref);
        return ref;
    }
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     */
    mirror(value) {
        const mirror = new Mirror(value, false);
        this.$.watch.add(mirror);
        return mirror;
    }
    /**
     * Create a forward-only mirror
     * @param value {IValue} value to mirror
     */
    forward(value) {
        const mirror = new Mirror(value, true);
        this.$.watch.add(mirror);
        return mirror;
    }
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    point(value, forwardOnly = false) {
        const $ = this.$;
        const pointer = new Pointer(value, forwardOnly);
        $.watch.add(pointer);
        return pointer;
    }
    /**
     * Register a model
     * @param model
     */
    register(model) {
        this.$.models.add(model);
        return model;
    }
    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param values
     */
    watch(func, ...values) {
        const $ = this.$;
        $.watch.add(new Expression(func, !this.$.frozen, ...values));
    }
    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @return {IValue} the created ivalue
     */
    expr(func, ...values) {
        const res = new Expression(func, !this.$.frozen, ...values);
        const $ = this.$;
        $.watch.add(res);
        return res;
    }
    /**
     * Enable reactivity of fields
     */
    enable() {
        const $ = this.$;
        if (!$.enabled) {
            $.watch.forEach(watcher => {
                watcher.enable();
            });
            $.models.forEach(model => {
                model.enableReactivity();
            });
            $.enabled = true;
        }
    }
    /**
     * Disable reactivity of fields
     */
    disable() {
        const $ = this.$;
        if ($.enabled) {
            $.watch.forEach(watcher => {
                watcher.disable();
            });
            $.models.forEach(model => {
                model.disableReactivity();
            });
            $.enabled = false;
        }
    }
    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    bindAlive(cond, onOff, onOn) {
        const $ = this.$;
        if ($.freezeExpr) {
            throw wrongBinding("this component already have a freeze state");
        }
        if ($.watch.has(cond)) {
            throw wrongBinding("freeze state must be bound to an external component");
        }
        $.freezeExpr = new Expression((cond) => {
            $.frozen = !cond;
            if (cond) {
                onOn === null || onOn === void 0 ? void 0 : onOn();
                this.enable();
            }
            else {
                onOff === null || onOff === void 0 ? void 0 : onOff();
                this.disable();
            }
        }, true, cond);
        return this;
    }
    init() {
        this.applyOptions(this.input);
        this.compose(this.input);
    }
    applyOptions(input) {
        // empty
    }
    compose(input) {
        // empty
    }
    runFunctional(f, ...args) {
        stack(this);
        // yet another ts bug
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const result = f(...args);
        unstack();
        return result;
    }
    runOnDestroy(func) {
        this.$.onDestroy = func;
    }
    destroy() {
        super.destroy();
        this.$.destroy();
        this.$ = null;
    }
}

window.ReactivePrivate = ReactivePrivate;
window.Reactive = Reactive;

// ./lib/node/node.js
/**
 * Represents a Vasille.js node
 * @class FragmentPrivate
 * @extends ReactivePrivate
 */
class FragmentPrivate extends ReactivePrivate {
    constructor() {
        super();
        this.seal();
    }
    /**
     * Pre-initializes the base of a fragment
     * @param app {App} the app node
     * @param parent {Fragment} the parent node
     */
    preinit(app, parent) {
        this.app = app;
        this.parent = parent;
    }
    /**
     * Unlinks all bindings
     */
    destroy() {
        this.next = null;
        this.prev = null;
        super.destroy();
    }
}
/**
 * This class is symbolic
 * @extends Reactive
 */
class Fragment extends Reactive {
    /**
     * Constructs a Vasille Node
     * @param input
     * @param $ {FragmentPrivate}
     */
    constructor(input, $) {
        super(input, $ || new FragmentPrivate);
        /**
         * The children list
         * @type Array
         */
        this.children = new Set;
        this.lastChild = null;
    }
    /**
     * Gets the app of node
     */
    get app() {
        return this.$.app;
    }
    /**
     * Prepare to init fragment
     * @param app {AppNode} app of node
     * @param parent {Fragment} parent of node
     * @param data {*} additional data
     */
    preinit(app, parent, data) {
        const $ = this.$;
        $.preinit(app, parent);
    }
    compose(input) {
        super.compose(input);
        input.slot && input.slot(this);
    }
    /** To be overloaded: ready event handler */
    ready() {
        // empty
    }
    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    pushNode(node) {
        if (this.lastChild) {
            this.lastChild.$.next = node;
        }
        node.$.prev = this.lastChild;
        this.lastChild = node;
        this.children.add(node);
    }
    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    findFirstChild() {
        let first;
        this.children.forEach(child => {
            first = first || child.findFirstChild();
        });
        return first;
    }
    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    appendNode(node) {
        const $ = this.$;
        if ($.next) {
            $.next.insertAdjacent(node);
        }
        else {
            $.parent.appendNode(node);
        }
    }
    /**
     * Insert a node as a sibling of this
     * @param node {Node} node to insert
     */
    insertAdjacent(node) {
        const child = this.findFirstChild();
        const $ = this.$;
        if (child) {
            child.parentElement.insertBefore(node, child);
        }
        else if ($.next) {
            $.next.insertAdjacent(node);
        }
        else {
            $.parent.appendNode(node);
        }
    }
    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    text(text, cb) {
        const $ = this.$;
        const node = new TextNode();
        node.preinit($.app, this, text);
        this.pushNode(node);
        cb && cb(node);
    }
    debug(text) {
        if (this.$.app.debugUi) {
            const node = new DebugNode();
            node.preinit(this.$.app, this, text);
            this.pushNode(node);
        }
    }
    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    tag(tagName, input, cb) {
        const $ = this.$;
        const node = new Tag(input);
        input.slot = cb || input.slot;
        node.preinit($.app, this, tagName);
        node.init();
        this.pushNode(node);
        node.ready();
        return node.node;
    }
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    create(node, callback) {
        const $ = this.$;
        node.$.parent = this;
        node.preinit($.app, this);
        node.input.slot = callback || node.input.slot;
        this.pushNode(node);
        node.init();
        node.ready();
    }
    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    if(cond, cb) {
        const node = new SwitchedNode();
        node.preinit(this.$.app, this);
        node.init();
        this.pushNode(node);
        node.addCase(this.case(cond, cb));
        node.ready();
    }
    else(cb) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.default(cb));
        }
        else {
            throw userError('wrong `else` function use', 'logic-error');
        }
    }
    elif(cond, cb) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.case(cond, cb));
        }
        else {
            throw userError('wrong `elif` function use', 'logic-error');
        }
    }
    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    case(cond, cb) {
        return { cond, cb };
    }
    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    default(cb) {
        return { cond: trueIValue, cb };
    }
    insertBefore(node) {
        const $ = this.$;
        node.$.prev = $.prev;
        node.$.next = this;
        if ($.prev) {
            $.prev.$.next = node;
        }
        $.prev = node;
    }
    insertAfter(node) {
        const $ = this.$;
        node.$.prev = this;
        node.$.next = $.next;
        $.next = node;
    }
    remove() {
        const $ = this.$;
        if ($.next) {
            $.next.$.prev = $.prev;
        }
        if ($.prev) {
            $.prev.$.next = $.next;
        }
    }
    destroy() {
        this.children.forEach(child => child.destroy());
        this.children.clear();
        this.lastChild = null;
        if (this.$.parent.lastChild === this) {
            this.$.parent.lastChild = this.$.prev;
        }
        super.destroy();
    }
}
const trueIValue = new Reference(true);
/**
 * The private part of a text node
 * @class TextNodePrivate
 * @extends FragmentPrivate
 */
class TextNodePrivate extends FragmentPrivate {
    constructor() {
        super();
        this.seal();
    }
    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param parent
     * @param text {IValue}
     */
    preinitText(app, parent, text) {
        super.preinit(app, parent);
        this.node = document.createTextNode(text instanceof IValue ? text.$ : text);
        if (text instanceof IValue) {
            this.bindings.add(new Expression((v) => {
                this.node.replaceData(0, -1, v);
            }, true, text));
        }
    }
    /**
     * Clear node data
     */
    destroy() {
        super.destroy();
    }
}
/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
class TextNode extends Fragment {
    constructor($ = new TextNodePrivate()) {
        super({}, $);
        this.seal();
    }
    preinit(app, parent, text) {
        const $ = this.$;
        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }
        $.preinitText(app, parent, text);
        $.parent.appendNode($.node);
    }
    findFirstChild() {
        return this.$.node;
    }
    destroy() {
        this.$.node.remove();
        this.$.destroy();
        super.destroy();
    }
}
/**
 * The private part of a base node
 * @class INodePrivate
 * @extends FragmentPrivate
 */
class INodePrivate extends FragmentPrivate {
    constructor() {
        super();
        /**
         * Defines if node is unmounted
         * @type {boolean}
         */
        this.unmounted = false;
        this.seal();
    }
    destroy() {
        super.destroy();
    }
}
/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
class INode extends Fragment {
    /**
     * Constructs a base node
     * @param input
     * @param $ {?INodePrivate}
     */
    constructor(input, $) {
        super(input, $ || new INodePrivate);
        this.seal();
    }
    /**
     * Get the bound node
     */
    get node() {
        return this.$.node;
    }
    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    attr(name, value) {
        const $ = this.$;
        const attr = new AttributeBinding(this, name, value);
        $.bindings.add(attr);
    }
    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    setAttr(name, value) {
        if (typeof value === 'boolean') {
            if (value) {
                this.$.node.setAttribute(name, "");
            }
        }
        else {
            this.$.node.setAttribute(name, `${value}`);
        }
        return this;
    }
    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    addClass(cl) {
        this.$.node.classList.add(cl);
        return this;
    }
    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    removeClasse(cl) {
        this.$.node.classList.remove(cl);
        return this;
    }
    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    bindClass(className) {
        const $ = this.$;
        $.bindings.add(new DynamicalClassBinding(this, className));
        return this;
    }
    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    floatingClass(cond, className) {
        this.$.bindings.add(new StaticClassBinding(this, className, cond));
        return this;
    }
    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    style(name, value) {
        const $ = this.$;
        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, value));
        }
        else {
            throw userError('style can be applied to HTML elements only', 'non-html-element');
        }
        return this;
    }
    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     */
    setStyle(prop, value) {
        if (this.$.node instanceof HTMLElement) {
            this.$.node.style.setProperty(prop, value);
        }
        else {
            throw userError("Style can be set for HTML elements only", "non-html-element");
        }
        return this;
    }
    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     */
    listen(name, handler, options) {
        this.$.node.addEventListener(name, handler, options);
        return this;
    }
    insertAdjacent(node) {
        this.$.node.parentNode.insertBefore(node, this.$.node);
    }
    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    bindShow(cond) {
        const $ = this.$;
        const node = $.node;
        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            const htmlNode = node;
            return this.bindAlive(cond, () => {
                lastDisplay = htmlNode.style.display;
                htmlNode.style.display = 'none';
            }, () => {
                htmlNode.style.display = lastDisplay;
            });
        }
        else {
            throw userError('the element must be a html element', 'bind-show');
        }
    }
    /**
     * bind HTML
     * @param value {IValue}
     */
    bindDomApi(name, value) {
        const $ = this.$;
        const node = $.node;
        if (node instanceof HTMLElement) {
            node[name] = value.$;
            this.watch((v) => {
                node[name] = v;
            }, value);
        }
        else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    }
    applyOptions(options) {
        options["v:attr"] && Object.keys(options["v:attr"]).forEach(name => {
            const value = options["v:attr"][name];
            if (value instanceof IValue) {
                this.attr(name, value);
            }
            else {
                this.setAttr(name, value);
            }
        });
        if (options.class) {
            const handleClass = (name, value) => {
                if (value instanceof IValue) {
                    this.floatingClass(value, name);
                }
                else if (value && name !== '$') {
                    this.addClass(name);
                }
                else {
                    this.removeClasse(name);
                }
            };
            if (Array.isArray(options.class)) {
                options.class.forEach(item => {
                    if (item instanceof IValue) {
                        this.bindClass(item);
                    }
                    else if (typeof item == "string") {
                        this.addClass(item);
                    }
                    else {
                        Reflect.ownKeys(item).forEach((name) => {
                            handleClass(name, item[name]);
                        });
                    }
                });
            }
            else {
                options.class.$.forEach(item => {
                    this.bindClass(item);
                });
                Reflect.ownKeys(options.class).forEach((name) => {
                    handleClass(name, options.class[name]);
                });
            }
        }
        options.style && Object.keys(options.style).forEach(name => {
            const value = options.style[name];
            if (value instanceof IValue) {
                this.style(name, value);
            }
            else if (typeof value === "string") {
                this.setStyle(name, value);
            }
            else {
                if (value[0] instanceof IValue) {
                    this.style(name, this.expr((v) => v + value[1], value[0]));
                }
                else {
                    this.setStyle(name, value[0] + value[1]);
                }
            }
        });
        options["v:events"] && Object.keys(options["v:events"]).forEach(name => {
            this.listen(name, options["v:events"][name]);
        });
        if (options["v:bind"]) {
            const inode = this.node;
            Reflect.ownKeys(options["v:bind"]).forEach((k) => {
                const value = options["v:bind"][k];
                if (k === 'value' && (inode instanceof HTMLInputElement || inode instanceof HTMLTextAreaElement)) {
                    inode.oninput = () => value.$ = inode.value;
                }
                else if (k === 'checked' && inode instanceof HTMLInputElement) {
                    inode.oninput = () => value.$ = inode.checked;
                }
                else if (k === 'volume' && inode instanceof HTMLMediaElement) {
                    inode.onvolumechange = () => value.$ = inode.volume;
                }
                this.bindDomApi(k, value);
            });
        }
        options["v:set"] && Object.keys(options["v:set"]).forEach(key => {
            this.node[key] = options["v:set"][key];
        });
    }
}
/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
class Tag extends INode {
    constructor(input) {
        super(input);
        this.seal();
    }
    preinit(app, parent, tagName) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError('wrong Tag::$preinit call');
        }
        const node = document.createElement(tagName);
        const $ = this.$;
        $.preinit(app, parent);
        $.node = node;
        $.parent.appendNode(node);
    }
    compose(input) {
        input.slot && input.slot(this);
    }
    findFirstChild() {
        return this.$.unmounted ? null : this.$.node;
    }
    insertAdjacent(node) {
        if (this.$.unmounted) {
            if (this.$.next) {
                this.$.next.insertAdjacent(node);
            }
            else {
                this.$.parent.appendNode(node);
            }
        }
        else {
            super.insertAdjacent(node);
        }
    }
    appendNode(node) {
        this.$.node.appendChild(node);
    }
    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    bindMount(cond) {
        const $ = this.$;
        this.bindAlive(cond, () => {
            $.node.remove();
            $.unmounted = true;
        }, () => {
            if ($.unmounted) {
                this.insertAdjacent($.node);
                $.unmounted = false;
            }
        });
    }
    /**
     * Runs GC
     */
    destroy() {
        this.node.remove();
        super.destroy();
    }
}
/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
class Extension extends INode {
    preinit(app, parent) {
        const $ = this.$;
        let it = parent;
        while (it && !(it instanceof INode)) {
            it = it.parent;
        }
        if (it && it instanceof INode) {
            $.node = it.node;
        }
        $.preinit(app, parent);
        if (!it) {
            throw userError("A extension node can be encapsulated only in a tag/extension/component", "virtual-dom");
        }
    }
    destroy() {
        super.destroy();
    }
}
/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
class Component extends Extension {
    ready() {
        super.ready();
        if (this.children.size !== 1) {
            throw userError("Component must have a child only", "dom-error");
        }
        const child = this.lastChild;
        if (child instanceof Tag || child instanceof Component) {
            const $ = this.$;
            $.node = child.node;
        }
        else {
            throw userError("Component child must be Tag or Component", "dom-error");
        }
    }
    preinit(app, parent) {
        this.$.preinit(app, parent);
    }
}
/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
class SwitchedNodePrivate extends FragmentPrivate {
    constructor() {
        super();
        /**
         * Array of possible cases
         * @type {Array<{cond : IValue<boolean>, cb : function(Fragment)}>}
         */
        this.cases = [];
        this.seal();
    }
    /**
     * Runs GC
     */
    destroy() {
        this.cases.forEach(c => {
            delete c.cond;
            delete c.cb;
        });
        this.cases.splice(0);
        super.destroy();
    }
}
/**
 * Defines a node witch can switch its children conditionally
 */
class SwitchedNode extends Fragment {
    /**
     * Constructs a switch node and define a sync function
     */
    constructor() {
        super({}, new SwitchedNodePrivate);
        this.$.sync = () => {
            const $ = this.$;
            let i = 0;
            for (; i < $.cases.length; i++) {
                if ($.cases[i].cond.$) {
                    break;
                }
            }
            if (i === $.index) {
                return;
            }
            if (this.lastChild) {
                this.lastChild.destroy();
                this.children.clear();
                this.lastChild = null;
            }
            if (i !== $.cases.length) {
                $.index = i;
                this.createChild($.cases[i].cb);
            }
            else {
                $.index = -1;
            }
        };
        this.seal();
    }
    addCase(case_) {
        this.$.cases.push(case_);
        case_.cond.on(this.$.sync);
        this.$.sync();
    }
    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    createChild(cb) {
        const node = new Fragment({});
        node.preinit(this.$.app, this);
        node.init();
        this.lastChild = node;
        this.children.add(node);
        cb(node);
    }
    ready() {
        const $ = this.$;
        $.cases.forEach(c => {
            c.cond.on($.sync);
        });
        $.sync();
    }
    destroy() {
        const $ = this.$;
        $.cases.forEach(c => {
            c.cond.off($.sync);
        });
        super.destroy();
    }
}
/**
 * The private part of a text node
 */
class DebugPrivate extends FragmentPrivate {
    constructor() {
        super();
        this.seal();
    }
    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param parent {Fragment} parent node
     * @param text {String | IValue}
     */
    preinitComment(app, parent, text) {
        super.preinit(app, parent);
        this.node = document.createComment(text.$);
        this.bindings.add(new Expression((v) => {
            this.node.replaceData(0, -1, v);
        }, true, text));
        this.parent.appendNode(this.node);
    }
    /**
     * Clear node data
     */
    destroy() {
        this.node.remove();
        super.destroy();
    }
}
/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
class DebugNode extends Fragment {
    constructor() {
        super({});
        /**
         * private data
         * @type {DebugNode}
         */
        this.$ = new DebugPrivate();
        this.seal();
    }
    preinit(app, parent, text) {
        const $ = this.$;
        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }
        $.preinitComment(app, parent, text);
    }
    /**
     * Runs garbage collector
     */
    destroy() {
        this.$.destroy();
        super.destroy();
    }
}

window.FragmentPrivate = FragmentPrivate;
window.Fragment = Fragment;
window.TextNodePrivate = TextNodePrivate;
window.TextNode = TextNode;
window.INodePrivate = INodePrivate;
window.INode = INode;
window.Tag = Tag;
window.Extension = Extension;
window.Component = Component;
window.SwitchedNodePrivate = SwitchedNodePrivate;
window.SwitchedNode = SwitchedNode;
window.DebugPrivate = DebugPrivate;
window.DebugNode = DebugNode;

// ./lib/node/app.js
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
class AppNode extends INode {
    /**
     * @param input
     */
    constructor(input) {
        super(input);
        this.debugUi = input.debugUi || false;
        this.seal();
    }
}
/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
class App extends AppNode {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor(node, input) {
        super(input);
        this.$.node = node;
        this.preinit(this, this);
        this.init();
        this.seal();
    }
    appendNode(node) {
        this.$.node.appendChild(node);
    }
}
class Portal extends AppNode {
    constructor(input) {
        super(input);
        this.$.node = input.node;
        this.seal();
    }
    appendNode(node) {
        this.$.node.appendChild(node);
    }
}

window.AppNode = AppNode;
window.App = App;
window.Portal = Portal;

// ./lib/node/interceptor.js
/**
 * Interceptor is designed to connect signals & methods of children elements
 * @class Interceptor
 * @extends Destroyable
 */
class Interceptor extends Destroyable {
    constructor() {
        super(...arguments);
        /**
         * Set of signals
         * @type Set
         */
        this.signals = new Set;
        /**
         * Set of handlers
         * @type Set
         */
        this.handlers = new Set;
    }
    /**
     * Connect a signal or a handler
     * @param thing {Signal | function}
     */
    connect(thing) {
        // interceptor will connect signals and handlers together
        if (thing instanceof Signal) {
            this.handlers.forEach(handler => {
                thing.subscribe(handler);
            });
            this.signals.add(thing);
        }
        else {
            this.signals.forEach(signal => {
                signal.subscribe(thing);
            });
            this.handlers.add(thing);
        }
    }
    /**
     * Disconnect a handler from signals
     * @param handler {function}
     */
    disconnect(handler) {
        this.signals.forEach(signal => {
            signal.unsubscribe(handler);
        });
    }
    destroy() {
        super.destroy();
        this.signals.forEach(signal => {
            this.handlers.forEach(handler => {
                signal.unsubscribe(handler);
            });
        });
    }
}
/**
 * Interceptor node to implement directly to vasille DOM
 * @class InterceptorNode
 * @extends Extension
 */
class InterceptorNode extends Fragment {
    constructor() {
        super(...arguments);
        /**
         * Internal interceptor
         * @type Interceptor
         */
        this.interceptor = new Interceptor;
        /**
         * The default slot of node
         * @type Slot
         */
        this.slot = new Slot;
    }
    compose() {
        this.slot.release(this, this.interceptor);
    }
}

window.Interceptor = Interceptor;
window.InterceptorNode = InterceptorNode;

// ./lib/binding/attribute.js
/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
class AttributeBinding extends Binding {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    constructor(node, name, value) {
        super(value);
        this.init((value) => {
            if (value) {
                if (typeof value === 'boolean') {
                    node.node.setAttribute(name, "");
                }
                else {
                    node.node.setAttribute(name, `${value}`);
                }
            }
            else {
                node.node.removeAttribute(name);
            }
        });
        this.seal();
    }
}

window.AttributeBinding = AttributeBinding;

// ./lib/binding/style.js
/**
 * Describes a style attribute binding
 * @class StyleBinding
 * @extends Binding
 */
class StyleBinding extends Binding {
    /**
     * Constructs a style binding attribute
     * @param node {INode} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    constructor(node, name, value) {
        super(value);
        this.init((value) => {
            if (node.node instanceof HTMLElement) {
                node.node.style.setProperty(name, value);
            }
        });
        this.seal();
    }
}

window.StyleBinding = StyleBinding;

// ./lib/binding/class.js
function addClass(node, cl) {
    node.node.classList.add(cl);
}
function removeClass(node, cl) {
    node.node.classList.remove(cl);
}
class StaticClassBinding extends Binding {
    constructor(node, name, value) {
        super(value);
        this.current = false;
        this.init((value) => {
            if (value !== this.current) {
                if (value) {
                    addClass(node, name);
                }
                else {
                    removeClass(node, name);
                }
                this.current = value;
            }
        });
        this.seal();
    }
}
class DynamicalClassBinding extends Binding {
    constructor(node, value) {
        super(value);
        this.current = "";
        this.init((value) => {
            if (this.current != value) {
                if (this.current.length) {
                    removeClass(node, this.current);
                }
                if (value.length) {
                    addClass(node, value);
                }
                this.current = value;
            }
        });
        this.seal();
    }
}

window.StaticClassBinding = StaticClassBinding;
window.DynamicalClassBinding = DynamicalClassBinding;

// ./lib/views/repeat-node.js
/**
 * Private part of repeat node
 * @class RepeatNodePrivate
 * @extends INodePrivate
 */
class RepeatNodePrivate extends INodePrivate {
    constructor() {
        super();
        /**
         * Children node hash
         * @type {Map}
         */
        this.nodes = new Map();
        this.seal();
    }
    destroy() {
        this.nodes.clear();
        super.destroy();
    }
}
/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
class RepeatNode extends Fragment {
    constructor(input, $) {
        super(input, $);
        /**
         * If false will use timeout executor, otherwise the app executor
         */
        this.freezeUi = true;
    }
    createChild(opts, id, item, before) {
        const node = new Fragment({});
        this.destroyChild(id, item);
        if (before) {
            this.children.add(node);
            before.insertBefore(node);
        }
        else {
            const lastChild = this.lastChild;
            if (lastChild) {
                lastChild.insertAfter(node);
            }
            this.children.add(node);
        }
        this.lastChild = node;
        node.preinit(this.$.app, this);
        node.init();
        opts.slot && opts.slot(node, item, id);
        node.ready();
        this.$.nodes.set(id, node);
    }
    destroyChild(id, item) {
        const $ = this.$;
        const child = $.nodes.get(id);
        if (child) {
            child.remove();
            child.destroy();
            this.$.nodes.delete(id);
            this.children.delete(child);
        }
    }
}

window.RepeatNodePrivate = RepeatNodePrivate;
window.RepeatNode = RepeatNode;

// ./lib/views/repeater.js
/**
 * Private part of repeater
 * @class RepeaterPrivate
 * @extends RepeatNodePrivate
 */
class RepeaterPrivate extends RepeatNodePrivate {
    constructor() {
        super();
        /**
         * Current count of child nodes
         */
        this.currentCount = 0;
        this.seal();
    }
}
/**
 * The simplest repeat node interpretation, repeat children pack a several times
 * @class Repeater
 * @extends RepeatNode
 */
class Repeater extends RepeatNode {
    constructor($) {
        super($ || new RepeaterPrivate);
        /**
         * The count of children
         */
        this.count = new Reference(0);
        this.seal();
    }
    /**
     * Changes the children count
     */
    changeCount(number) {
        const $ = this.$;
        if (number > $.currentCount) {
            for (let i = $.currentCount; i < number; i++) {
                this.createChild(i, i);
            }
        }
        else {
            for (let i = $.currentCount - 1; i >= number; i--) {
                this.destroyChild(i, i);
            }
        }
        $.currentCount = number;
    }
    created() {
        const $ = this.$;
        super.created();
        $.updateHandler = this.changeCount.bind(this);
        this.count.on($.updateHandler);
    }
    ready() {
        this.changeCount(this.count.$);
    }
    destroy() {
        const $ = this.$;
        super.destroy();
        this.count.off($.updateHandler);
    }
}

window.RepeaterPrivate = RepeaterPrivate;
window.Repeater = Repeater;

// ./lib/views/base-view.js
/**
 * Private part of BaseView
 * @class BaseViewPrivate
 * @extends RepeatNodePrivate
 */
class BaseViewPrivate extends RepeatNodePrivate {
    constructor() {
        super();
        this.seal();
    }
}
/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
class BaseView extends RepeatNode {
    constructor(input, $) {
        super(input, $ || new BaseViewPrivate);
    }
    compose(input) {
        const $ = this.$;
        $.addHandler = (id, item) => {
            this.createChild(input, id, item);
        };
        $.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };
        input.model.listener.onAdd($.addHandler);
        input.model.listener.onRemove($.removeHandler);
        this.runOnDestroy(() => {
            input.model.listener.offAdd($.addHandler);
            input.model.listener.offRemove($.removeHandler);
        });
    }
}

window.BaseViewPrivate = BaseViewPrivate;
window.BaseView = BaseView;

// ./lib/views/array-view.js
/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
class ArrayView extends BaseView {
    createChild(input, id, item, before) {
        super.createChild(input, item, item, before || this.$.nodes.get(id));
    }
    compose(input) {
        super.compose(input);
        input.model.forEach(item => {
            this.createChild(input, item, item);
        });
    }
}

window.ArrayView = ArrayView;

// ./lib/node/watch.js
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
class Watch extends Fragment {
    compose(input) {
        this.watch((value) => {
            this.children.forEach(child => {
                child.destroy();
            });
            this.children.clear();
            this.lastChild = null;
            input.slot && input.slot(this, value);
        }, input.model);
        input.slot(this, input.model.$);
    }
}

window.Watch = Watch;

// ./lib/views/object-view.js
/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
class ObjectView extends BaseView {
    compose(input) {
        super.compose(input);
        const obj = input.model.proxy();
        for (const key in obj) {
            this.createChild(input, key, obj[key]);
        }
        super.ready();
    }
}

window.ObjectView = ObjectView;

// ./lib/views/map-view.js
/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
class MapView extends BaseView {
    compose(input) {
        super.compose(input);
        input.model.forEach((value, key) => {
            this.createChild(input, key, value);
        });
    }
}

window.MapView = MapView;

// ./lib/views/set-view.js
/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
class SetView extends BaseView {
    compose(input) {
        super.compose(input);
        const set = input.model;
        set.forEach(item => {
            this.createChild(input, item, item);
        });
    }
}

window.SetView = SetView;

})();
