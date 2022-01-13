(function(){
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
        Object.defineProperty(this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        for (const i in obj) {
            Object.defineProperty(this, i, {
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
        const ts = this;
        return ts[key];
    }
    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    set(key, v) {
        const ts = this;
        // eslint-disable-next-line no-prototype-builtins
        if (ts.hasOwnProperty(key)) {
            this.listener.emitRemoved(key, ts[key]);
            ts[key] = v;
        }
        else {
            Object.defineProperty(ts, key, {
                value: v,
                configurable: true,
                writable: true,
                enumerable: true
            });
        }
        this.listener.emitAdded(key, ts[key]);
        return this;
    }
    /**
     * Deletes an object property
     * @param key {string} property name
     */
    delete(key) {
        const ts = this;
        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
            delete ts[key];
        }
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
    $seal() {
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
    $destroy() {
        // nothing here
    }
}

window.Destroyable = Destroyable;

// ./lib/core/ivalue.js
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
class IValue extends Destroyable {
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

window.IValue = IValue;

// ./lib/index.js



// ./lib/value/expression.js
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
class Expression extends IValue {
    constructor(func, link, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        super(false);
        /**
         * Expression will link different handler for each value of list
         */
        this.linkedFunc = [];
        const values = [v1, v2, v3, v4, v5, v6, v7, v8, v9].filter(v => v instanceof IValue);
        const handler = (i) => {
            if (i != null) {
                this.valuesCache[i] = this.values[i].$;
            }
            this.sync.$ = func.apply(this, this.valuesCache);
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.valuesCache = values.map(iValue => iValue.$);
        this.sync = new Reference(func.apply(this, this.valuesCache));
        let i = 0;
        values.forEach(() => {
            this.linkedFunc.push(handler.bind(this, Number(i++)));
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this.values = values;
        this.func = handler;
        if (link) {
            this.enable();
        }
        else {
            handler();
        }
        this.$seal();
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
    $destroy() {
        this.disable();
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
        super.$destroy();
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
        this.$seal();
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
        return this;
    }
    disable() {
        this.isEnabled = false;
        return this;
    }
    on(handler) {
        this.onchange.add(handler);
        return this;
    }
    off(handler) {
        this.onchange.delete(handler);
        return this;
    }
    $destroy() {
        super.$destroy();
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
        this.$seal();
    }
    get $() {
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        return super.$;
    }
    set $(v) {
        // this is a ts bug
        // eslint-disable-next-line
        // @ts-ignore
        super.$ = v;
        if (!this.forwardOnly) {
            this.pointedValue.$ = v;
        }
    }
    enable() {
        if (!this.isEnabled) {
            this.isEnabled = true;
            this.pointedValue.on(this.handler);
            this.$ = this.pointedValue.$;
        }
        return this;
    }
    disable() {
        if (this.isEnabled) {
            this.pointedValue.off(this.handler);
            this.isEnabled = false;
        }
        return this;
    }
    $destroy() {
        this.disable();
        super.$destroy();
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
     * @param node {INode} the vasille node
     * @param name {String} the name of property/attribute/class
     * @param value {IValue} the value to bind
     */
    constructor(node, name, value) {
        super();
        this.updateFunc = this.bound(name).bind(null, node);
        this.binding = value;
        this.binding.on(this.updateFunc);
        this.updateFunc(this.binding.$);
        this.$seal();
    }
    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} the name of attribute/property
     * @returns {Function} a function to update attribute/property value
     * @throws Always throws and must be overloaded in child class
     */
    bound(name) {
        throw notOverwritten();
    }
    /**
     * Just clear bindings
     */
    $destroy() {
        this.binding.off(this.updateFunc);
        super.$destroy();
    }
}

window.Binding = Binding;

// ./lib/core/core.js
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
        this.$seal();
    }
    $destroy() {
        var _a;
        this.watch.forEach(value => value.$destroy());
        this.watch.clear();
        this.bindings.forEach(binding => binding.$destroy());
        this.bindings.clear();
        (_a = this.freezeExpr) === null || _a === void 0 ? void 0 : _a.$destroy();
        super.$destroy();
    }
}
/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
class Reactive extends Destroyable {
    constructor($) {
        super();
        this.$ = $ || new ReactivePrivate;
    }
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    $ref(value) {
        const $ = this.$;
        const ref = new Reference(value);
        $.watch.add(ref);
        return ref;
    }
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     * @param forwardOnly {boolean} forward only sync
     */
    $mirror(value, forwardOnly = false) {
        const mirror = new Mirror(value, forwardOnly);
        this.$.watch.add(mirror);
        return mirror;
    }
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    $point(value, forwardOnly = false) {
        const $ = this.$;
        const ref = value instanceof IValue ? value : new Reference(value);
        const pointer = new Pointer(ref, forwardOnly);
        // when value is an ivalue will be equal to ref
        if (value !== ref) {
            $.watch.add(ref);
        }
        $.watch.add(pointer);
        return pointer;
    }
    /**
     * Register a model
     * @param model
     */
    $register(model) {
        this.$.models.add(model);
        return model;
    }
    $watch(func, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        const $ = this.$;
        $.watch.add(new Expression(func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9));
    }
    $bind(func, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        const res = new Expression(func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        const $ = this.$;
        $.watch.add(res);
        return res;
    }
    /**
     * Enable reactivity of fields
     */
    $enable() {
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
    $disable() {
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
    $bindAlive(cond, onOff, onOn) {
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
                this.$enable();
            }
            else {
                onOff === null || onOff === void 0 ? void 0 : onOff();
                this.$disable();
            }
        }, true, cond);
        return this;
    }
    $destroy() {
        super.$destroy();
        this.$.$destroy();
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
        this.$seal();
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
    $destroy() {
        this.next = null;
        this.prev = null;
        super.$destroy();
    }
}
/**
 * This class is symbolic
 * @extends Reactive
 */
class Fragment extends Reactive {
    /**
     * Constructs a Vasille Node
     * @param $ {FragmentPrivate}
     */
    constructor($) {
        super();
        /**
         * The children list
         * @type Array
         */
        this.$children = [];
        this.$ = $ || new FragmentPrivate;
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
    $preinit(app, parent, data) {
        const $ = this.$;
        $.preinit(app, parent);
    }
    /**
     * Initialize node
     */
    $init() {
        this.$createSignals();
        this.$createWatchers();
        this.$created();
        this.$compose();
        this.$mounted();
        return this;
    }
    /** To be overloaded: created event handler */
    $created() {
        // empty
    }
    /** To be overloaded: mounted event handler */
    $mounted() {
        // empty
    }
    /** To be overloaded: ready event handler */
    $ready() {
        // empty
    }
    /** To be overloaded: signals creation milestone */
    $createSignals() {
        // empty
    }
    /** To be overloaded: watchers creation milestone */
    $createWatchers() {
        // empty
    }
    /** To be overloaded: DOM creation milestone */
    $compose() {
        // empty
    }
    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    $$pushNode(node) {
        let lastChild = null;
        if (this.$children.length) {
            lastChild = this.$children[this.$children.length - 1];
        }
        if (lastChild) {
            lastChild.$.next = node;
        }
        node.$.prev = lastChild;
        node.$.parent = this;
        this.$children.push(node);
    }
    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    $$findFirstChild() {
        let first;
        this.$children.forEach(child => {
            first = first || child.$$findFirstChild();
        });
        return first;
    }
    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    $$appendNode(node) {
        const $ = this.$;
        if ($.next) {
            $.next.$$insertAdjacent(node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    }
    /**
     * Insert a node as a sibling of this
     * @param node {Node} node to insert
     */
    $$insertAdjacent(node) {
        const child = this.$$findFirstChild();
        const $ = this.$;
        if (child) {
            $.app.$run.insertBefore(child, node);
        }
        else if ($.next) {
            $.next.$$insertAdjacent(node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    }
    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    $text(text, cb) {
        const $ = this.$;
        const node = new TextNode();
        const textValue = text instanceof IValue ? text : this.$ref(text);
        node.$preinit($.app, this, textValue);
        this.$$pushNode(node);
        if (cb) {
            $.app.$run.callCallback(() => {
                cb(node);
            });
        }
        return this;
    }
    $debug(text) {
        const node = new DebugNode();
        node.$preinit(this.$.app, this, text);
        this.$$pushNode(node);
        return this;
    }
    $tag(tagName, cb) {
        const $ = this.$;
        const node = new Tag();
        node.$preinit($.app, this, tagName);
        node.$init();
        this.$$pushNode(node);
        $.app.$run.callCallback(() => {
            if (cb) {
                cb(node, node.node);
            }
            node.$ready();
        });
        return this;
    }
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     * @param callback1 {function($ : *)}
     */
    $create(node, callback, callback1) {
        const $ = this.$;
        node.$.parent = this;
        node.$preinit($.app, this);
        if (callback) {
            callback(node);
        }
        if (callback1) {
            callback1(node);
        }
        this.$$pushNode(node);
        node.$init().$ready();
        return this;
    }
    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    $if(cond, cb) {
        return this.$switch({ cond, cb });
    }
    /**
     * Defines a if-else node
     * @param ifCond {IValue} `if` condition
     * @param ifCb {function(Fragment)} Call-back to create `if` child nodes
     * @param elseCb {function(Fragment)} Call-back to create `else` child nodes
     */
    $if_else(ifCond, ifCb, elseCb) {
        return this.$switch({ cond: ifCond, cb: ifCb }, { cond: trueIValue, cb: elseCb });
    }
    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue, cb : function(Fragment) }} cases
     * @return {INode}
     */
    $switch(...cases) {
        const $ = this.$;
        const node = new SwitchedNode();
        node.$preinit($.app, this);
        node.$init();
        this.$$pushNode(node);
        node.setCases(cases);
        node.$ready();
        return this;
    }
    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    $case(cond, cb) {
        return { cond, cb };
    }
    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    $default(cb) {
        return { cond: trueIValue, cb };
    }
    $destroy() {
        for (const child of this.$children) {
            child.$destroy();
        }
        this.$children.splice(0);
        super.$destroy();
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
        this.$seal();
    }
    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param text {IValue}
     */
    preinitText(app, parent, text) {
        super.preinit(app, parent);
        this.node = document.createTextNode(text.$);
        this.bindings.add(new Expression((v) => {
            this.node.replaceData(0, -1, v);
        }, true, text));
        this.parent.$$appendNode(this.node);
    }
    /**
     * Clear node data
     */
    $destroy() {
        super.$destroy();
    }
}
/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
class TextNode extends Fragment {
    constructor() {
        super();
        this.$ = new TextNodePrivate();
        this.$seal();
    }
    $preinit(app, parent, text) {
        const $ = this.$;
        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }
        $.preinitText(app, parent, text);
    }
    $$findFirstChild() {
        return this.$.node;
    }
    $destroy() {
        this.$.node.remove();
        this.$.$destroy();
        super.$destroy();
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
        this.$seal();
    }
    $destroy() {
        super.$destroy();
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
     * @param $ {?INodePrivate}
     */
    constructor($) {
        super($ || new INodePrivate);
        this.$seal();
    }
    /**
     * Get the bound node
     */
    get node() {
        return this.$.node;
    }
    /**
     * Initialize node
     */
    $init() {
        this.$createSignals();
        this.$createWatchers();
        this.$createAttrs();
        this.$createStyle();
        this.$created();
        this.$compose();
        this.$mounted();
        return this;
    }
    /** To be overloaded: attributes creation milestone */
    $createAttrs() {
        // empty
    }
    /** To be overloaded: $style attributes creation milestone */
    $createStyle() {
        // empty
    }
    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    $attr(name, value) {
        const $ = this.$;
        const attr = new AttributeBinding(this, name, value);
        $.bindings.add(attr);
        return this;
    }
    $bindAttr(name, calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        const $ = this.$;
        const expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        $.bindings.add(new AttributeBinding(this, name, expr));
        return this;
    }
    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    $setAttr(name, value) {
        this.$.app.$run.setAttribute(this.$.node, name, value);
        return this;
    }
    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    $addClass(cl) {
        this.$.app.$run.addClass(this.$.node, cl);
        return this;
    }
    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    $addClasses(...cls) {
        cls.forEach(cl => {
            this.$.app.$run.addClass(this.$.node, cl);
        });
        return this;
    }
    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    $bindClass(className) {
        const $ = this.$;
        $.bindings.add(new ClassBinding(this, "", className));
        return this;
    }
    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    $floatingClass(cond, className) {
        this.$.bindings.add(new ClassBinding(this, className, cond));
        return this;
    }
    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    $style(name, value) {
        const $ = this.$;
        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, value));
        }
        else {
            throw userError('style can be applied to HTML elements only', 'non-html-element');
        }
        return this;
    }
    $bindStyle(name, calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        const $ = this.$;
        const expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, expr));
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
    $setStyle(prop, value) {
        if (this.$.node instanceof HTMLElement) {
            this.$.app.$run.setStyle(this.$.node, prop, value);
        }
        else {
            throw userError("Style can be setted for HTML elements only", "non-html-element");
        }
        return this;
    }
    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     */
    $listen(name, handler, options) {
        this.$.node.addEventListener(name, handler, options);
        return this;
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $oncontextmenu(handler, options) {
        return this.$listen("contextmenu", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmousedown(handler, options) {
        return this.$listen("mousedown", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmouseenter(handler, options) {
        return this.$listen("mouseenter", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmouseleave(handler, options) {
        return this.$listen("mouseleave", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmousemove(handler, options) {
        return this.$listen("mousemove", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmouseout(handler, options) {
        return this.$listen("mouseout", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmouseover(handler, options) {
        return this.$listen("mouseover", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onmouseup(handler, options) {
        return this.$listen("mouseup", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $onclick(handler, options) {
        return this.$listen("click", handler, options);
    }
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $ondblclick(handler, options) {
        return this.$listen("dblclick", handler, options);
    }
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $onblur(handler, options) {
        return this.$listen("blur", handler, options);
    }
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $onfocus(handler, options) {
        return this.$listen("focus", handler, options);
    }
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $onfocusin(handler, options) {
        return this.$listen("focusin", handler, options);
    }
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $onfocusout(handler, options) {
        return this.$listen("focusout", handler, options);
    }
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $onkeydown(handler, options) {
        return this.$listen("keydown", handler, options);
    }
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $onkeyup(handler, options) {
        return this.$listen("keyup", handler, options);
    }
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $onkeypress(handler, options) {
        return this.$listen("keypress", handler, options);
    }
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $ontouchstart(handler, options) {
        return this.$listen("touchstart", handler, options);
    }
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $ontouchmove(handler, options) {
        return this.$listen("touchmove", handler, options);
    }
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $ontouchend(handler, options) {
        return this.$listen("touchend", handler, options);
    }
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $ontouchcancel(handler, options) {
        return this.$listen("touchcancel", handler, options);
    }
    /**
     * @param handler {function (WheelEvent)}
     * @param options {Object | boolean}
     */
    $onwheel(handler, options) {
        return this.$listen("wheel", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onabort(handler, options) {
        return this.$listen("abort", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onerror(handler, options) {
        return this.$listen("error", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onload(handler, options) {
        return this.$listen("load", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onloadend(handler, options) {
        return this.$listen("loadend", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onloadstart(handler, options) {
        return this.$listen("loadstart", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $onprogress(handler, options) {
        return this.$listen("progress", handler, options);
    }
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $ontimeout(handler, options) {
        return this.$listen("timeout", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondrag(handler, options) {
        return this.$listen("drag", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragend(handler, options) {
        return this.$listen("dragend", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragenter(handler, options) {
        return this.$listen("dragenter", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragexit(handler, options) {
        return this.$listen("dragexit", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragleave(handler, options) {
        return this.$listen("dragleave", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragover(handler, options) {
        return this.$listen("dragover", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondragstart(handler, options) {
        return this.$listen("dragstart", handler, options);
    }
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $ondrop(handler, options) {
        return this.$listen("drop", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerover(handler, options) {
        return this.$listen("pointerover", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerenter(handler, options) {
        return this.$listen("pointerenter", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerdown(handler, options) {
        return this.$listen("pointerdown", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointermove(handler, options) {
        return this.$listen("pointermove", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerup(handler, options) {
        return this.$listen("pointerup", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointercancel(handler, options) {
        return this.$listen("pointercancel", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerout(handler, options) {
        return this.$listen("pointerout", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onpointerleave(handler, options) {
        return this.$listen("pointerleave", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $ongotpointercapture(handler, options) {
        return this.$listen("gotpointercapture", handler, options);
    }
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $onlostpointercapture(handler, options) {
        return this.$listen("lostpointercapture", handler, options);
    }
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $onanimationstart(handler, options) {
        return this.$listen("animationstart", handler, options);
    }
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $onanimationend(handler, options) {
        return this.$listen("animationend", handler, options);
    }
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $onanimationiteraton(handler, options) {
        return this.$listen("animationiteration", handler, options);
    }
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $onclipboardchange(handler, options) {
        return this.$listen("clipboardchange", handler, options);
    }
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $oncut(handler, options) {
        return this.$listen("cut", handler, options);
    }
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $oncopy(handler, options) {
        return this.$listen("copy", handler, options);
    }
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $onpaste(handler, options) {
        return this.$listen("paste", handler, options);
    }
    $$insertAdjacent(node) {
        const $ = this.$;
        $.app.$run.insertBefore($.node, node);
    }
    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    $bindShow(cond) {
        const $ = this.$;
        const node = $.node;
        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            const htmlNode = node;
            return this.$bindAlive(cond, () => {
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
    $html(value) {
        const $ = this.$;
        const node = $.node;
        if (node instanceof HTMLElement) {
            node.innerHTML = value.$;
            this.$watch((v) => {
                node.innerHTML = v;
            }, value);
        }
        else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    }
}
/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
class Tag extends INode {
    constructor() {
        super();
        this.$seal();
    }
    $preinit(app, parent, tagName) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError('wrong Tag::$preinit call');
        }
        const node = document.createElement(tagName);
        const $ = this.$;
        $.preinit(app, parent);
        $.node = node;
        $.parent.$$appendNode(node);
    }
    $$findFirstChild() {
        return this.$.unmounted ? null : this.$.node;
    }
    $$insertAdjacent(node) {
        if (this.$.unmounted) {
            if (this.$.next) {
                this.$.next.$$insertAdjacent(node);
            }
            else {
                this.$.parent.$$appendNode(node);
            }
        }
        else {
            super.$$insertAdjacent(node);
        }
    }
    $$appendNode(node) {
        const $ = this.$;
        $.app.$run.appendChild($.node, node);
    }
    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    $bindMount(cond) {
        const $ = this.$;
        return this.$bindAlive(cond, () => {
            $.node.remove();
            $.unmounted = true;
        }, () => {
            if (!$.unmounted)
                return;
            if ($.next) {
                $.next.$$insertAdjacent($.node);
            }
            else {
                $.parent.$$appendNode($.node);
            }
            $.unmounted = false;
        });
    }
    /**
     * Runs GC
     */
    $destroy() {
        this.node.remove();
        super.$destroy();
    }
}
/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
class Extension extends INode {
    $preinit(app, parent) {
        if (parent instanceof INode) {
            const $ = this.$;
            $.preinit(app, parent);
            $.node = parent.node;
        }
        else {
            throw internalError("A extension node can be encapsulated only in a tag/extension/component");
        }
    }
    constructor($) {
        super($);
        this.$seal();
    }
    $destroy() {
        super.$destroy();
    }
}
/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
class Component extends Extension {
    constructor() {
        super();
        this.$seal();
    }
    $mounted() {
        super.$mounted();
        if (this.$children.length !== 1) {
            throw userError("UserNode must have a child only", "dom-error");
        }
        const child = this.$children[0];
        if (child instanceof Tag || child instanceof Component) {
            const $ = this.$;
            $.node = child.node;
        }
        else {
            throw userError("UserNode child must be Tag or Component", "dom-error");
        }
    }
}
/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
class SwitchedNodePrivate extends INodePrivate {
    constructor() {
        super();
        this.$seal();
    }
    /**
     * Runs GC
     */
    $destroy() {
        this.cases.forEach(c => {
            delete c.cond;
            delete c.cb;
        });
        this.cases.splice(0);
        super.$destroy();
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
        super(new SwitchedNodePrivate);
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
            if ($.fragment) {
                $.fragment.$destroy();
                this.$children.splice(0);
                $.fragment = null;
            }
            if (i !== $.cases.length) {
                $.index = i;
                this.createChild($.cases[i].cb);
            }
            else {
                $.index = -1;
            }
        };
        this.$seal();
    }
    /**
     * Set up switch cases
     * @param cases {{ cond : IValue, cb : function(Fragment) }}
     */
    setCases(cases) {
        const $ = this.$;
        $.cases = [...cases];
    }
    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    createChild(cb) {
        const node = new Fragment();
        node.$preinit(this.$.app, this);
        node.$init();
        node.$ready();
        this.$.fragment = node;
        this.$children.push(node);
        cb(node);
    }
    $ready() {
        const $ = this.$;
        super.$ready();
        $.cases.forEach(c => {
            c.cond.on($.sync);
        });
        $.sync();
    }
    $destroy() {
        const $ = this.$;
        $.cases.forEach(c => {
            c.cond.off($.sync);
        });
        super.$destroy();
    }
}
/**
 * The private part of a text node
 */
class DebugPrivate extends FragmentPrivate {
    constructor() {
        super();
        this.$seal();
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
        this.parent.$$appendNode(this.node);
    }
    /**
     * Clear node data
     */
    $destroy() {
        this.node.remove();
        super.$destroy();
    }
}
/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
class DebugNode extends Fragment {
    constructor() {
        super();
        /**
         * private data
         * @type {DebugNode}
         */
        this.$ = new DebugPrivate();
        this.$seal();
    }
    $preinit(app, parent, text) {
        const $ = this.$;
        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }
        $.preinitComment(app, parent, text);
    }
    /**
     * Runs garbage collector
     */
    $destroy() {
        this.$.$destroy();
        super.$destroy();
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
     * @param options {Object} Application options
     */
    constructor(options) {
        super();
        this.$run = (options === null || options === void 0 ? void 0 : options.executor) || ((options === null || options === void 0 ? void 0 : options.freezeUi) === false ? timeoutExecutor : instantExecutor);
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
     * @param options {Object} Application options
     */
    constructor(node, options) {
        super(options);
        this.$.node = node;
        this.$preinit(this, this);
        this.$seal();
    }
    $$appendNode(node) {
        const $ = this.$;
        $.app.$run.appendChild($.node, node);
    }
}

window.AppNode = AppNode;
window.App = App;

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
    $destroy() {
        super.$destroy();
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
    $compose() {
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
        super(node, name, value);
    }
    /**
     * Generates a function which updates the attribute value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound(name) {
        return function (node, value) {
            if (value) {
                node.app.$run.setAttribute(node.node, name, value);
            }
            else {
                node.app.$run.removeAttribute(node.node, name);
            }
        };
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
        super(node, name, value);
    }
    /**
     * Generates a function to update style property value
     * @param name {string}
     * @returns {Function} a function to update style property
     */
    bound(name) {
        return function (node, value) {
            if (node.node instanceof HTMLElement) {
                node.app.$run.setStyle(node.node, name, value);
            }
        };
    }
}

window.StyleBinding = StyleBinding;

// ./lib/binding/class.js
/**
 * Represents a HTML class binding description
 * @class ClassBinding
 * @extends Binding
 */
class ClassBinding extends Binding {
    /**
     * Constructs an HTML class binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of class
     * @param value {IValue} the value to bind
     */
    constructor(node, name, value) {
        super(node, name, value);
        this.$seal();
    }
    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    bound(name) {
        let current = null;
        function addClass(node, cl) {
            node.app.$run.addClass(node.node, cl);
        }
        function removeClass(node, cl) {
            node.app.$run.removeClass(node.node, cl);
        }
        return (node, value) => {
            if (value !== current) {
                if (typeof current === "string" && current !== "") {
                    removeClass(node, current);
                }
                if (typeof value === "boolean") {
                    if (value) {
                        addClass(node, name);
                    }
                    else {
                        removeClass(node, name);
                    }
                }
                else if (typeof value === "string" && value !== "") {
                    addClass(node, value);
                }
                current = value;
            }
        };
    }
}

window.ClassBinding = ClassBinding;

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
        this.$seal();
    }
    $destroy() {
        this.nodes.clear();
        super.$destroy();
    }
}
/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
class RepeatNode extends Fragment {
    constructor($) {
        super($ || new RepeatNodePrivate);
        /**
         * If false will use timeout executor, otherwise the app executor
         */
        this.freezeUi = true;
        this.slot = new Slot;
    }
    createChild(id, item, before) {
        // TODO: Refactor: remove @ts-ignore
        const node = new Fragment();
        // eslint-disable-next-line
        // @ts-ignore
        const $ = node.$;
        this.destroyChild(id, item);
        if (before) {
            $.next = before;
            // eslint-disable-next-line
            // @ts-ignore
            $.prev = before.$.prev;
            // eslint-disable-next-line
            // @ts-ignore
            before.$.prev = node;
            if ($.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $.prev.$.next = node;
            }
            this.$children.splice(this.$children.indexOf(before), 0, node);
        }
        else {
            const lastChild = this.$children[this.$children.length - 1];
            if (lastChild) {
                // eslint-disable-next-line
                // @ts-ignore
                lastChild.$.next = node;
            }
            $.prev = lastChild;
            this.$children.push(node);
        }
        node.$preinit(this.$.app, this);
        node.$init();
        const callback = () => {
            this.slot.release(node, item, id);
            node.$ready();
        };
        if (this.freezeUi) {
            this.$.app.$run.callCallback(callback);
        }
        else {
            timeoutExecutor.callCallback(callback);
        }
        this.$.nodes.set(id, node);
    }
    destroyChild(id, item) {
        const $ = this.$;
        const child = $.nodes.get(id);
        if (child) {
            // eslint-disable-next-line
            // @ts-ignore
            const $ = child.$;
            if ($.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $.prev.$.next = $.next;
            }
            if ($.next) {
                // eslint-disable-next-line
                // @ts-ignore
                $.next.$.prev = $.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
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
        this.$seal();
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
        this.$seal();
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
    $created() {
        const $ = this.$;
        super.$created();
        $.updateHandler = this.changeCount.bind(this);
        this.count.on($.updateHandler);
    }
    $ready() {
        this.changeCount(this.count.$);
    }
    $destroy() {
        const $ = this.$;
        super.$destroy();
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
        this.$seal();
    }
}
/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
class BaseView extends RepeatNode {
    constructor($1) {
        super($1 || new BaseViewPrivate);
        const $ = this.$;
        $.addHandler = (id, item) => {
            this.createChild(id, item);
        };
        $.removeHandler = (id, item) => {
            this.destroyChild(id, item);
        };
        this.$seal();
    }
    /**
     * Handle ready event
     */
    $ready() {
        const $ = this.$;
        this.model.listener.onAdd($.addHandler);
        this.model.listener.onRemove($.removeHandler);
        super.$ready();
    }
    /**
     * Handles destroy event
     */
    $destroy() {
        const $ = this.$;
        this.model.listener.offAdd($.addHandler);
        this.model.listener.offRemove($.removeHandler);
        super.$destroy();
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
    constructor() {
        super();
        this.model = new ArrayModel;
        this.$seal();
    }
    createChild(id, item, before) {
        super.createChild(item, item, before || this.$.nodes.get(id));
    }
    $ready() {
        this.model.forEach(item => {
            this.createChild(item, item);
        });
        super.$ready();
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
    constructor() {
        super();
        this.slot = new Slot;
        this.model = this.$ref(null);
        this.$seal();
    }
    $createWatchers() {
        this.$watch((value) => {
            this.$children.forEach(child => {
                child.$destroy();
            });
            this.$children.splice(0);
            this.slot.release(this, value);
        }, this.model);
    }
    $compose() {
        this.slot.release(this, this.model.$);
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
    constructor() {
        super();
        this.model = new ObjectModel;
    }
    $ready() {
        const obj = this.model;
        for (const key in obj) {
            this.createChild(key, obj[key]);
        }
        super.$ready();
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
    constructor() {
        super();
        this.model = new MapModel;
    }
    $ready() {
        const map = this.model;
        map.forEach((value, key) => {
            this.createChild(key, value);
        });
        super.$ready();
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
    constructor() {
        super();
        this.model = new SetModel();
    }
    $ready() {
        const $ = this.$;
        const set = this.model;
        set.forEach(item => {
            $.app.$run.callCallback(() => {
                this.createChild(item, item);
            });
        });
        super.$ready();
    }
}

window.SetView = SetView;

})();
