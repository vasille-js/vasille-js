// @flow
import { AttributeBinding, attributify }                   from "./attribute.js";
import { Bind1, Binding, BindN }                           from "./bind.js";
import { classify }                                        from "./class.js";
import { eventify }                                        from "./event.js";
import { Executor, InstantExecutor }                       from "./executor.js";
import type { CoreEl }                                     from "./interfaces/core.js";
import { $destroyObject, VasilleNode, VasilleNodePrivate } from "./interfaces/core.js";
import { IBind }                                           from "./interfaces/ibind.js";
import { Callable }                                        from "./interfaces/idefinition.js";
import { IValue }                                          from "./interfaces/ivalue.js";
import { vassilify }                                       from "./models.js";
import { StyleBinding, stylify }                           from "./style.js";
import { Value }                                           from "./value.js";
import type { RepeatNode }                                 from "./views.js";



/**
 * The private part of a text node
 */
export class TextNodePrivate extends VasilleNodePrivate {
    /**
     * Contains the text of node as Value
     * @type {IValue}
     */
    value : IValue<string>;

    /**
     * User defined handler to handle text change
     * @type {Function}
     */
    handler : Function;

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} node to paste after
     * @param text {String | IValue}
     */
    preinitText (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : ?VasilleNode,
        text : IValue<string> | string
    ) {
        super.preinit(app, rt, ts, before);

        let value = text instanceof IValue ? text : new Value(text);
        let node = document.createTextNode(value.get());

        this.value = value;
        this.handler = function (v : IValue<string>) {
            node.replaceData(0, -1, v.get());
        }.bind(null, value);

        value.on(this.handler);
        this.encapsulate(node);

        ts.$$appendChild(node, before);
    }
}

/**
 * Represents a text node
 */
export class TextNode extends VasilleNode {
    $$ : TextNodePrivate = new TextNodePrivate();

    /**
     * Pointer to text node
     * @type {Text}
     */
    node : Text;

    constructor () {
        super();
    }

    get $ () : TextNodePrivate {
        return this.$$;
    }

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} node to paste after
     * @param text {String | IValue}
     */
    $$preinitText (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode, text : IValue<string> | string) {
        this.$.preinitText(app, rt, ts, before, text);
        this.node = this.$.text;
    }

    /**
     * Runs garbage collector
     */
    $destroy () : void {
        super.$destroy();
        this.$.$destroy();
    }
}

export type Signal = {| args : Array<Function>, handlers : Array<Function> |};

/**
 * The private part of a base node
 */
export class BaseNodePrivate extends VasilleNodePrivate {

    /**
     * The building active state
     * @type {boolean}
     */
    building : boolean;

    /**
     * Represents style bindings
     * @type {Array<Binding>}
     */
    class : Array<Binding> = [];

    /**
     * Represents a list of user-defined bindings
     * @type {Array<IBind>}
     */
    watch : Array<IBind> = [];

    /**
     * List of events
     * @type {Object<String, IValue>}
     */
    listener : { [key : string] : IValue<Function> } = {};

    /**
     * List of user defined signals
     * @type {Object<string, {args : Array<Function>, handlers : Array<Function>}>}
     */
    signal : { [name : string] : Signal } = {};

    /**
     * List of references
     * @type {Object<String, BaseNode|Set<BaseNode>>}
     */
    refs : { [key : string] : BaseNode | Set<BaseNode> } = {};

    /**
     * List of $slots
     * @type {Object<String, BaseNode>}
     */
    slots : { [key : string] : BaseNode } = {};

    /**
     * Get the current root (this on building, rt on filling)
     * @type {BaseNode}
     */
    get rt () : BaseNode {
        return !this.building && super.root instanceof BaseNode ? super.root : this.ts;
    }
}

/**
 * Represents an Vasille.js node which can contains children
 * @extends VasilleNode
 */
export class BaseNode extends VasilleNode {
    $$ : BaseNodePrivate = new BaseNodePrivate();

