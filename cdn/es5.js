(function(){
var __extends = function (child, parent) {
    child.prototype = Object.create(parent.prototype);
}
var __spreadArray = function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};

// if (!window.Set) {
    var Set = /** @class */ (function (_super) {
        __extends(Set, _super);
        function Set(set) {
            if (set === void 0) { set = []; }
            var _this = this; _super.call(this);
            set.forEach(function (item) {
                _this.add (item)
            });
            Object.defineProperty(_this, 'hash', {
                value: Object.create(null),
                writable: true
            });
            return _this;
        }

        Set.prototype.has = function (value) {
            if (typeof value === "string" || typeof value === "number") {
                return this.hash[value] !== void 0;
            }
            else {
                return this.indexOf(value) !== -1;
            }
        };

        Set.prototype.add = function (value) {
            if (typeof value === "string" || typeof value === "number") {
                if (this.hash[value]) {
                    return this;
                }
                else {
                    this.hash[value] = true;
                }
            }
            else {
                if (this.indexOf(value) !== -1) {
                    return this;
                }
                this.push(value);
            }
            return this;
        };

        Set.prototype.clear = function () {
            this.hash = Object.create(null);
            this.splice(0);
        };

        Set.prototype.delete = function (value) {
            if (typeof value === "string" || typeof value === "number") {
                if (this.hash[value] !== void 0) {
                    delete this.hash[value];
                }
            }
            else {
                var index = this.indexOf(value);
                if (index !== -1) {
                    this.splice(index, 1);
                }
            }
            this.push(value);
            return this;
        };
        return Set;
    }(Array));

    window.Set = Set;
// }

// if (!window.Map) {
    var Map = /** @class */ (function (_super) {
        __extends(Map, _super);

        function Map(map) {
            if (map === void 0) { map = []; }
            var _this = this; _super.call(this);
            Object.defineProperty(_this, 'hash', {
                value: Object.create(null),
                writable: true
            });
            map.forEach(function (_a) {
                var key = _a[0], value = _a[1];
                this.set(key, value);
            });
            return _this;
        }

        Map.prototype.clear = function () {
            this.hash = Object.create(null);
            this.splice(0);
        };

        Map.prototype.delete = function (key) {
            if (typeof key === "string" || typeof key === "number") {
                if (this.hash[key] !== void 0) {
                    delete this.hash[key];
                }
            }
            else {
                for (var i = 0; i < this.length; i++) {
                    if (this[i][0] === key) {
                        this.splice(i, 1);
                    }
                }
            }
        };

        function indexOfKey(key) {
            for (var i = 0; i < this.length; i++) {
                if (this[i][0] === key) {
                    return i;
                }
            }
            return -1;
        }

        Map.prototype.set = function (key, value) {
            if (typeof key === "string" || typeof key === "number") {
                this.hash[key] = value;
            }
            else {
                var index = indexOfKey.call(this, key);
                if (index === -1) {
                    this.push([key, value]);
                }
                else {
                    this[index][1] = value;
                }
            }
        };


        Map.prototype.has = function (key) {
            if (typeof key === "string" || typeof key === "number") {
                return !!this.hash[key];
            }
            else {
                return indexOfKey.call(this, key) !== -1;
            }
        };

        Map.prototype.get = function (key) {
            if (typeof key === "string" || typeof key === "number") {
                return this.hash[key];
            }
            else {
                var index = indexOfKey.call(this, key);
                if (index !== -1) {
                    return this[index][1];
                }
                else {
                    return void 0;
                }
            }
        };

        return Map;
    }(Array));
    window.Map = Map;
// }
// ./lib-es5/models/model.js



// ./lib-es5/models/listener.js
/**
 * Represent a listener for a model
 * @class Listener
 */
var Listener = /** @class */ (function () {
    function Listener() {
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
    Listener.prototype.excludeRepeat = function (index) {
        var _this = this;
        this.queue.forEach(function (item, i) {
            if (item.index === index) {
                _this.queue.splice(i, 1);
                return true;
            }
        });
        return false;
    };
    /**
     * Emits added event to listeners
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    Listener.prototype.emitAdded = function (index, value) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: true, index: index, value: value });
            }
        }
        else {
            this.onAdded.forEach(function (handler) {
                handler(index, value);
            });
        }
    };
    /**
     * Emits removed event to listeners
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    Listener.prototype.emitRemoved = function (index, value) {
        if (this.frozen) {
            if (!this.excludeRepeat(index)) {
                this.queue.push({ sign: false, index: index, value: value });
            }
        }
        else {
            this.onRemoved.forEach(function (handler) {
                handler(index, value);
            });
        }
    };
    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    Listener.prototype.onAdd = function (handler) {
        this.onAdded.add(handler);
    };
    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    Listener.prototype.onRemove = function (handler) {
        this.onRemoved.add(handler);
    };
    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    Listener.prototype.offAdd = function (handler) {
        this.onAdded.delete(handler);
    };
    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    Listener.prototype.offRemove = function (handler) {
        this.onRemoved.delete(handler);
    };
    /**
     * Run all queued operation and enable reactivity
     */
    Listener.prototype.enableReactivity = function () {
        var _this = this;
        this.queue.forEach(function (item) {
            if (item.sign) {
                _this.onAdded.forEach(function (handler) {
                    handler(item.index, item.value);
                });
            }
            else {
                _this.onRemoved.forEach(function (handler) {
                    handler(item.index, item.value);
                });
            }
        });
        this.queue.splice(0);
        this.frozen = false;
    };
    /**
     * Disable the reactivity and enable the queue
     */
    Listener.prototype.disableReactivity = function () {
        this.frozen = true;
    };
    return Listener;
}());


window.Listener = Listener;

// ./lib-es5/models/object-model.js
/**
 * Object based model
 * @extends Object
 */
var ObjectModel = /** @class */ (function (_super) {
    __extends(ObjectModel, _super);
    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    function ObjectModel(obj) {
        if (obj === void 0) { obj = {}; }
        var _this = this; _super.call(this);
        Object.defineProperty(_this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        for (var i in obj) {
            Object.defineProperty(_this, i, {
                value: obj[i],
                configurable: true,
                writable: true,
                enumerable: true
            });
            _this.listener.emitAdded(i, obj[i]);
        }
        return _this;
    }
    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    ObjectModel.prototype.get = function (key) {
        var ts = this;
        return ts[key];
    };
    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    ObjectModel.prototype.set = function (key, v) {
        var ts = this;
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
    };
    /**
     * Deletes an object property
     * @param key {string} property name
     */
    ObjectModel.prototype.delete = function (key) {
        var ts = this;
        if (ts[key]) {
            this.listener.emitRemoved(key, ts[key]);
            delete ts[key];
        }
    };
    ObjectModel.prototype.enableReactivity = function () {
        this.listener.enableReactivity();
    };
    ObjectModel.prototype.disableReactivity = function () {
        this.listener.disableReactivity();
    };
    return ObjectModel;
}(Object));


window.ObjectModel = ObjectModel;

// ./lib-es5/models/set-model.js
/**
 * A Set based model
 * @class SetModel
 * @extends Set
 * @implements IModel
 */
var SetModel = /** @class */ (function (_super) {
    __extends(SetModel, _super);
    /**
     * Constructs a set model based on a set
     * @param set {Set} input data
     */
    function SetModel(set) {
        if (set === void 0) { set = []; }
        var _this = this; _super.call(this);
        Object.defineProperty(_this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        set.forEach(function (item) {
            _super.prototype.add.call(_this, item);
        });
        return _this;
    }
    /**
     * Calls Set.add and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    SetModel.prototype.add = function (value) {
        if (!_super.prototype.has.call(this, value)) {
            this.listener.emitAdded(value, value);
            _super.prototype.add.call(this, value);
        }
        return this;
    };
    /**
     * Calls Set.clear and notify abut changes
     */
    SetModel.prototype.clear = function () {
        var _this = this;
        this.forEach(function (item) {
            _this.listener.emitRemoved(item, item);
        });
        _super.prototype.clear.call(this);
    };
    /**
     * Calls Set.delete and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    SetModel.prototype.delete = function (value) {
        if (_super.prototype.has.call(this, value)) {
            this.listener.emitRemoved(value, value);
        }
        return _super.prototype.delete.call(this, value);
    };
    SetModel.prototype.enableReactivity = function () {
        this.listener.enableReactivity();
    };
    SetModel.prototype.disableReactivity = function () {
        this.listener.disableReactivity();
    };
    return SetModel;
}(Set));


window.SetModel = SetModel;

// ./lib-es5/models/map-model.js
/**
 * A Map based memory
 * @class MapModel
 * @extends Map
 * @implements IModel
 */
var MapModel = /** @class */ (function (_super) {
    __extends(MapModel, _super);
    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     */
    function MapModel(map) {
        if (map === void 0) { map = []; }
        var _this = this; _super.call(this);
        Object.defineProperty(_this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        map.forEach(function (_a) {
            var key = _a[0], value = _a[1];
            _super.prototype.set.call(_this, key, value);
        });
        return _this;
    }
    /**
     * Calls Map.clear and notify abut changes
     */
    MapModel.prototype.clear = function () {
        var _this = this;
        this.forEach(function (value, key) {
            _this.listener.emitRemoved(key, value);
        });
        _super.prototype.clear.call(this);
    };
    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    MapModel.prototype.delete = function (key) {
        var tmp = _super.prototype.get.call(this, key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        return _super.prototype.delete.call(this, key);
    };
    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    MapModel.prototype.set = function (key, value) {
        var tmp = _super.prototype.get.call(this, key);
        if (tmp) {
            this.listener.emitRemoved(key, tmp);
        }
        _super.prototype.set.call(this, key, value);
        this.listener.emitAdded(key, value);
        return this;
    };
    MapModel.prototype.enableReactivity = function () {
        this.listener.enableReactivity();
    };
    MapModel.prototype.disableReactivity = function () {
        this.listener.disableReactivity();
    };
    return MapModel;
}(Map));


window.MapModel = MapModel;

// ./lib-es5/models/array-model.js
/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
var ArrayModel = /** @class */ (function (_super) {
    __extends(ArrayModel, _super);
    /**
     * @param data {Array} input data
     */
    function ArrayModel(data) {
        if (data === void 0) { data = []; }
        var _this = this; _super.call(this);
        Object.defineProperty(_this, 'listener', {
            value: new Listener,
            writable: false,
            configurable: false
        });
        for (var i = 0; i < data.length; i++) {
            _super.prototype.push.call(_this, data[i]);
        }
        return _this;
    }
    Object.defineProperty(ArrayModel.prototype, "last", {
        /* Array members */
        /**
         * Gets the last item of array
         * @return {*} the last item of array
         */
        get: function () {
            return this.length ? this[this.length - 1] : null;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    ArrayModel.prototype.fill = function (value, start, end) {
        if (!start) {
            start = 0;
        }
        if (!end) {
            end = this.length;
        }
        for (var i = start; i < end; i++) {
            this.listener.emitRemoved(this[i], this[i]);
            this[i] = value;
            this.listener.emitAdded(value, value);
        }
        return this;
    };
    /**
     * Calls Array.pop and notify about changes
     * @return {*} removed value
     */
    ArrayModel.prototype.pop = function () {
        var v = _super.prototype.pop.call(this);
        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    };
    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    ArrayModel.prototype.push = function () {
        var _this = this;
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        items.forEach(function (item) {
            _this.listener.emitAdded(item, item);
            _super.prototype.push.call(_this, item);
        });
        return this.length;
    };
    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    ArrayModel.prototype.shift = function () {
        var v = _super.prototype.shift.call(this);
        if (v !== undefined) {
            this.listener.emitRemoved(v, v);
        }
        return v;
    };
    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    ArrayModel.prototype.splice = function (start, deleteCount) {
        var items = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            items[_i - 2] = arguments[_i];
        }
        start = Math.min(start, this.length);
        deleteCount = deleteCount || this.length - start;
        var before = this[start + deleteCount];
        for (var i = 0; i < deleteCount; i++) {
            var index = start + deleteCount - i - 1;
            if (this[index] !== undefined) {
                this.listener.emitRemoved(this[index], this[index]);
            }
        }
        for (var i = 0; i < items.length; i++) {
            this.listener.emitAdded(before, items[i]);
        }
        return new ArrayModel(_super.prototype.splice.apply(this, __spreadArray([start, deleteCount], items, false)));
    };
    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    ArrayModel.prototype.unshift = function () {
        var items = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            items[_i] = arguments[_i];
        }
        for (var i = 0; i < items.length; i++) {
            this.listener.emitAdded(this[i], items[i]);
        }
        return _super.prototype.unshift.apply(this, items);
    };
    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     */
    ArrayModel.prototype.append = function (v) {
        this.listener.emitAdded(null, v);
        _super.prototype.push.call(this, v);
        return this;
    };
    /**
     * Clears array
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.clear = function () {
        var _this = this;
        this.forEach(function (v) {
            _this.listener.emitRemoved(v, v);
        });
        _super.prototype.splice.call(this, 0);
        return this;
    };
    /**
     * Inserts a value to position `index`
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.insert = function (index, v) {
        this.listener.emitAdded(this[index], v);
        _super.prototype.splice.call(this, index, 0, v);
        return this;
    };
    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.prepend = function (v) {
        this.listener.emitAdded(this[0], v);
        _super.prototype.unshift.call(this, v);
        return this;
    };
    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.removeAt = function (index) {
        if (index > 0 && index < this.length) {
            this.listener.emitRemoved(this[index], this[index]);
            _super.prototype.splice.call(this, index, 1);
        }
        return this;
    };
    /**
     * Removes the first value of array
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.removeFirst = function () {
        if (this.length) {
            this.listener.emitRemoved(this[0], this[0]);
            _super.prototype.shift.call(this);
        }
        return this;
    };
    /**
     * Removes the ast value of array
     * @return {this} a pointer to this
     */
    ArrayModel.prototype.removeLast = function () {
        var last = this.last;
        if (last != null) {
            this.listener.emitRemoved(this[this.length - 1], last);
            _super.prototype.pop.call(this);
        }
        return this;
    };
    /**
     * Remove the first occurrence of value
     * @param v {*} value to remove
     * @return {this}
     */
    ArrayModel.prototype.removeOne = function (v) {
        this.removeAt(this.indexOf(v));
        return this;
    };
    ArrayModel.prototype.enableReactivity = function () {
        this.listener.enableReactivity();
    };
    ArrayModel.prototype.disableReactivity = function () {
        this.listener.disableReactivity();
    };
    return ArrayModel;
}(Array));


window.ArrayModel = ArrayModel;

// ./lib-es5/core/signal.js
/**
 * Signal is an event generator
 * @class Signal
 */
var Signal = /** @class */ (function () {
    function Signal() {
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
    Signal.prototype.emit = function (a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        this.handlers.forEach(function (handler) {
            try {
                handler(a1, a2, a3, a4, a5, a6, a7, a8, a9);
            }
            catch (e) {
                console.error("Vasille.js: Handler throw exception: ", e);
            }
        });
    };
    /**
     * Subscribe to event
     * @param func {function} handler
     */
    Signal.prototype.subscribe = function (func) {
        this.handlers.add(func);
    };
    /**
     * Unsubscribe from event
     * @param func {function} handler
     */
    Signal.prototype.unsubscribe = function (func) {
        this.handlers.delete(func);
    };
    return Signal;
}());


window.Signal = Signal;

// ./lib-es5/core/slot.js
/**
 * Component slot
 * @class Slot
 */
var Slot = /** @class */ (function () {
    function Slot() {
    }
    /**
     * Sets the runner
     * @param func {function} the function to run
     */
    Slot.prototype.insert = function (func) {
        this.runner = func;
    };
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
    Slot.prototype.release = function (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        if (this.runner) {
            this.runner(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        }
    };
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
    Slot.prototype.predefine = function (func, a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) {
        (this.runner || func)(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
    };
    return Slot;
}());


window.Slot = Slot;

// ./lib-es5/core/errors.js
var reportIt = "Report it here: https://gitlab.com/vasille-js/vasille-js/-/issues";
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

// ./lib-es5/core/executor.js
/**
 * Represents an executor unit interface
 * @class Executor
 */
var Executor = /** @class */ (function () {
    function Executor() {
    }
    /**
     * Adds a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be added
     */
    Executor.prototype.addClass = function (el, cl) {
        throw notOverwritten();
    };
    /**
     * Removes a CSS class
     * @param el {Element} element to manipulate
     * @param cl {string} class to be removed
     */
    Executor.prototype.removeClass = function (el, cl) {
        throw notOverwritten();
    };
    /**
     * Sets a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     * @param value {string} value of attribute
     */
    Executor.prototype.setAttribute = function (el, name, value) {
        throw notOverwritten();
    };
    /**
     * Removes a tag attribute
     * @param el {Element} element to manipulate
     * @param name {string} name of attribute
     */
    Executor.prototype.removeAttribute = function (el, name) {
        throw notOverwritten();
    };
    /**
     * Sets a style attribute
     * @param el {HTMLElement} element to manipulate
     * @param prop {string} property name
     * @param value {string} property value
     */
    Executor.prototype.setStyle = function (el, prop, value) {
        throw notOverwritten();
    };
    /**
     * Inserts a child before target
     * @param target {Element} target element
     * @param child {Node} element to insert before
     */
    Executor.prototype.insertBefore = function (target, child) {
        throw notOverwritten();
    };
    /**
     * Appends a child to element
     * @param el {Element} element
     * @param child {Node} child to be inserted
     */
    Executor.prototype.appendChild = function (el, child) {
        throw notOverwritten();
    };
    /**
     * Calls a call-back function
     * @param cb {function} call-back function
     */
    Executor.prototype.callCallback = function (cb) {
        throw notOverwritten();
    };
    return Executor;
}());

/**
 * Executor which execute any commands immediately
 * @class InstantExecutor
 * @extends Executor
 */
var InstantExecutor = /** @class */ (function (_super) {
    __extends(InstantExecutor, _super);
    function InstantExecutor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    InstantExecutor.prototype.addClass = function (el, cl) {
        el.classList.add(cl);
    };
    InstantExecutor.prototype.removeClass = function (el, cl) {
        el.classList.remove(cl);
    };
    InstantExecutor.prototype.setAttribute = function (el, name, value) {
        el.setAttribute(name, value);
    };
    InstantExecutor.prototype.removeAttribute = function (el, name) {
        el.removeAttribute(name);
    };
    InstantExecutor.prototype.setStyle = function (el, prop, value) {
        el.style.setProperty(prop, value);
    };
    InstantExecutor.prototype.insertBefore = function (target, child) {
        var parent = target.parentNode;
        if (!parent) {
            throw internalError('element don\'t have a parent node');
        }
        parent.insertBefore(child, target);
    };
    InstantExecutor.prototype.appendChild = function (el, child) {
        el.appendChild(child);
    };
    InstantExecutor.prototype.callCallback = function (cb) {
        cb();
    };
    return InstantExecutor;
}(Executor));

/**
 * Executor which execute any commands over timeout
 * @class TimeoutExecutor
 * @extends InstantExecutor
 */
var TimeoutExecutor = /** @class */ (function (_super) {
    __extends(TimeoutExecutor, _super);
    function TimeoutExecutor() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    TimeoutExecutor.prototype.addClass = function (el, cl) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.addClass.call(_this, el, cl);
        }, 0);
    };
    TimeoutExecutor.prototype.removeClass = function (el, cl) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.removeClass.call(_this, el, cl);
        }, 0);
    };
    TimeoutExecutor.prototype.setAttribute = function (el, name, value) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.setAttribute.call(_this, el, name, value);
        }, 0);
    };
    TimeoutExecutor.prototype.removeAttribute = function (el, name) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.removeAttribute.call(_this, el, name);
        }, 0);
    };
    TimeoutExecutor.prototype.setStyle = function (el, prop, value) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.setStyle.call(_this, el, prop, value);
        }, 0);
    };
    TimeoutExecutor.prototype.insertBefore = function (target, child) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.insertBefore.call(_this, target, child);
        }, 0);
    };
    TimeoutExecutor.prototype.appendChild = function (el, child) {
        var _this = this;
        setTimeout(function () {
            _super.prototype.appendChild.call(_this, el, child);
        }, 0);
    };
    TimeoutExecutor.prototype.callCallback = function (cb) {
        setTimeout(cb, 0);
    };
    return TimeoutExecutor;
}(InstantExecutor));