    /**
     * The children list
     * @type {Array<VasilleNode>}
     */
    $children : Array<VasilleNode> = [];

    get $ () : BaseNodePrivate {
        return this.$$;
    }

    /**
     * Pre-initializes a base node which can contain children
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} node to paste after it
     * @param node {HTMLElement | Text | Comment} The encapsulated node
     */
    $$preinitNode (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : ?VasilleNode,
        node : CoreEl
    ) {
        this.$.preinit(app, rt, ts, before);
        this.$.encapsulate(node);

        ts.$$appendChild(node, before);
    }

    $$startBuilding () {
        this.$.slots["default"] = this;
        this.$.building = true;
    }

    $$stopBuilding () {
        this.$.building = false;
        this.$mounted();
    }

    /**
     * Initialize node
     * @param props {Object} VasilleNode properties values
     */
    $init (props : Object) {
        this.$$startBuilding();

        this.$$initProps(props);
        this.$createAttrs();
        this.$createStyle();
        this.$createSignals();
        this.$createWatchers();

        this.$created();
        this.$createDom();

        this.$$stopBuilding();
    }

    /**
     * Assigns value to this property is such exists and is a IValue
     * @param ts {Object} pointer to this
     * @param prop {string} property name
     * @param value {*} value to assign
     */
    $$unsafeAssign (ts : Object, prop : string, value : any) {
        if (ts[prop] instanceof IValue) {
            if (value instanceof IValue) {
                ts[prop] = value;
            }
            else {
                ts[prop].set(value);
            }
        }
        else {
            throw "No such property: " + prop;
        }
    }

    /**
     * Initializes the node properties
     * @param props {Object<String, Callable | IValue | *>} Properties values
     * @private
     */
    $$initProps (props : { [key : string] : Callable | IValue<any> | any }) {
        // add properties from object
        for (let i in props) {
            if (props.hasOwnProperty(i)) {
                let value = props[i];

                if (value instanceof Callable) {
                    value = value.func();
                }

                this.$$unsafeAssign(this, i, value);
            }
        }
    }

    /** To be overloaded: created event handler */
    $created () {
    }

    /** To be overloaded: mounted event handler */
    $mounted () {
    }

    /** To be overloaded: ready event handler */
    $ready () {
    }

    /**
     * Runs garbage collector
     */
    $destroy () : void {
        super.$destroy();

        if (this.$.root instanceof BaseNode) {
            for (let i in this.$.root.$.refs) {
                let ref = this.$.root.$.refs[i];

                if (ref === this) {
                    delete this.$.root.$.refs[i];
                }
                else if (ref instanceof Set && ref.has(this)) {
                    ref.delete(this);
                }
            }
        }

        for (let child of this.$children) {
            child.$destroy();
        }

        $destroyObject(this.$.class);
        $destroyObject(this.$.watch);
    }

    /** To be overloaded: attributes creation milestone */
    $createAttrs () {
    }

    /** To be overloaded: $style attributes creation milestone */
    $createStyle () {
    }

    /** To be overloaded: signals creation milestone */
    $createSignals () {
    }

    /** To be overloaded: watchers creation milestone */
    $createWatchers () {
    }

    /** To be overloaded: DOM creation milestone */
    $createDom () {
    }

    /**
     * Gets a attribute value
     * @param name {string} Attribute name
     * @return {IValue<string>}
     */
    $attr (name : string) : IValue<string> {
        return this.$.attr(name);
    }

    /**
     * Defines a attribute
     * @param name {String} The name of attribute
     * @param value {String | IValue | Callable} A $$value or a $$value getter
     * @return {BaseNode} A pointer to this
     */
    $defAttr (name : string, value : string | IValue<any> | Callable) : this {
        if (value instanceof Callable) {
            this.$.$attrs[name] = attributify(this.$.rt, this, name, null, value);
        }
        else {
            this.$.$attrs[name] = attributify(this.$.rt, this, name, value);
        }
        return this;
    }