var instantExecutor = new InstantExecutor();
var timeoutExecutor = new TimeoutExecutor();

window.Executor = Executor;
window.InstantExecutor = InstantExecutor;
window.TimeoutExecutor = TimeoutExecutor;
window.instantExecutor = instantExecutor;
window.timeoutExecutor = timeoutExecutor;

// ./lib-es5/core/destroyable.js
/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
var Destroyable = /** @class */ (function () {
    function Destroyable() {
    }
    /**
     * Make object fields non configurable
     * @protected
     */
    Destroyable.prototype.$seal = function () {
        var _this = this;
        var $ = this;
        Object.keys($).forEach(function (i) {
            // eslint-disable-next-line no-prototype-builtins
            if (_this.hasOwnProperty(i)) {
                var config = Object.getOwnPropertyDescriptor($, i);
                if (config.configurable) {
                    var descriptor = void 0;
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
    };
    /**
     * Garbage collector method
     */
    Destroyable.prototype.$destroy = function () {
        // nothing here
    };
    return Destroyable;
}());


window.Destroyable = Destroyable;

// ./lib-es5/core/ivalue.js
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
var IValue = /** @class */ (function (_super) {
    __extends(IValue, _super);
    /**
     * @param isEnabled {boolean} initial is enabled state
     */
    function IValue(isEnabled) {
        var _this = this; _super.call(this);
        _this.isEnabled = isEnabled;
        return _this;
    }
    Object.defineProperty(IValue.prototype, "$", {
        /**
         * Get the encapsulated value
         * @return {*} the encapsulated value
         */
        get: function () {
            throw notOverwritten();
        },
        /**
         * Sets the encapsulated value
         * @param value {*} value to encapsulate
         */
        set: function (value) {
            throw notOverwritten();
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    IValue.prototype.on = function (handler) {
        throw notOverwritten();
    };
    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    IValue.prototype.off = function (handler) {
        throw notOverwritten();
    };
    /**
     * Enable update handlers triggering
     */
    IValue.prototype.enable = function () {
        throw notOverwritten();
    };
    /**
     * disable update handlers triggering
     */
    IValue.prototype.disable = function () {
        throw notOverwritten();
    };
    return IValue;
}(Destroyable));


window.IValue = IValue;

// ./lib-es5/index.js



// ./lib-es5/value/expression.js
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
var Expression = /** @class */ (function (_super) {
    __extends(Expression, _super);
    function Expression(func, link, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        var _this = _super.call(this, false) || this;
        /**
         * Expression will link different handler for each value of list
         */
        _this.linkedFunc = [];
        var values = [v1, v2, v3, v4, v5, v6, v7, v8, v9].filter(function (v) { return v instanceof IValue; });
        var handler = function (i) {
            if (i != null) {
                _this.valuesCache[i] = _this.values[i].$;
            }
            _this.sync.$ = func.apply(_this, _this.valuesCache);
        };
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _this.valuesCache = values.map(function (iValue) { return iValue.$; });
        _this.sync = new Reference(func.apply(_this, _this.valuesCache));
        var i = 0;
        values.forEach(function () {
            _this.linkedFunc.push(handler.bind(_this, Number(i++)));
        });
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        _this.values = values;
        _this.func = handler;
        if (link) {
            _this.enable();
        }
        else {
            handler();
        }
        _this.$seal();
        return _this;
    }
    Object.defineProperty(Expression.prototype, "$", {
        get: function () {
            return this.sync.$;
        },
        set: function (value) {
            this.sync.$ = value;
        },
        enumerable: false,
        configurable: true
    });
    Expression.prototype.on = function (handler) {
        this.sync.on(handler);
        return this;
    };
    Expression.prototype.off = function (handler) {
        this.sync.off(handler);
        return this;
    };
    Expression.prototype.enable = function () {
        if (!this.isEnabled) {
            for (var i = 0; i < this.values.length; i++) {
                this.values[i].on(this.linkedFunc[i]);
                this.valuesCache[i] = this.values[i].$;
            }
            this.func();
            this.isEnabled = true;
        }
        return this;
    };
    Expression.prototype.disable = function () {
        if (this.isEnabled) {
            for (var i = 0; i < this.values.length; i++) {
                this.values[i].off(this.linkedFunc[i]);
            }
            this.isEnabled = false;
        }
        return this;
    };
    Expression.prototype.$destroy = function () {
        this.disable();
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
        _super.prototype.$destroy.call(this);
    };
    return Expression;
}(IValue));


window.Expression = Expression;

// ./lib-es5/value/reference.js
/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
var Reference = /** @class */ (function (_super) {
    __extends(Reference, _super);
    /**
     * @param value {any} the initial value
     */
    function Reference(value) {
        var _this = _super.call(this, true) || this;
        _this.value = value;
        _this.onchange = new Set;
        _this.$seal();
        return _this;
    }
    Object.defineProperty(Reference.prototype, "$", {
        get: function () {
            return this.value;
        },
        set: function (value) {
            if (this.value !== value) {
                this.value = value;
                if (this.isEnabled) {
                    this.onchange.forEach(function (handler) {
                        handler(value);
                    });
                }
            }
        },
        enumerable: false,
        configurable: true
    });
    Reference.prototype.enable = function () {
        var _this = this;
        if (!this.isEnabled) {
            this.onchange.forEach(function (handler) {
                handler(_this.value);
            });
            this.isEnabled = true;
        }
        return this;
    };
    Reference.prototype.disable = function () {
        this.isEnabled = false;
        return this;
    };
    Reference.prototype.on = function (handler) {
        this.onchange.add(handler);
        return this;
    };
    Reference.prototype.off = function (handler) {
        this.onchange.delete(handler);
        return this;
    };
    Reference.prototype.$destroy = function () {
        _super.prototype.$destroy.call(this);
        this.onchange.clear();
    };
    return Reference;
}(IValue));


window.Reference = Reference;

// ./lib-es5/value/mirror.js
/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
var Mirror = /** @class */ (function (_super) {
    __extends(Mirror, _super);
    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    function Mirror(value, forwardOnly) {
        if (forwardOnly === void 0) { forwardOnly = false; }
        var _this = _super.call(this, value.$) || this;
        _this.handler = function (v) {
            _this.$ = v;
        };
        _this.pointedValue = value;
        _this.forwardOnly = forwardOnly;
        value.on(_this.handler);
        _this.$seal();
        return _this;
    }
    Object.defineProperty(Mirror.prototype, "$", {
        get: function () {
            // this is a ts bug
            // eslint-disable-next-line
            // @ts-ignore
            return _super.prototype.$;
        },
        set: function (v) {
            // this is a ts bug
            // eslint-disable-next-line
            // @ts-ignore
            _super.prototype.$ = v;
            if (!this.forwardOnly) {
                this.pointedValue.$ = v;
            }
        },
        enumerable: false,
        configurable: true
    });
    Mirror.prototype.enable = function () {
        if (!this.isEnabled) {
            this.isEnabled = true;
            this.pointedValue.on(this.handler);
            this.$ = this.pointedValue.$;
        }
        return this;
    };
    Mirror.prototype.disable = function () {
        if (this.isEnabled) {
            this.pointedValue.off(this.handler);
            this.isEnabled = false;
        }
        return this;
    };
    Mirror.prototype.$destroy = function () {
        this.disable();
        _super.prototype.$destroy.call(this);
    };
    return Mirror;
}(Reference));


window.Mirror = Mirror;

// ./lib-es5/value/pointer.js
/**
 * r/w pointer to a value
 * @class Pointer
 * @extends Mirror
 */
var Pointer = /** @class */ (function (_super) {
    __extends(Pointer, _super);
    /**
     * @param value {IValue} value to point
     * @param forwardOnly {boolean} forward only data flow
     */
    function Pointer(value, forwardOnly) {
        if (forwardOnly === void 0) { forwardOnly = false; }
        return _super.call(this, value, forwardOnly) || this;
    }
    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    Pointer.prototype.point = function (value) {
        if (this.pointedValue !== value) {
            this.disable();
            this.pointedValue = value;
            this.enable();
        }
    };
    return Pointer;
}(Mirror));


window.Pointer = Pointer;

// ./lib-es5/binding/binding.js
/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
var Binding = /** @class */ (function (_super) {
    __extends(Binding, _super);
    /**
     * Constructs a common binding logic
     * @param node {INode} the vasille node
     * @param name {String} the name of property/attribute/class
     * @param value {IValue} the value to bind
     */
    function Binding(node, name, value) {
        var _this = this; _super.call(this);
        _this.updateFunc = _this.bound(name).bind(null, node);
        _this.binding = value;
        _this.binding.on(_this.updateFunc);
        _this.updateFunc(_this.binding.$);
        _this.$seal();
        return _this;
    }
    /**
     * Is a virtual function to get the specific bind function
     * @param name {String} the name of attribute/property
     * @returns {Function} a function to update attribute/property value
     * @throws Always throws and must be overloaded in child class
     */
    Binding.prototype.bound = function (name) {
        throw notOverwritten();
    };
    /**
     * Just clear bindings
     */
    Binding.prototype.$destroy = function () {
        this.binding.off(this.updateFunc);
        _super.prototype.$destroy.call(this);
    };
    return Binding;
}(Destroyable));


window.Binding = Binding;

// ./lib-es5/core/core.js
/**
 * Private stuff of a reactive object
 * @class ReactivePrivate
 * @extends Destroyable
 */
var ReactivePrivate = /** @class */ (function (_super) {
    __extends(ReactivePrivate, _super);
    function ReactivePrivate() {
        var _this = this; _super.call(this);
        /**
         * A list of user-defined values
         * @type {Set}
         */
        _this.watch = new Set;
        /**
         * A list of user-defined bindings
         * @type {Set}
         */
        _this.bindings = new Set;
        /**
         * A list of user defined models
         */
        _this.models = new Set;
        /**
         * Reactivity switch state
         * @type {boolean}
         */
        _this.enabled = true;
        /**
         * The frozen state of object
         * @type {boolean}
         */
        _this.frozen = false;
        _this.$seal();
        return _this;
    }
    ReactivePrivate.prototype.$destroy = function () {
        var _a;
        this.watch.forEach(function (value) { return value.$destroy(); });
        this.watch.clear();
        this.bindings.forEach(function (binding) { return binding.$destroy(); });
        this.bindings.clear();
        (_a = this.freezeExpr) === null || _a === void 0 ? void 0 : _a.$destroy();
        _super.prototype.$destroy.call(this);
    };
    return ReactivePrivate;
}(Destroyable));

/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
var Reactive = /** @class */ (function (_super) {
    __extends(Reactive, _super);
    function Reactive($) {
        var _this = this; _super.call(this);
        _this.$ = $ || new ReactivePrivate;
        return _this;
    }
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    Reactive.prototype.$ref = function (value) {
        var $ = this.$;
        var ref = new Reference(value);
        $.watch.add(ref);
        return ref;
    };
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     * @param forwardOnly {boolean} forward only sync
     */
    Reactive.prototype.$mirror = function (value, forwardOnly) {
        if (forwardOnly === void 0) { forwardOnly = false; }
        var mirror = new Mirror(value, forwardOnly);
        this.$.watch.add(mirror);
        return mirror;
    };
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    Reactive.prototype.$point = function (value, forwardOnly) {
        if (forwardOnly === void 0) { forwardOnly = false; }
        var $ = this.$;
        var ref = value instanceof IValue ? value : new Reference(value);
        var pointer = new Pointer(ref, forwardOnly);
        // when value is an ivalue will be equal to ref
        if (value !== ref) {
            $.watch.add(ref);
        }
        $.watch.add(pointer);
        return pointer;
    };
    /**
     * Register a model
     * @param model
     */
    Reactive.prototype.$register = function (model) {
        this.$.models.add(model);
        return model;
    };
    Reactive.prototype.$watch = function (func, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        var $ = this.$;
        $.watch.add(new Expression(func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9));
    };
    Reactive.prototype.$bind = function (func, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        var res = new Expression(func, !this.$.frozen, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        var $ = this.$;
        $.watch.add(res);
        return res;
    };
    /**
     * Enable reactivity of fields
     */
    Reactive.prototype.$enable = function () {
        var $ = this.$;
        if (!$.enabled) {
            $.watch.forEach(function (watcher) {
                watcher.enable();
            });
            $.models.forEach(function (model) {
                model.enableReactivity();
            });
            $.enabled = true;
        }
    };
    /**
     * Disable reactivity of fields
     */
    Reactive.prototype.$disable = function () {
        var $ = this.$;
        if ($.enabled) {
            $.watch.forEach(function (watcher) {
                watcher.disable();
            });
            $.models.forEach(function (model) {
                model.disableReactivity();
            });
            $.enabled = false;
        }
    };
    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    Reactive.prototype.$bindAlive = function (cond, onOff, onOn) {
        var _this = this;
        var $ = this.$;
        if ($.freezeExpr) {
            throw wrongBinding("this component already have a freeze state");
        }
        if ($.watch.has(cond)) {
            throw wrongBinding("freeze state must be bound to an external component");
        }
        $.freezeExpr = new Expression(function (cond) {
            $.frozen = !cond;
            if (cond) {
                onOn === null || onOn === void 0 ? void 0 : onOn();
                _this.$enable();
            }
            else {
                onOff === null || onOff === void 0 ? void 0 : onOff();
                _this.$disable();
            }
        }, true, cond);
        return this;
    };
    Reactive.prototype.$destroy = function () {
        _super.prototype.$destroy.call(this);
        this.$.$destroy();
        this.$ = null;
    };
    return Reactive;
}(Destroyable));


window.ReactivePrivate = ReactivePrivate;
window.Reactive = Reactive;

// ./lib-es5/node/node.js
/**
 * Represents a Vasille.js node
 * @class FragmentPrivate
 * @extends ReactivePrivate
 */
var FragmentPrivate = /** @class */ (function (_super) {
    __extends(FragmentPrivate, _super);
    function FragmentPrivate() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    /**
     * Pre-initializes the base of a fragment
     * @param app {App} the app node
     * @param parent {Fragment} the parent node
     */
    FragmentPrivate.prototype.preinit = function (app, parent) {
        this.app = app;
        this.parent = parent;
    };
    /**
     * Unlinks all bindings
     */
    FragmentPrivate.prototype.$destroy = function () {
        this.next = null;
        this.prev = null;
        _super.prototype.$destroy.call(this);
    };
    return FragmentPrivate;
}(ReactivePrivate));

/**
 * This class is symbolic
 * @extends Reactive
 */
var Fragment = /** @class */ (function (_super) {
    __extends(Fragment, _super);
    /**
     * Constructs a Vasille Node
     * @param $ {FragmentPrivate}
     */
    function Fragment($) {
        var _this = this; _super.call(this);
        /**
         * The children list
         * @type Array
         */
        _this.$children = [];
        _this.$ = $ || new FragmentPrivate;
        return _this;
    }
    Object.defineProperty(Fragment.prototype, "app", {
        /**
         * Gets the app of node
         */
        get: function () {
            return this.$.app;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Prepare to init fragment
     * @param app {AppNode} app of node
     * @param parent {Fragment} parent of node
     * @param data {*} additional data
     */
    Fragment.prototype.$preinit = function (app, parent, data) {
        var $ = this.$;
        $.preinit(app, parent);
    };
    /**
     * Initialize node
     */
    Fragment.prototype.$init = function () {
        this.$createSignals();
        this.$createWatchers();
        this.$created();
        this.$compose();
        this.$mounted();
        return this;
    };
    /** To be overloaded: created event handler */
    Fragment.prototype.$created = function () {
        // empty
    };
    /** To be overloaded: mounted event handler */
    Fragment.prototype.$mounted = function () {
        // empty
    };
    /** To be overloaded: ready event handler */
    Fragment.prototype.$ready = function () {
        // empty
    };
    /** To be overloaded: signals creation milestone */
    Fragment.prototype.$createSignals = function () {
        // empty
    };
    /** To be overloaded: watchers creation milestone */
    Fragment.prototype.$createWatchers = function () {
        // empty
    };
    /** To be overloaded: DOM creation milestone */
    Fragment.prototype.$compose = function () {
        // empty
    };
    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    Fragment.prototype.$$pushNode = function (node) {
        var lastChild = null;
        if (this.$children.length) {
            lastChild = this.$children[this.$children.length - 1];
        }
        if (lastChild) {
            lastChild.$.next = node;
        }
        node.$.prev = lastChild;
        node.$.parent = this;
        this.$children.push(node);
    };
    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    Fragment.prototype.$$findFirstChild = function () {
        var first;
        this.$children.forEach(function (child) {
            first = first || child.$$findFirstChild();
        });
        return first;
    };
    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    Fragment.prototype.$$appendNode = function (node) {
        var $ = this.$;
        if ($.next) {
            $.next.$$insertAdjacent(node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    };
    /**
     * Insert a node as a sibling of this
     * @param node {Node} node to insert
     */
    Fragment.prototype.$$insertAdjacent = function (node) {
        var child = this.$$findFirstChild();
        var $ = this.$;
        if (child) {
            $.app.$run.insertBefore(child, node);
        }
        else if ($.next) {
            $.next.$$insertAdjacent(node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    };
    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    Fragment.prototype.$text = function (text, cb) {
        var $ = this.$;
        var node = new TextNode();
        var textValue = text instanceof IValue ? text : this.$ref(text);
        node.$preinit($.app, this, textValue);
        this.$$pushNode(node);
        if (cb) {
            $.app.$run.callCallback(function () {
                cb(node);
            });
        }
        return this;
    };
    Fragment.prototype.$debug = function (text) {
        var node = new DebugNode();
        node.$preinit(this.$.app, this, text);
        this.$$pushNode(node);
        return this;
    };
    Fragment.prototype.$tag = function (tagName, cb) {
        var $ = this.$;
        var node = new Tag();
        node.$preinit($.app, this, tagName);
        node.$init();
        this.$$pushNode(node);
        $.app.$run.callCallback(function () {
            if (cb) {
                cb(node, node.node);
            }
            node.$ready();
        });
        return this;
    };
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     * @param callback1 {function($ : *)}
     */
    Fragment.prototype.$create = function (node, callback, callback1) {
        var $ = this.$;
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
    };
    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    Fragment.prototype.$if = function (cond, cb) {
        return this.$switch({ cond: cond, cb: cb });
    };
    /**
     * Defines a if-else node
     * @param ifCond {IValue} `if` condition
     * @param ifCb {function(Fragment)} Call-back to create `if` child nodes
     * @param elseCb {function(Fragment)} Call-back to create `else` child nodes
     */
    Fragment.prototype.$if_else = function (ifCond, ifCb, elseCb) {
        return this.$switch({ cond: ifCond, cb: ifCb }, { cond: trueIValue, cb: elseCb });
    };
    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue, cb : function(Fragment) }} cases
     * @return {INode}
     */
    Fragment.prototype.$switch = function () {
        var cases = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cases[_i] = arguments[_i];
        }
        var $ = this.$;
        var node = new SwitchedNode();
        node.$preinit($.app, this);
        node.$init();
        this.$$pushNode(node);
        node.setCases(cases);
        node.$ready();
        return this;
    };
    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    Fragment.prototype.$case = function (cond, cb) {
        return { cond: cond, cb: cb };
    };
    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    Fragment.prototype.$default = function (cb) {
        return { cond: trueIValue, cb: cb };
    };
    Fragment.prototype.$destroy = function () {
        for (var _i = 0, _a = this.$children; _i < _a.length; _i++) {
            var child = _a[_i];
            child.$destroy();
        }
        this.$children.splice(0);
        _super.prototype.$destroy.call(this);
    };
    return Fragment;
}(Reactive));

var trueIValue = new Reference(true);
/**
 * The private part of a text node
 * @class TextNodePrivate
 * @extends FragmentPrivate
 */
var TextNodePrivate = /** @class */ (function (_super) {
    __extends(TextNodePrivate, _super);
    function TextNodePrivate() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param text {IValue}
     */
    TextNodePrivate.prototype.preinitText = function (app, parent, text) {
        var _this = this;
        _super.prototype.preinit.call(this, app, parent);
        this.node = document.createTextNode(text.$);
        this.bindings.add(new Expression(function (v) {
            _this.node.replaceData(0, -1, v);
        }, true, text));
        this.parent.$$appendNode(this.node);
    };
    /**
     * Clear node data
     */
    TextNodePrivate.prototype.$destroy = function () {
        _super.prototype.$destroy.call(this);
    };
    return TextNodePrivate;
}(FragmentPrivate));

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
var TextNode = /** @class */ (function (_super) {
    __extends(TextNode, _super);
    function TextNode() {
        var _this = this; _super.call(this);
        _this.$ = new TextNodePrivate();
        _this.$seal();
        return _this;
    }
    TextNode.prototype.$preinit = function (app, parent, text) {
        var $ = this.$;
        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }
        $.preinitText(app, parent, text);
    };
    TextNode.prototype.$$findFirstChild = function () {
        return this.$.node;
    };
    TextNode.prototype.$destroy = function () {
        this.$.node.remove();
        this.$.$destroy();
        _super.prototype.$destroy.call(this);
    };
    return TextNode;
}(Fragment));

/**
 * The private part of a base node
 * @class INodePrivate
 * @extends FragmentPrivate
 */
var INodePrivate = /** @class */ (function (_super) {
    __extends(INodePrivate, _super);
    function INodePrivate() {
        var _this = this; _super.call(this);
        /**
         * Defines if node is unmounted
         * @type {boolean}
         */
        _this.unmounted = false;
        _this.$seal();
        return _this;
    }
    INodePrivate.prototype.$destroy = function () {
        _super.prototype.$destroy.call(this);
    };
    return INodePrivate;
}(FragmentPrivate));

/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
var INode = /** @class */ (function (_super) {
    __extends(INode, _super);
    /**
     * Constructs a base node
     * @param $ {?INodePrivate}
     */
    function INode($) {
        var _this = _super.call(this, $ || new INodePrivate) || this;
        _this.$seal();
        return _this;
    }
    Object.defineProperty(INode.prototype, "node", {
        /**
         * Get the bound node
         */
        get: function () {
            return this.$.node;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Initialize node
     */
    INode.prototype.$init = function () {
        this.$createSignals();
        this.$createWatchers();
        this.$createAttrs();
        this.$createStyle();
        this.$created();
        this.$compose();
        this.$mounted();
        return this;
    };
    /** To be overloaded: attributes creation milestone */
    INode.prototype.$createAttrs = function () {
        // empty
    };
    /** To be overloaded: $style attributes creation milestone */
    INode.prototype.$createStyle = function () {
        // empty
    };
    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    INode.prototype.$attr = function (name, value) {
        var $ = this.$;
        var attr = new AttributeBinding(this, name, value);
        $.bindings.add(attr);
        return this;
    };
    INode.prototype.$bindAttr = function (name, calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        var $ = this.$;
        var expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        $.bindings.add(new AttributeBinding(this, name, expr));
        return this;
    };
    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    INode.prototype.$setAttr = function (name, value) {
        this.$.app.$run.setAttribute(this.$.node, name, value);
        return this;
    };
    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    INode.prototype.$addClass = function (cl) {
        this.$.app.$run.addClass(this.$.node, cl);
        return this;
    };
    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    INode.prototype.$addClasses = function () {
        var _this = this;
        var cls = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            cls[_i] = arguments[_i];
        }
        cls.forEach(function (cl) {
            _this.$.app.$run.addClass(_this.$.node, cl);
        });
        return this;
    };
    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    INode.prototype.$bindClass = function (className) {
        var $ = this.$;
        $.bindings.add(new ClassBinding(this, "", className));
        return this;
    };
    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    INode.prototype.$floatingClass = function (cond, className) {
        this.$.bindings.add(new ClassBinding(this, className, cond));
        return this;
    };
    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    INode.prototype.$style = function (name, value) {
        var $ = this.$;
        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, value));
        }
        else {
            throw userError('style can be applied to HTML elements only', 'non-html-element');
        }
        return this;
    };
    INode.prototype.$bindStyle = function (name, calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9) {
        var $ = this.$;
        var expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);
        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, expr));
        }
        else {
            throw userError('style can be applied to HTML elements only', 'non-html-element');
        }
        return this;
    };
    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     */
    INode.prototype.$setStyle = function (prop, value) {
        if (this.$.node instanceof HTMLElement) {
            this.$.app.$run.setStyle(this.$.node, prop, value);
        }
        else {
            throw userError("Style can be setted for HTML elements only", "non-html-element");
        }
        return this;
    };
    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     */
    INode.prototype.$listen = function (name, handler, options) {
        this.$.node.addEventListener(name, handler, options);
        return this;
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$oncontextmenu = function (handler, options) {
        return this.$listen("contextmenu", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmousedown = function (handler, options) {
        return this.$listen("mousedown", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmouseenter = function (handler, options) {
        return this.$listen("mouseenter", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmouseleave = function (handler, options) {
        return this.$listen("mouseleave", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmousemove = function (handler, options) {
        return this.$listen("mousemove", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmouseout = function (handler, options) {
        return this.$listen("mouseout", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmouseover = function (handler, options) {
        return this.$listen("mouseover", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onmouseup = function (handler, options) {
        return this.$listen("mouseup", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onclick = function (handler, options) {
        return this.$listen("click", handler, options);
    };
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondblclick = function (handler, options) {
        return this.$listen("dblclick", handler, options);
    };
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onblur = function (handler, options) {
        return this.$listen("blur", handler, options);
    };
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onfocus = function (handler, options) {
        return this.$listen("focus", handler, options);
    };
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onfocusin = function (handler, options) {
        return this.$listen("focusin", handler, options);
    };
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onfocusout = function (handler, options) {
        return this.$listen("focusout", handler, options);
    };
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onkeydown = function (handler, options) {
        return this.$listen("keydown", handler, options);
    };
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onkeyup = function (handler, options) {
        return this.$listen("keyup", handler, options);
    };
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onkeypress = function (handler, options) {
        return this.$listen("keypress", handler, options);
    };
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ontouchstart = function (handler, options) {
        return this.$listen("touchstart", handler, options);
    };
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ontouchmove = function (handler, options) {
        return this.$listen("touchmove", handler, options);
    };
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ontouchend = function (handler, options) {
        return this.$listen("touchend", handler, options);
    };
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ontouchcancel = function (handler, options) {
        return this.$listen("touchcancel", handler, options);
    };
    /**
     * @param handler {function (WheelEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onwheel = function (handler, options) {
        return this.$listen("wheel", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onabort = function (handler, options) {
        return this.$listen("abort", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onerror = function (handler, options) {
        return this.$listen("error", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onload = function (handler, options) {
        return this.$listen("load", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onloadend = function (handler, options) {
        return this.$listen("loadend", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onloadstart = function (handler, options) {
        return this.$listen("loadstart", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onprogress = function (handler, options) {
        return this.$listen("progress", handler, options);
    };
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ontimeout = function (handler, options) {
        return this.$listen("timeout", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondrag = function (handler, options) {
        return this.$listen("drag", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragend = function (handler, options) {
        return this.$listen("dragend", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragenter = function (handler, options) {
        return this.$listen("dragenter", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragexit = function (handler, options) {
        return this.$listen("dragexit", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragleave = function (handler, options) {
        return this.$listen("dragleave", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragover = function (handler, options) {
        return this.$listen("dragover", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondragstart = function (handler, options) {
        return this.$listen("dragstart", handler, options);
    };
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ondrop = function (handler, options) {
        return this.$listen("drop", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerover = function (handler, options) {
        return this.$listen("pointerover", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerenter = function (handler, options) {
        return this.$listen("pointerenter", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerdown = function (handler, options) {
        return this.$listen("pointerdown", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointermove = function (handler, options) {
        return this.$listen("pointermove", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerup = function (handler, options) {
        return this.$listen("pointerup", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointercancel = function (handler, options) {
        return this.$listen("pointercancel", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerout = function (handler, options) {
        return this.$listen("pointerout", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpointerleave = function (handler, options) {
        return this.$listen("pointerleave", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$ongotpointercapture = function (handler, options) {
        return this.$listen("gotpointercapture", handler, options);
    };
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onlostpointercapture = function (handler, options) {
        return this.$listen("lostpointercapture", handler, options);
    };
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onanimationstart = function (handler, options) {
        return this.$listen("animationstart", handler, options);
    };
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onanimationend = function (handler, options) {
        return this.$listen("animationend", handler, options);
    };
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onanimationiteraton = function (handler, options) {
        return this.$listen("animationiteration", handler, options);
    };
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onclipboardchange = function (handler, options) {
        return this.$listen("clipboardchange", handler, options);
    };
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$oncut = function (handler, options) {
        return this.$listen("cut", handler, options);
    };
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$oncopy = function (handler, options) {
        return this.$listen("copy", handler, options);
    };
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    INode.prototype.$onpaste = function (handler, options) {
        return this.$listen("paste", handler, options);
    };
    INode.prototype.$$insertAdjacent = function (node) {
        var $ = this.$;
        $.app.$run.insertBefore($.node, node);
    };
    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    INode.prototype.$bindShow = function (cond) {
        var $ = this.$;
        var node = $.node;
        if (node instanceof HTMLElement) {
            var lastDisplay_1 = node.style.display;
            var htmlNode_1 = node;
            return this.$bindAlive(cond, function () {
                lastDisplay_1 = htmlNode_1.style.display;
                htmlNode_1.style.display = 'none';
            }, function () {
                htmlNode_1.style.display = lastDisplay_1;
            });
        }
        else {
            throw userError('the element must be a html element', 'bind-show');
        }
    };
    /**
     * bind HTML
     * @param value {IValue}
     */
    INode.prototype.$html = function (value) {
        var $ = this.$;
        var node = $.node;
        if (node instanceof HTMLElement) {
            node.innerHTML = value.$;
            this.$watch(function (v) {
                node.innerHTML = v;
            }, value);
        }
        else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    };
    return INode;
}(Fragment));

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
var Tag = /** @class */ (function (_super) {
    __extends(Tag, _super);
    function Tag() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    Tag.prototype.$preinit = function (app, parent, tagName) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError('wrong Tag::$preinit call');
        }
        var node = document.createElement(tagName);
        var $ = this.$;
        $.preinit(app, parent);
        $.node = node;
        $.parent.$$appendNode(node);
    };
    Tag.prototype.$$findFirstChild = function () {
        return this.$.unmounted ? null : this.$.node;
    };
    Tag.prototype.$$insertAdjacent = function (node) {
        if (this.$.unmounted) {
            if (this.$.next) {
                this.$.next.$$insertAdjacent(node);
            }
            else {
                this.$.parent.$$appendNode(node);
            }
        }
        else {
            _super.prototype.$$insertAdjacent.call(this, node);
        }
    };
    Tag.prototype.$$appendNode = function (node) {
        var $ = this.$;
        $.app.$run.appendChild($.node, node);
    };
    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    Tag.prototype.$bindMount = function (cond) {
        var $ = this.$;
        return this.$bindAlive(cond, function () {
            $.node.remove();
            $.unmounted = true;
        }, function () {
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
    };
    /**
     * Runs GC
     */
    Tag.prototype.$destroy = function () {
        this.node.remove();
        _super.prototype.$destroy.call(this);
    };
    return Tag;
}(INode));

/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
var Extension = /** @class */ (function (_super) {
    __extends(Extension, _super);
    function Extension($) {
        var _this = _super.call(this, $) || this;
        _this.$seal();
        return _this;
    }
    Extension.prototype.$preinit = function (app, parent) {
        if (parent instanceof INode) {
            var $ = this.$;
            $.preinit(app, parent);
            $.node = parent.node;
        }
        else {
            throw internalError("A extension node can be encapsulated only in a tag/extension/component");
        }
    };
    Extension.prototype.$destroy = function () {
        _super.prototype.$destroy.call(this);
    };
    return Extension;
}(INode));

/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
var Component = /** @class */ (function (_super) {
    __extends(Component, _super);
    function Component() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    Component.prototype.$mounted = function () {
        _super.prototype.$mounted.call(this);
        if (this.$children.length !== 1) {
            throw userError("UserNode must have a child only", "dom-error");
        }
        var child = this.$children[0];
        if (child instanceof Tag || child instanceof Component) {
            var $ = this.$;
            $.node = child.node;
        }
        else {
            throw userError("UserNode child must be Tag or Component", "dom-error");
        }
    };
    return Component;
}(Extension));

/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
var SwitchedNodePrivate = /** @class */ (function (_super) {
    __extends(SwitchedNodePrivate, _super);
    function SwitchedNodePrivate() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    /**
     * Runs GC
     */
    SwitchedNodePrivate.prototype.$destroy = function () {
        this.cases.forEach(function (c) {
            delete c.cond;
            delete c.cb;
        });
        this.cases.splice(0);
        _super.prototype.$destroy.call(this);
    };
    return SwitchedNodePrivate;
}(INodePrivate));

/**
 * Defines a node witch can switch its children conditionally
 */
var SwitchedNode = /** @class */ (function (_super) {
    __extends(SwitchedNode, _super);
    /**
     * Constructs a switch node and define a sync function
     */
    function SwitchedNode() {
        var _this = _super.call(this, new SwitchedNodePrivate) || this;
        _this.$.sync = function () {
            var $ = _this.$;
            var i = 0;
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
                _this.$children.splice(0);
                $.fragment = null;
            }
            if (i !== $.cases.length) {
                $.index = i;
                _this.createChild($.cases[i].cb);
            }
            else {
                $.index = -1;
            }
        };
        _this.$seal();
        return _this;
    }
    /**
     * Set up switch cases
     * @param cases {{ cond : IValue, cb : function(Fragment) }}
     */
    SwitchedNode.prototype.setCases = function (cases) {
        var $ = this.$;
        $.cases = __spreadArray([], cases, true);
    };
    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    SwitchedNode.prototype.createChild = function (cb) {
        var node = new Fragment();
        node.$preinit(this.$.app, this);
        node.$init();
        node.$ready();
        this.$.fragment = node;
        this.$children.push(node);
        cb(node);
    };
    SwitchedNode.prototype.$ready = function () {
        var $ = this.$;
        _super.prototype.$ready.call(this);
        $.cases.forEach(function (c) {
            c.cond.on($.sync);
        });
        $.sync();
    };
    SwitchedNode.prototype.$destroy = function () {
        var $ = this.$;
        $.cases.forEach(function (c) {
            c.cond.off($.sync);
        });
        _super.prototype.$destroy.call(this);
    };
    return SwitchedNode;
}(Fragment));
/**
 * The private part of a text node
 */
var DebugPrivate = /** @class */ (function (_super) {
    __extends(DebugPrivate, _super);
    function DebugPrivate() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param parent {Fragment} parent node
     * @param text {String | IValue}
     */
    DebugPrivate.prototype.preinitComment = function (app, parent, text) {
        var _this = this;
        _super.prototype.preinit.call(this, app, parent);
        this.node = document.createComment(text.$);
        this.bindings.add(new Expression(function (v) {
            _this.node.replaceData(0, -1, v);
        }, true, text));
        this.parent.$$appendNode(this.node);
    };
    /**
     * Clear node data
     */
    DebugPrivate.prototype.$destroy = function () {
        this.node.remove();
        _super.prototype.$destroy.call(this);
    };
    return DebugPrivate;
}(FragmentPrivate));

/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
var DebugNode = /** @class */ (function (_super) {
    __extends(DebugNode, _super);
    function DebugNode() {
        var _this = this; _super.call(this);
        /**
         * private data
         * @type {DebugNode}
         */
        _this.$ = new DebugPrivate();
        _this.$seal();
        return _this;
    }
    DebugNode.prototype.$preinit = function (app, parent, text) {
        var $ = this.$;
        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }
        $.preinitComment(app, parent, text);
    };
    /**
     * Runs garbage collector
     */
    DebugNode.prototype.$destroy = function () {
        this.$.$destroy();
        _super.prototype.$destroy.call(this);
    };
    return DebugNode;
}(Fragment));


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

// ./lib-es5/node/app.js
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
var AppNode = /** @class */ (function (_super) {
    __extends(AppNode, _super);
    /**
     * @param options {Object} Application options
     */
    function AppNode(options) {
        var _this = this; _super.call(this);
        _this.$run = (options === null || options === void 0 ? void 0 : options.executor) || ((options === null || options === void 0 ? void 0 : options.freezeUi) === false ? timeoutExecutor : instantExecutor);
        return _this;
    }
    return AppNode;
}(INode));

/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
var App = /** @class */ (function (_super) {
    __extends(App, _super);
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param options {Object} Application options
     */
    function App(node, options) {
        var _this = _super.call(this, options) || this;
        _this.$.node = node;
        _this.$preinit(_this, _this);
        _this.$seal();
        return _this;
    }
    App.prototype.$$appendNode = function (node) {
        var $ = this.$;
        $.app.$run.appendChild($.node, node);
    };
    return App;
}(AppNode));


window.AppNode = AppNode;
window.App = App;

// ./lib-es5/node/interceptor.js
/**
 * Interceptor is designed to connect signals & methods of children elements
 * @class Interceptor
 * @extends Destroyable
 */
var Interceptor = /** @class */ (function (_super) {
    __extends(Interceptor, _super);
    function Interceptor() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Set of signals
         * @type Set
         */
        _this.signals = new Set;
        /**
         * Set of handlers
         * @type Set
         */
        _this.handlers = new Set;
        return _this;
    }
    /**
     * Connect a signal or a handler
     * @param thing {Signal | function}
     */
    Interceptor.prototype.connect = function (thing) {
        // interceptor will connect signals and handlers together
        if (thing instanceof Signal) {
            this.handlers.forEach(function (handler) {
                thing.subscribe(handler);
            });
            this.signals.add(thing);
        }
        else {
            this.signals.forEach(function (signal) {
                signal.subscribe(thing);
            });
            this.handlers.add(thing);
        }
    };
    /**
     * Disconnect a handler from signals
     * @param handler {function}
     */
    Interceptor.prototype.disconnect = function (handler) {
        this.signals.forEach(function (signal) {
            signal.unsubscribe(handler);
        });
    };
    Interceptor.prototype.$destroy = function () {
        var _this = this;
        _super.prototype.$destroy.call(this);
        this.signals.forEach(function (signal) {
            _this.handlers.forEach(function (handler) {
                signal.unsubscribe(handler);
            });
        });
    };
    return Interceptor;
}(Destroyable));

/**
 * Interceptor node to implement directly to vasille DOM
 * @class InterceptorNode
 * @extends Extension
 */
var InterceptorNode = /** @class */ (function (_super) {
    __extends(InterceptorNode, _super);
    function InterceptorNode() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        /**
         * Internal interceptor
         * @type Interceptor
         */
        _this.interceptor = new Interceptor;
        /**
         * The default slot of node
         * @type Slot
         */
        _this.slot = new Slot;
        return _this;
    }
    InterceptorNode.prototype.$compose = function () {
        this.slot.release(this, this.interceptor);
    };
    return InterceptorNode;
}(Fragment));


window.Interceptor = Interceptor;
window.InterceptorNode = InterceptorNode;

// ./lib-es5/binding/attribute.js
/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
var AttributeBinding = /** @class */ (function (_super) {
    __extends(AttributeBinding, _super);
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    function AttributeBinding(node, name, value) {
        return _super.call(this, node, name, value) || this;
    }
    /**
     * Generates a function which updates the attribute value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    AttributeBinding.prototype.bound = function (name) {
        return function (node, value) {
            if (value) {
                node.app.$run.setAttribute(node.node, name, value);
            }
            else {
                node.app.$run.removeAttribute(node.node, name);
            }
        };
    };
    return AttributeBinding;
}(Binding));


window.AttributeBinding = AttributeBinding;

// ./lib-es5/binding/style.js
/**
 * Describes a style attribute binding
 * @class StyleBinding
 * @extends Binding
 */
var StyleBinding = /** @class */ (function (_super) {
    __extends(StyleBinding, _super);
    /**
     * Constructs a style binding attribute
     * @param node {INode} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    function StyleBinding(node, name, value) {
        return _super.call(this, node, name, value) || this;
    }
    /**
     * Generates a function to update style property value
     * @param name {string}
     * @returns {Function} a function to update style property
     */
    StyleBinding.prototype.bound = function (name) {
        return function (node, value) {
            if (node.node instanceof HTMLElement) {
                node.app.$run.setStyle(node.node, name, value);
            }
        };
    };
    return StyleBinding;
}(Binding));


window.StyleBinding = StyleBinding;

// ./lib-es5/binding/class.js
/**
 * Represents a HTML class binding description
 * @class ClassBinding
 * @extends Binding
 */
var ClassBinding = /** @class */ (function (_super) {
    __extends(ClassBinding, _super);
    /**
     * Constructs an HTML class binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of class
     * @param value {IValue} the value to bind
     */
    function ClassBinding(node, name, value) {
        var _this = _super.call(this, node, name, value) || this;
        _this.$seal();
        return _this;
    }
    /**
     * Generates a function which updates the html class value
     * @param name {String} The name of attribute
     * @returns {Function} a function which will update attribute value
     */
    ClassBinding.prototype.bound = function (name) {
        var current = null;
        function addClass(node, cl) {
            node.app.$run.addClass(node.node, cl);
        }
        function removeClass(node, cl) {
            node.app.$run.removeClass(node.node, cl);
        }
        return function (node, value) {
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
    };
    return ClassBinding;
}(Binding));


window.ClassBinding = ClassBinding;

// ./lib-es5/views/repeat-node.js
/**
 * Private part of repeat node
 * @class RepeatNodePrivate
 * @extends INodePrivate
 */
var RepeatNodePrivate = /** @class */ (function (_super) {
    __extends(RepeatNodePrivate, _super);
    function RepeatNodePrivate() {
        var _this = this; _super.call(this);
        /**
         * Children node hash
         * @type {Map}
         */
        _this.nodes = new Map();
        _this.$seal();
        return _this;
    }
    RepeatNodePrivate.prototype.$destroy = function () {
        this.nodes.clear();
        _super.prototype.$destroy.call(this);
    };
    return RepeatNodePrivate;
}(INodePrivate));

/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
var RepeatNode = /** @class */ (function (_super) {
    __extends(RepeatNode, _super);
    function RepeatNode($) {
        var _this = _super.call(this, $ || new RepeatNodePrivate) || this;
        /**
         * If false will use timeout executor, otherwise the app executor
         */
        _this.freezeUi = true;
        _this.slot = new Slot;
        return _this;
    }
    RepeatNode.prototype.createChild = function (id, item, before) {
        // TODO: Refactor: remove @ts-ignore
        var _this = this;
        var node = new Fragment();
        // eslint-disable-next-line
        // @ts-ignore
        var $ = node.$;
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
            var lastChild = this.$children[this.$children.length - 1];
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
        var callback = function () {
            _this.slot.release(node, item, id);
            node.$ready();
        };
        if (this.freezeUi) {
            this.$.app.$run.callCallback(callback);
        }
        else {
            timeoutExecutor.callCallback(callback);
        }
        this.$.nodes.set(id, node);
    };
    RepeatNode.prototype.destroyChild = function (id, item) {
        var $ = this.$;
        var child = $.nodes.get(id);
        if (child) {
            // eslint-disable-next-line
            // @ts-ignore
            var $_1 = child.$;
            if ($_1.prev) {
                // eslint-disable-next-line
                // @ts-ignore
                $_1.prev.$.next = $_1.next;
            }
            if ($_1.next) {
                // eslint-disable-next-line
                // @ts-ignore
                $_1.next.$.prev = $_1.prev;
            }
            child.$destroy();
            this.$.nodes.delete(id);
            this.$children.splice(this.$children.indexOf(child), 1);
        }
    };
    return RepeatNode;
}(Fragment));


window.RepeatNodePrivate = RepeatNodePrivate;
window.RepeatNode = RepeatNode;

// ./lib-es5/views/repeater.js
/**
 * Private part of repeater
 * @class RepeaterPrivate
 * @extends RepeatNodePrivate
 */
var RepeaterPrivate = /** @class */ (function (_super) {
    __extends(RepeaterPrivate, _super);
    function RepeaterPrivate() {
        var _this = this; _super.call(this);
        /**
         * Current count of child nodes
         */
        _this.currentCount = 0;
        _this.$seal();
        return _this;
    }
    return RepeaterPrivate;
}(RepeatNodePrivate));

/**
 * The simplest repeat node interpretation, repeat children pack a several times
 * @class Repeater
 * @extends RepeatNode
 */
var Repeater = /** @class */ (function (_super) {
    __extends(Repeater, _super);
    function Repeater($) {
        var _this = _super.call(this, $ || new RepeaterPrivate) || this;
        /**
         * The count of children
         */
        _this.count = new Reference(0);
        _this.$seal();
        return _this;
    }
    /**
     * Changes the children count
     */
    Repeater.prototype.changeCount = function (number) {
        var $ = this.$;
        if (number > $.currentCount) {
            for (var i = $.currentCount; i < number; i++) {
                this.createChild(i, i);
            }
        }
        else {
            for (var i = $.currentCount - 1; i >= number; i--) {
                this.destroyChild(i, i);
            }
        }
        $.currentCount = number;
    };
    Repeater.prototype.$created = function () {
        var $ = this.$;
        _super.prototype.$created.call(this);
        $.updateHandler = this.changeCount.bind(this);
        this.count.on($.updateHandler);
    };
    Repeater.prototype.$ready = function () {
        this.changeCount(this.count.$);
    };
    Repeater.prototype.$destroy = function () {
        var $ = this.$;
        _super.prototype.$destroy.call(this);
        this.count.off($.updateHandler);
    };
    return Repeater;
}(RepeatNode));


window.RepeaterPrivate = RepeaterPrivate;
window.Repeater = Repeater;

// ./lib-es5/views/base-view.js
/**
 * Private part of BaseView
 * @class BaseViewPrivate
 * @extends RepeatNodePrivate
 */
var BaseViewPrivate = /** @class */ (function (_super) {
    __extends(BaseViewPrivate, _super);
    function BaseViewPrivate() {
        var _this = this; _super.call(this);
        _this.$seal();
        return _this;
    }
    return BaseViewPrivate;
}(RepeatNodePrivate));

/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
var BaseView = /** @class */ (function (_super) {
    __extends(BaseView, _super);
    function BaseView($1) {
        var _this = _super.call(this, $1 || new BaseViewPrivate) || this;
        var $ = _this.$;
        $.addHandler = function (id, item) {
            _this.createChild(id, item);
        };
        $.removeHandler = function (id, item) {
            _this.destroyChild(id, item);
        };
        _this.$seal();
        return _this;
    }
    /**
     * Handle ready event
     */
    BaseView.prototype.$ready = function () {
        var $ = this.$;
        this.model.listener.onAdd($.addHandler);
        this.model.listener.onRemove($.removeHandler);
        _super.prototype.$ready.call(this);
    };
    /**
     * Handles destroy event
     */
    BaseView.prototype.$destroy = function () {
        var $ = this.$;
        this.model.listener.offAdd($.addHandler);
        this.model.listener.offRemove($.removeHandler);
        _super.prototype.$destroy.call(this);
    };
    return BaseView;
}(RepeatNode));


window.BaseViewPrivate = BaseViewPrivate;
window.BaseView = BaseView;

// ./lib-es5/views/array-view.js
/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
var ArrayView = /** @class */ (function (_super) {
    __extends(ArrayView, _super);
    function ArrayView() {
        var _this = this; _super.call(this);
        _this.model = new ArrayModel;
        _this.$seal();
        return _this;
    }
    ArrayView.prototype.createChild = function (id, item, before) {
        _super.prototype.createChild.call(this, item, item, before || this.$.nodes.get(id));
    };
    ArrayView.prototype.$ready = function () {
        var _this = this;
        this.model.forEach(function (item) {
            _this.createChild(item, item);
        });
        _super.prototype.$ready.call(this);
    };
    return ArrayView;
}(BaseView));


window.ArrayView = ArrayView;

// ./lib-es5/node/watch.js
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
var Watch = /** @class */ (function (_super) {
    __extends(Watch, _super);
    function Watch() {
        var _this = this; _super.call(this);
        _this.slot = new Slot;
        _this.model = _this.$ref(null);
        _this.$seal();
        return _this;
    }
    Watch.prototype.$createWatchers = function () {
        var _this = this;
        this.$watch(function (value) {
            _this.$children.forEach(function (child) {
                child.$destroy();
            });
            _this.$children.splice(0);
            _this.slot.release(_this, value);
        }, this.model);
    };
    Watch.prototype.$compose = function () {
        this.slot.release(this, this.model.$);
    };
    return Watch;
}(Fragment));


window.Watch = Watch;

// ./lib-es5/views/object-view.js
/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
var ObjectView = /** @class */ (function (_super) {
    __extends(ObjectView, _super);
    function ObjectView() {
        var _this = this; _super.call(this);
        _this.model = new ObjectModel;
        return _this;
    }
    ObjectView.prototype.$ready = function () {
        var obj = this.model;
        for (var key in obj) {
            this.createChild(key, obj[key]);
        }
        _super.prototype.$ready.call(this);
    };
    return ObjectView;
}(BaseView));


window.ObjectView = ObjectView;

// ./lib-es5/views/map-view.js
/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
var MapView = /** @class */ (function (_super) {
    __extends(MapView, _super);
    function MapView() {
        var _this = this; _super.call(this);
        _this.model = new MapModel;
        return _this;
    }
    MapView.prototype.$ready = function () {
        var _this = this;
        var map = this.model;
        map.forEach(function (value, key) {
            _this.createChild(key, value);
        });
        _super.prototype.$ready.call(this);
    };
    return MapView;
}(BaseView));


window.MapView = MapView;

// ./lib-es5/views/set-view.js
/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
var SetView = /** @class */ (function (_super) {
    __extends(SetView, _super);
    function SetView() {
        var _this = this; _super.call(this);
        _this.model = new SetModel();
        return _this;
    }
    SetView.prototype.$ready = function () {
        var _this = this;
        var $ = this.$;
        var set = this.model;
        set.forEach(function (item) {
            $.app.$run.callCallback(function () {
                _this.createChild(item, item);
            });
        });
        _super.prototype.$ready.call(this);
    };
    return SetView;
}(BaseView));


window.SetView = SetView;

})();