    /**
     * Defines a set of attributes
     * @param obj {Object<String, String | IValue>} A set attributes
     * @return {BaseNode} A pointer to this
     */
    $defAttrs (obj : { [key : string] : string | IValue<any> }) : this {
        for (let i in obj) {
            this.$.$attrs[i] = attributify(this.$.rt, this, i, obj[i]);
        }
        return this;
    }

    /**
     * Creates and binds a multivalued binding to attribute
     * @param name {String} The name of attribute
     * @param calculator {Function} Binding calculator (must return a value)
     * @param values {...IValue} Values to bind
     * @return {BaseNode} A pointer to this
     */
    $bindAttr (
        name : string,
        calculator : Function,
        ...values : Array<IValue<any>>
    ) : this {
        this.$.$attrs[name] = new AttributeBinding(
            this.$.rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    /**
     * Sets a attribute value
     * @param name {string} Name of attribute
     * @param value {string} Value of attribute
     * @return {BaseNode} A pointer to this
     */
    $setAttr (
        name : string,
        value : string
    ) : this {
        this.$.app.$run.setAttribute(this.$.el, name, value);
        return this;
    }

    /**
     * Sets value of some attributes
     * @param data {Object<string, string>} Names and values of attributes
     * @return {BaseNode} A pointer to this
     */
    $setAttrs (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$.app.$run.setAttribute(this.$.el, i, data[i]);
        }
        return this;
    }

    /**
     * Adds a CSS class
     * @param cl {string} Class name
     * @return {BaseNode} A pointer to this
     */
    $addClass (cl : string) : this {
        this.$.el.classList.add(cl);
        return this;
    }

    /**
     * Adds some CSS classes
     * @param cl {...string} Classes names
     * @return {BaseNode} A pointer to this
     */
    $addClasses (...cl : Array<string>) : this {
        this.$.el.classList.add(...cl);
        return this;
    }

    /**
     * Bind a CSS class
     * @param cl
     * @param value
     * @param func
     * @return {BaseNode}
     */
    $bindClass (
        cl : ?string,
        value : boolean | string | IValue<boolean | string> = false,
        func : ?Callable                                    = null
    ) : this {
        this.$.class.push(classify(this.$.rt, this, cl || "", value, func));
        return this;
    }

    /**
     * Gets a style attribute value
     * @param name {string} Name of style attribute
     * @return {IValue<string>}
     */
    $style (name : string) : IValue<string> {
        return this.$.style(name);
    }

    /**
     * Defines a style attribute
     * @param name {String} The name of style attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {BaseNode} A pointer to this
     */
    $defStyle (name : string, value : string | IValue<string> | Callable) : this {
        if (value instanceof Callable) {
            this.$.$style[name] = stylify(this.$.rt, this, name, null, value);
        }
        else {
            this.$.$style[name] = stylify(this.$.rt, this, name, value);
        }
        return this;
    }

    /**
     * Defines a set of style attributes
     * @param obj {Object<String, String | IValue>} A set of style attributes
     * @return {BaseNode} A pointer to this
     */
    $defStyles (obj : { [key : string] : string | IValue<any> }) : this {
        for (let i in obj) {
            this.$.$style[i] = stylify(this.$.rt, this, i, obj[i]);
        }
        return this;
    }

    /**
     * Creates and binds a calculator to a style attribute
     * @param name {String} Name of style attribute
     * @param calculator {Function} A calculator for style value
     * @param values {...IValue} Values to bind
     * @return {BaseNode} A pointer to this
     */
    $bindStyle (
        name : string,
        calculator : Function,
        ...values : Array<IValue<any>>
    ) : this {
        this.$.$style[name] = new StyleBinding(
            this.$.rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     * @return {BaseNode}
     */
    $setStyle (
        prop : string,
        value : string
    ) : this {
        this.$.app.$run.setStyle(this.$.el, prop, value);
        return this;
    }

    /**
     * Sets some style property value
     * @param data {Object<string, string>} Names and value of properties
     * @return {BaseNode}
     */
    $setStyles (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$.app.$run.setStyle(this.$.el, i, data[i]);
        }
        return this;
    }

    /**
     * Defines a signal
     * @param name {string} Signal name
     * @param types {...Function} Arguments types
     */
    $defSignal (name : string, ...types : Array<Function>) {
        this.$.signal[name] = { args : types, handlers : [] };
    }

    /**
     * Add a handler for a signal
     * @param name {string} Signal name
     * @param func {Function} Handler
     */
    $on (name : string, func : Function) {
        let signal = this.$.signal[name];

        if (!signal) {
            throw "No such signal: " + name;
        }

        this.$.signal[name].handlers.push(func);
    }

    /**
     * Emit a signal
     * @param name {string} Signal name
     * @param args {...*} Signal arguments
     */
    $emit (name : string, ...args : Array<any>) {
        let compatible = args.length === this.$.signal[name].args.length;

        if (compatible && this.$.app.$debug) {
            for (let i = 0; i < args.length; i++) {
                let v = args[i], t = this.$.signal[name].args[i];

                if (!(v instanceof t ) &&
                    !(typeof v === "number" && t === Number) &&
                    !(typeof v === "string" && t === String) &&
                    !(typeof v === "boolean" && t === Boolean)
                ) {
                    compatible = false;
                }
            }
        }

        if (!compatible) {
            throw "Incompatible signals arguments";
        }

        for (let handler of this.$.signal[name].handlers) {
            try {
                handler(...args);
            }
            catch (e) {
                console.error(`Handler throw exception at ${this.constructor.name}::${name}: `, e);
            }
        }
    }

    /**
     * Gets a element listener ny name
     * @param name {string} Listener name
     * @return {IValue}
     */
    $listener (name : string) : IValue<Function> {
        let listener = this.$.listener[name];

        if (listener instanceof IValue) {
            return listener;
        }

        throw "No such listener: " + name;
    }

    /**
     * Defines a element event
     * @param name {String} Event name
     * @param event {Function} Event handler as function
     * @return {BaseNode} A pointer to this
     */
    $defListener (name : string, event : Function) : this {
        this.$.listener[name] = eventify(this, name, event);
        return this;
    }

    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function} Event handler
     * @param options {Object | boolean} addEventListener options
     * @return {BaseNode}
     */
    $listen (name : string, handler : Function, options : ?EventListenerOptionsOrUseCapture) : this {
        this.$.el.addEventListener(name, handler, options || {});
        return this;
    }

    $listenContextMenu (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("contextmenu", handler, options);
    }

    $listenMouseDown (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mousedown", handler, options);
    }

    $listenMouseEnter (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseenter", handler, options);
    }

    $listenMouseLeave (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseleave", handler, options);
    }

    $listenMouseMove (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mousemove", handler, options);
    }

    $listenMouseOut (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseout", handler, options);
    }

    $listenMouseOver (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseover", handler, options);
    }

    $listenMouseUp (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseup", handler, options);
    }

    $listenClick (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("click", handler, options);
    }

    $listenDblClick (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dblclick", handler, options);
    }

    $listenBlur (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("blur", handler, options);
    }

    $listenFocus (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focus", handler, options);
    }

    $listenFocusIn (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focusin", handler, options);
    }

    $listenFocusOut (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focusout", handler, options);
    }

    $listenKeyDown (handler : Function, options : EventListenerOptionsOrUseCapture) {
        this.$listen("keydown", handler, options);
    }

    $listenKeyUp (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("keyup", handler, options);
    }

    $listenKeyPress (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("keypress", handler, options);
    }

    $listenTouchStart (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchstart", handler, options);
    }

    $listenTouchMove (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchmove", handler, options);
    }

    $listenTouchEnd (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchend", handler, options);
    }

    $listenTouchCancel (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchcancel", handler, options);
    }

    $listenWheel (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("wheel", handler, options);
    }

    $listenAbort (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("abort", handler, options);
    }

    $listenError (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("error", handler, options);
    }

    $listenLoad (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("load", handler, options);
    }

    $listenLoadEnd (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("loadend", handler, options);
    }

    $listenLoadStart (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("loadstart", handler, options);
    }

    $listenProgress (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("progress", handler, options);
    }

    $listenTimeout (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("timeout", handler, options);
    }

    $listenDrag (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("drag", handler, options);
    }

    $listenDragEnd (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragend", handler, options);
    }

    $listenDragEnter (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragenter", handler, options);
    }

    $listenDragExit (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragexit", handler, options);
    }

    $listenDragLeave (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragleave", handler, options);
    }

    $listenDragOver (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragover", handler, options);
    }

    $listenDragStart (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragstart", handler, options);
    }

    $listenDrop (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("drop", handler, options);
    }

    $listenPointerOver (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerover", handler, options);
    }

    $listenPointerEnter (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerenter", handler, options);
    }

    $listenPointerDown (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerdown", handler, options);
    }

    $listenPointerMove (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointermove", handler, options);
    }

    $listenPointerUp (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerup", handler, options);
    }

    $listenPointerCancel (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointercancel", handler, options);
    }

    $listenPointerOut (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerout", handler, options);
    }

    $listenPointerLeave (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerleave", handler, options);
    }

    $listenGotPointerCapture (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("gotpointercapture", handler, options);
    }

    $listenLostPointerCapture (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("lostpointercapture", handler, options);
    }

    $listenAnimationStart (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationstart", handler, options);
    }

    $listenAnimationEnd (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationend", handler, options);
    }

    $listenAnimationIteraton (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationiteration", handler, options);
    }

    $listenClipboardChange (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("clipboardchange", handler, options);
    }

    $listenCut (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("cut", handler, options);
    }

    $listenCopy (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("copy", handler, options);
    }

    $listenPaste (handler : Function, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("paste", handler, options);
    }

    /**
     * Defines a watcher
     * @param func {function} Function to run on value change
     * @param vars {...IValue} Values to listen
     */
    $defWatcher (func : Function, ...vars : Array<IValue<any>>) {
        if (vars.length === 0) {
            throw "A watcher must be binded to a value at last";
        }

        if (vars.length === 1) {
            this.$.watch.push(new Bind1(func, vars[0]));
        }
        else {
            this.$.watch.push(new BindN(func, vars));
        }
    }

    /**
     * Creates a reference to this element
     * @param reference {String} The reference name
     * @param group {Boolean} Store reference to group
     */
    $makeRef (reference : string, group : boolean = false) : void {
        if (this.$.root instanceof BaseNode) {
            let ref = this.$.root.$.refs[reference];

            if (group) {
                if (ref instanceof Set) {
                    ref.add(this);
                }
                else {
                    this.$.root.$.refs[reference] = new Set().add(this);
                }
            }
            else {
                this.$.root.$.refs[reference] = this;
            }
        }
    }

    /**
     * Gets a reference node
     * @param name {string} reference name
     * @return {BaseNode}
     */
    $ref (name : string) : BaseNode {
        let ref = this.$.refs[name];

        if (ref instanceof BaseNode) {
            return ref;
        }

        throw "No such ref: " + name;
    }

    /**
     * Gets a reference group
     * @param name {string} reference group name
     * @return {Set<BaseNode>}
     */
    $refs (name : string) : Set<BaseNode> {
        let ref = this.$.refs[name];

        if (ref instanceof Set) {
            return ref;
        }

        throw "No such ref: " + name;
    }

    /**
     * Register current node as named slot
     * @param name {String} The name of slot
     */
    $makeSlot (name : string) : this {
        if (this.$.rt instanceof BaseNode) {
            this.$.rt.$.slots[name] = this;
        }
        return this;
    }

    /**
     * Gets a slot by name
     * @param name {string} Name of slot
     * @return {BaseNode}
     */
    $slot (name : string) : BaseNode {
        let node = this.$.slots[name];

        if (node instanceof BaseNode) {
            return node;
        }

        throw "No such slot: " + name;
    }

    /**
     * Pushes a node to children immediately
     * @param node {VasilleNode} A node to push
     * @private
     */
    $$pushNode (node : VasilleNode) : void {
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
     * Find first core node in shadow element if so exists
     * @param node {ShadowNode} Node to iterate
     * @return {?CoreEl}
     */
    $$findFirstChild (node : ShadowNode) : ?CoreEl {
        for (let child of node.$children) {
            if (child instanceof ShadowNode) {
                let first = this.$$findFirstChild(child);

                if (first) {
                    return first;
                }
            }
            else if (child instanceof ElementNode || child instanceof TextNode) {
                return child.$.$el;
            }
        }
    }

    /**
     * Append a child in correct parent (to be overwritten)
     * @param node {HTMLElement | Text | Comment} A node to push
     * @param before {VasilleNode} node to paste after
     * @private
     */
    $$appendChild (node : CoreEl, before : ?VasilleNode) : void {
        // If we are inserting before a element node
        if (before instanceof ElementNode) {
            this.$.app.$run.insertBefore(this.$.el, node, before.$.el);
            return;
        }

        // If we are inserting in a shadow node or uninitiated element node
        if (
            (this instanceof ShadowNode && !(this.$.parent instanceof AppNode)) ||
            (this instanceof ElementNode && !this.$.el)
        ) {
            this.$.parent.$$appendChild(node, this.$.next);
            return;
        }

        // If we are inserting before a shadow node
        if (before instanceof ShadowNode) {
            let beforeNode = this.$$findFirstChild(before);

            if (beforeNode) {
                this.$.app.$run.insertBefore(this.$.el, node, beforeNode);
                return;
            }
        }

        // If we have no more variants
        this.$.app.$run.appendChild(this.$.el, node);
    }

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {?Function} Callback if previous is slot name
     * @return {BaseNode} A pointer to this
     */
    $defText (
        text : string | IValue<any>,
        cb : ?(text : TextNode) => void
    ) : BaseNode {
        if (this.$.slots["default"] !== this && !this.$.building) {
            this.$.slots["default"].$defText(text, cb);
            return this;
        }

        let node = new TextNode();

        node.$$preinitText(this.$.app, this.$.rt, this, null, text);
        this.$$pushNode(node);

        if (cb) {
            this.$.app.$run.callCallback(() => {
                cb(node);
            });
        }
        return this;
    }

    /**
     * Defines a tag element
     * @param tagName {String} is the tag name
     * @param cb {Function} Callback if previous is slot name
     * @return {BaseNode} A pointer to this
     */
    $defTag (
        tagName : string,
        cb : ?(node : ElementNode, v : ?any) => void
    ) : BaseNode {
        if (this.$.slots["default"] !== this && !this.$.building) {
            this.$.slots["default"].$defTag(tagName, cb);
            return this;
        }
        let node = new ElementNode();

        node.$.parent = this;
        node.$$preinitElementNode(this.$.app, this.$.rt, this, null, tagName);
        node.$init({});
        this.$$pushNode(node);

        this.$.app.$run.callCallback(() => {
            if (cb) {
                cb(node);
            }
            node.$ready();
        });
        return this;
    }

    /**
     * Defines a custom element
     * @param node {*} Custom element constructor
     * @param props {Object} List of properties values
     * @param cb {?Function} Callback if previous is slot name
     * @return {BaseNode} A pointer to this
     */
    $defElement<T> (
        node : T,
        props : Object,
        cb : ?(node : T, v : ?any) => void
    ) : BaseNode {
        if (this.$.slots["default"] !== this && !this.$.building) {
            this.$.slots["default"].$defElement(node, props, cb);
            return this;
        }

        if (node instanceof VasilleNode) {
            node.$.parent = this;
        }

        if (node instanceof ShadowNode) {
            node.$$preinitShadow(this.$.app, this.$.rt, this, null);
        }
        else if (node instanceof ElementNode || node instanceof TextNode) {
            node.$.preinit(this.$.app, this.$.rt, this, null);
        }

        if (node instanceof BaseNode) {
            node.$init(props);
        }

        if (node instanceof VasilleNode) {
            this.$$pushNode(node);
        }

        this.$.app.$run.callCallback(() => {
            if (cb) {
                cb(node);
            }

            if (node instanceof BaseNode) {
                node.$ready();
            }
        });

        return this;
    }

    /**
     * Defines a repeater node
     * @param node {RepeatNode} A repeat node object
     * @param props {Object} Send data to repeat node
     * @param cb {Function} Call-back to create child nodes
     * @return {BaseNode}
     */
    $defRepeater (
        node : RepeatNode,
        props : Object,
        cb : (node : RepeatNodeItem, v : ?any) => void
    ) : this {
        if (this.$.slots["default"] !== this && !this.$.building) {
            this.$.slots["default"].$defRepeater(node, props, cb);
            return this;
        }

        node.$.parent = this;
        node.$$preinitShadow(this.$.app, this.$.rt, this, null);
        node.$init(props);
        this.$$pushNode(node);
        node.setCallback(cb);
        this.$.app.$run.callCallback(() => {
            node.$ready();
        });

        return this;
    }

    /**
     * Defines a if node
     * @param cond {* | IValue<*>} condition
     * @param cb {Function} Call-back to create child nodes
     * @return {this}
     */
    $defIf (
        cond : any,
        cb : CaseCallBack
    ) : this {
        return this.$defSwitch({ cond, cb });
    }

    /**
     * Defines a if-else node
     * @param ifCond {* | IValue<*>} `if` condition
     * @param ifCb {Function} Call-back to create `if` child nodes
     * @param elseCb {Function} Call-back to create `else` child nodes
     * @return {this}
     */
    $defIfElse (
        ifCond : any,
        ifCb : CaseCallBack,
        elseCb : CaseCallBack
    ) : this {
        return this.$defSwitch({ cond : ifCond, cb : ifCb }, { cond : true, cb : elseCb });
    }

    /**
     * Defines a switch nodes
     * @param cases {{ cond : IValue<boolean> | boolean, cb : Function }} Will break after first true condition
     * @return {BaseNode}
     */
    $defSwitch (
        ...cases : Array<CaseArg>
    ) : this {
        if (this.$.slots["default"] !== this && !this.$.building) {
            this.$.slots["default"].$defSwitch(...cases);
            return this;
        }

        let node = new SwitchedNode();

        node.$.parent = this;
        node.$$preinitShadow(this.$.app, this.$.rt, this, null);
        node.$init({});
        this.$$pushNode(node);
        node.setCases(cases);
        this.$.app.$run.callCallback(() => {
            node.$ready();
        });

        return this;
    }
}

/**
 * Represents an Vasille.js HTML element node
 */
export class ElementNode extends BaseNode {

    /**
     * HTML node created by this ElementNode
     * @type {HTMLElement}
     */
    node : HTMLElement;

    /**
     * Constructs a element node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {VasilleNode} Node to insert before it
     * @param tagName {String} Name of HTML tag
     */
    $$preinitElementNode (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : ?VasilleNode,
        tagName : string
    ) {
        this.node = document.createElement(tagName);
        this.$$preinitNode(app, rt, ts.$.parent || ts, before, this.node);
    }
}

/**
 * Represents a Vasille.js shadow node
 */
export class ShadowNode extends BaseNode {
    /**
     * Pre-initialize a shadow node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {VasilleNode} node to paste after it
     */
    $$preinitShadow (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : ?VasilleNode
    ) {
        this.$.preinit(app, rt, ts, before);

        try {
            this.$.encapsulate(ts.$.el);
        }
        catch (e) {
            throw "A shadow node can be encapsulated in a element or shadow node only";
        }
    }

    /**
     * Garbage collection
     */
    $destroy () {
        super.$destroy();
    }
}

type CallBack = (node : RepeatNodeItem, v : ?any) => void;
type CaseCallBack = (node : RepeatNodeItem, v : ?number) => void;
type Case = { cond : IValue<boolean>, cb : CaseCallBack };
type CaseArg = { cond : IValue<boolean> | boolean, cb : CaseCallBack };

/**
 * Defines a abstract node, which represents a dynamical part of application
 */
export class RepeatNodeItem extends ShadowNode {
    $id : any;

    constructor (id : any) {
        super();
        this.$id = id;
    }

    /**
     * Destroy all children
     */
    $destroy () {
        super.$destroy();

        for (let child of this.$children) {
            if (child instanceof ElementNode) {
                this.$.el.removeChild(child.$.el);
            }
            else {
                child.$destroy();
            }
        }
    }
}

/**
 * Defines a node witch can switch its children conditionally
 */
class SwitchedNode extends ShadowNode {

    /**
     * Index of current true condition
     * @type {number}
     */
    index : number = -1;

    /**
     * The unique child which can be absent
     * @type {ShadowNode}
     */
    node : ShadowNode;

    /**
     * Array of possible casses
     * @type {Array<{cond : IValue<boolean>, cb : Function}>}
     */
    cases : Array<Case>;

    /**
     * A function which sync index and content, will be bounded to each condition
     * @type {Function}
     */
    sync : Function;

    /**
     * Constructs a switch node and define a sync function
     */
    constructor () {
        super();

        this.sync = () => {
            let i = 0;

            for (; i < this.cases.length; i++) {
                if (this.cases[i].cond.get()) {
                    break;
                }
            }

            if (i === this.index) {
                return;
            }

            if (i !== this.cases.length) {
                if (this.index !== -1) {
                    this.node.$destroy();
                }
                this.index = i;
                this.createChild(i, this.cases[i].cb);
            }
            else {
                this.node.$destroy();
                this.index = -1;
            }
        };
    };

    /**
     * Set up switch cases
     * @param cases {{ cond : *, cb : Function }}
     */
    setCases (cases : Array<CaseArg>) {
        this.cases = [];

        for (let case_ of cases) {
            this.cases.push({ cond : vassilify(case_.cond), cb : case_.cb });
        }
    }

    /**
     * Prepare shadow node
     * @param app {AppNode} App node
     * @param rt {BaseNode} Root node
     * @param ts {BaseNode} This node
     * @param before {VasilleNode} The next node
     */
    $$preinitShadow (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode) {
        super.$$preinitShadow(app, rt, ts, before);
        this.$.encapsulate(ts.$.el);
    }

    /**
     * Creates a child node
     * @param id {*} id of node
     * @param cb {Function} Call-back
     */
    createChild (id : any, cb : CallBack) {
        let node = new RepeatNodeItem(id);

        node.$.parent = this;
        node.$$preinitShadow(this.$.app, this.$.rt, this);

        node.$init({});
        cb(node, id);
        node.$ready();

        this.node = node;
    };

    /**
     * Run then the node is ready
     */
    $ready () {
        super.$ready();

        for (let c of this.cases) {
            c.cond.on(this.sync);
        }

        this.sync();
    }

    /**
     * Unbind and clear dynamical nodes
     */
    $destroy () {
        for (let c of this.cases) {
            c.cond.off(this.sync);
        }

        this.node.$destroy();
        super.$destroy();
    }
}

/**
 * Represents a Vasille.js application node
 */
export class AppNode extends BaseNode {
    /**
     * The debug state of application, if true will output debug data
     * @type {boolean}
     */
    $debug : boolean = false;

    /**
     * Executor is use to optimize the page creation/update
     * @type {Executor}
     */
    $run : Executor;

    /**
     * Constructs a app node
     * @param node {HTMLElement} The root of application
     * @param props {{debug : boolean}} Application properties
     */
    constructor (node : HTMLElement, props : { debug : boolean }) {
        super();

        this.$run = new InstantExecutor();
        this.$.encapsulate(node);
        this.$.preinit(this, this, this, this);

        if (props.debug instanceof Boolean) {
            this.$debug = props.debug;
        }
    }
}
