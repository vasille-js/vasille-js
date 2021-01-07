// @flow
import { AttributeBinding, attributify }                               from "./attribute.js";
import { Binding, Expression }                                         from "./bind.js";
import { classify }                                                    from "./class.js";
import { Executor, InstantExecutor }                                   from "./executor.js";
import type { CoreEl }                                                 from "./interfaces/core.js";
import { $destroyObject, VasilleNode, VasilleNodePrivate }             from "./interfaces/core.js";
import { internalError, notFound, typeError, userError, wrongBinding } from "./interfaces/errors";
import { IBind }                                                       from "./interfaces/ibind.js";
import { Callable, checkType }                                         from "./interfaces/idefinition.js";
import { IValue }                                                      from "./interfaces/ivalue.js";
import { vassilify }                                                   from "./models.js";
import { StyleBinding, stylify }                                       from "./style.js";
import { Pointer, Reference }                                          from "./value.js";
import type { RepeatNode }                                             from "./views.js";



/**
 * The private part of a text node
 */
export class TextNodePrivate extends VasilleNodePrivate {
    /**
     * Contains the text of node as Reference
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

        let value = text instanceof IValue ? text : new Reference(text);
        let node = document.createTextNode(value.$);

        this.value = value;
        this.handler = function (v : IValue<string>) {
            node.replaceData(0, -1, v.$);
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
    $ : any = new TextNodePrivate();

    /**
     * Pointer to text node
     * @type {Text}
     */
    node : Text;

    constructor () {
        super();
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
     * @type {Set<Binding>}
     */
    class : Set<Binding> = new Set;

    /**
     * Represents a list of user-defined bindings
     * @type {Set<IValue>}
     */
    watch : Set<IValue<*>> = new Set;

    /**
     * List of user defined signals
     * @type {Map<string, {args : Array<Function>, handlers : Array<Function>}>}
     */
    signal : Map<string, Signal> = new Map;

    /**
     * List of references
     * @type {Map<String, BaseNode|Set<BaseNode>>}
     */
    refs : Map<string, BaseNode | Set<BaseNode>> = new Map;

    /**
     * List of $slots
     * @type {Map<String, BaseNode>}
     */
    slots : Map<string, BaseNode> = new Map;

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
    /**
     * The children list
     * @type {Array<VasilleNode>}
     */
    $children : Array<VasilleNode> = [];

    constructor ($ : ?BaseNodePrivate) {
        super($ || new BaseNodePrivate);
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
        this.$.slots.set("default", this);
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
        let field = ts[prop];

        if (!field || !(field instanceof IValue)) {
            throw notFound("no such property: " + prop);
        }
        if (!field.type) {
            throw userError(`field ${prop} is private`, "private-field");
        }

        if (field instanceof Pointer && field.value instanceof Reference && value instanceof IValue) {
            field.$ = value;
        }

        if (value instanceof IValue) {
            ts[prop] = value;
        }
        else {
            ts[prop].set(value);
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
        let $ = this.$;
        super.$destroy();

        if ($.root instanceof BaseNode) {
            for (let it of $.root.$.refs) {
                let ref = it[1];

                if (ref === this) {
                    $.root.$.refs.delete(it[0]);
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

    $private (value : any) : IValue<any> {
        let ret = vassilify(value);
        this.$.watch.add(ret);
        return ret;
    }

    $public (type : Function, value : any = null) : Reference<any> {
        if (!checkType(value, type) || value instanceof IValue) {
            throw typeError("wrong initial public field value");
        }

        let ret = vassilify(value);
        if (ret instanceof Reference) {
            ret.type = type;
            this.$.watch.add(ret);
            return ret;
        }
        else {
            throw internalError("Something goes wrong :(");
        }
    }

    $pointer (type : Function) : Pointer {
        let ref = new Reference();
        let pointer = new Pointer(ref);

        ref.type = type;
        this.$.watch.add(ref);
        this.$.watch.add(pointer);

        return pointer;
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
     * @param value {string} Reference of attribute
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
        value : string | IValue<boolean | string> | null = null,
        func : ?Callable = null
    ) : this {
        this.$.class.add(classify(this.$.rt, this, cl || "", value, func));
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
        this.$.signal.set(name, { args : types, handlers : [] });
    }

    /**
     * Add a handler for a signal
     * @param name {string} Signal name
     * @param func {Function} Handler
     */
    $on (name : string, func : Function) {
        let signal = this.$.signal.get(name);

        if (!signal) {
            throw notFound("no such signal: " + name);
        }

        signal.handlers.push(func);
    }

    /**
     * Emit a signal
     * @param name {string} Signal name
     * @param args {...*} Signal arguments
     */
    $emit (name : string, ...args : Array<any>) {
        let signal = this.$.signal.get(name);

        if (!signal) {
            throw notFound("no such signal: " + name);
        }

        let compatible = args.length === signal.args.length;

        if (compatible && this.$.app.$debug) {
            for (let i = 0; i < args.length; i++) {
                if (!checkType(args[i], signal.args[i])) {
                    compatible = false;
                }
            }
        }

        if (!compatible) {
            throw typeError("incompatible signals arguments");
        }

        for (let handler of signal.handlers) {
            try {
                handler(...args);
            }
            catch (e) {
                console.error(`Vasille.js: Handler throw exception at ${this.constructor.name}::${name}: `, e);
            }
        }
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
            throw wrongBinding("a watcher must be bound to a value at last");
        }

        this.$.watch.add(new Expression(func, vars));
    }

    $bind (f : Function, ...args : Array<IValue<any>>) : IBind {
        let res : IBind;

        if (args.length === 0) {
            throw wrongBinding("no values to bind");
        }
        else {
            res = new Expression(f, args);
        }

        this.$.watch.add(res);
        return res;
    }

    /**
     * Creates a reference to this element
     * @param reference {String} The reference name
     * @param group {Boolean} Store reference to group
     */
    $makeRef (reference : string, group : boolean = false) : void {
        let $ = this.$;

        if ($.root instanceof BaseNode) {
            let refs = $.root.$.refs;
            let ref = refs.get(reference);

            if (group) {
                if (ref instanceof Set) {
                    ref.add(this);
                }
                else {
                    refs.set(reference, new Set().add(this));
                }
            }
            else {
                refs.set(reference, this);
            }
        }
    }

    /**
     * Gets a reference node
     * @param name {string} reference name
     * @return {BaseNode}
     */
    $ref (name : string) : BaseNode {
        let ref = this.$.refs.get(name);

        if (ref instanceof BaseNode) {
            return ref;
        }

        throw notFound("no such ref: " + name);
    }

    /**
     * Gets a reference group
     * @param name {string} reference group name
     * @return {Set<BaseNode>}
     */
    $refs (name : string) : Set<BaseNode> {
        let ref = this.$.refs.get(name);

        if (ref instanceof Set) {
            return ref;
        }

        throw notFound("no such ref: " + name);
    }

    /**
     * Register current node as named slot
     * @param name {String} The name of slot
     */
    $makeSlot (name : string) : this {
        if (this.$.rt instanceof BaseNode) {
            this.$.rt.$.slots.set(name, this);
        }
        return this;
    }

    /**
     * Gets a slot by name
     * @param name {string} Name of slot
     * @return {BaseNode}
     */
    $slot (name : string) : BaseNode {
        let node = this.$.slots.get(name);

        if (node instanceof BaseNode) {
            return node;
        }

        throw notFound("no such slot: " + name);
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
     * @param node {ExtensionNode} Node to iterate
     * @return {?CoreEl}
     */
    $$findFirstChild (node : ExtensionNode) : ?CoreEl {
        for (let child of node.$children) {
            if (child instanceof ExtensionNode) {
                let first = this.$$findFirstChild(child);

                if (first) {
                    return first;
                }
            }
            else if (child instanceof TagNode || child instanceof TextNode) {
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
        let $ = this.$;
        before = before || $.next;

        // If we are inserting before a element node
        if (before instanceof TagNode) {
            $.app.$run.insertBefore($.el, node, before.$.el);
            return;
        }

        // If we are inserting before a shadow node
        if (before instanceof ExtensionNode) {
            let beforeNode = this.$$findFirstChild(before);

            if (beforeNode) {
                $.app.$run.insertBefore($.el, node, beforeNode);
                return;
            }
        }

        // If we are inserting in a shadow node or uninitiated element node
        if (
            (this instanceof ExtensionNode && !($.parent instanceof AppNode)) ||
            (this instanceof TagNode && !$.el)
        ) {
            $.parent.$$appendChild(node, $.next);
            return;
        }

        // If we have no more variants
        $.app.$run.appendChild($.el, node);
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
        let $ = this.$;
        let default_ = $.slots.get("default");

        if (default_ && default_ !== this && !$.building) {
            default_.$defText(text, cb);
            return this;
        }

        let node = new TextNode();

        node.$$preinitText($.app, $.rt, this, null, text);
        this.$$pushNode(node);

        if (cb) {
            $.app.$run.callCallback(() => {
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
        cb : ?(node : TagNode, v : ?any) => void
    ) : BaseNode {
        let $ = this.$;
        let default_ = $.slots.get("default");

        if (default_ && default_ !== this && !$.building) {
            default_.$defTag(tagName, cb);
            return this;
        }
        let node = new TagNode();

        node.$.parent = this;
        node.$$preinitElementNode($.app, $.rt, this, null, tagName);
        node.$init({});
        this.$$pushNode(node);

        $.app.$run.callCallback(() => {
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
        props : ($ : T) => void,
        cb : ?(node : T, v : ?any) => void
    ) : BaseNode {
        let $ = this.$;
        let default_ = $.slots.get("default");

        if (default_ && default_ !== this && !$.building) {
            default_.$defElement(node, props, cb);
            return this;
        }

        if (node instanceof VasilleNode) {
            node.$.parent = this;
        }

        if (node instanceof ExtensionNode) {
            node.$$preinitShadow($.app, $.rt, this, null);
        }
        else if (node instanceof TagNode || node instanceof TextNode) {
            node.$.preinit($.app, $.rt, this, null);
        }

        this.$$callPropsCallback(node, props);

        if (node instanceof VasilleNode) {
            this.$$pushNode(node);
        }

        $.app.$run.callCallback(() => {
            if (cb) {
                cb(node);
            }

            if (node instanceof BaseNode) {
                node.$ready();
            }
        });

        return this;
    }

    $$callPropsCallback<T> (node : T, props : ($ : T) => void) {
        if (node instanceof BaseNode) {
            let obj = {};

            for (let i in node) {
                if (node.hasOwnProperty(i)) {
                    Object.defineProperty(obj, i, {
                        configurable : false,
                        enumerable   : false,
                        set (value) {
                            node.$$unsafeAssign(node, i, value);
                        }
                    });
                }
            }

            //$FlowFixMe[incompatible-call]
            props(obj);
        }
    }

    /**
     * Defines a repeater node
     * @param nodeT {RepeatNode} A repeat node object
     * @param props {Object} Send data to repeat node
     * @param cb {Function} Call-back to create child nodes
     * @return {BaseNode}
     */
    $defRepeater<T> (
        nodeT : T,
        props : ($ : T) => void,
        cb : (node : RepeatNodeItem, v : ?any) => void
    ) : this {
        let $ = this.$;
        let default_ = $.slots.get("default");

        if (default_ && default_ !== this && !$.building) {
            default_.$defRepeater(nodeT, props, cb);
            return this;
        }

        //$FlowFixMe[incompatible-type]
        let node : RepeatNode = nodeT;

        node.$.parent = this;
        node.$$preinitShadow($.app, this.$.rt, this, null);
        this.$$callPropsCallback(nodeT, props);
        this.$$pushNode(node);
        node.setCallback(cb);
        $.app.$run.callCallback(() => {
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
        let $ = this.$;
        let default_ = $.slots.get("default");

        if (default_ && default_ !== this && !$.building) {
            default_.$defSwitch(...cases);
            return this;
        }

        let node = new SwitchedNode();

        node.$.parent = this;
        node.$$preinitShadow($.app, this.$.rt, this, null);
        node.$init({});
        this.$$pushNode(node);
        node.setCases(cases);
        $.app.$run.callCallback(() => {
            node.$ready();
        });

        return this;
    }
}

/**
 * Represents an Vasille.js HTML element node
 */
export class TagNode extends BaseNode {

    /**
     * HTML node created by this TagNode
     * @type {HTMLElement}
     */
    $node : HTMLElement;

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
        this.$node = document.createElement(tagName);
        this.$$preinitNode(app, rt, ts, before, this.$node);
    }
}

/**
 * Represents a Vasille.js shadow node
 */
export class ExtensionNode extends BaseNode {
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
            throw internalError("A extension node can be encapsulated in a tag or extension node only");
        }
    }
}

export class UserNode extends ExtensionNode {
    $mounted () {
        super.$mounted();

        if (this.$children.length !== 1) {
            throw userError("UserNode must have a child only", "dom-error");
        }
        let child = this.$children[0];

        if (child instanceof TagNode || child instanceof UserNode) {
            this.$.encapsulate(child.$.el);
        }
        else {
            throw userError("UserNode child must be TagNode or UserNode", "dom-error");
        }
    }
}

type CallBack = (node : RepeatNodeItem, v : ?any) => void;
type CaseCallBack = (node : RepeatNodeItem, v : ?number) => void;
type Case = { cond : IValue<boolean>, cb : CaseCallBack };
type CaseArg = { cond : IValue<boolean> | boolean, cb : CaseCallBack };

/**
 * Defines a abstract node, which represents a dynamical part of application
 */
export class RepeatNodeItem extends ExtensionNode {
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
            if (child instanceof TagNode) {
                this.$.el.removeChild(child.$.el);
            }
            else {
                child.$destroy();
            }
        }
    }
}

export class SwitchedNodePrivate extends BaseNodePrivate {
    /**
     * Index of current true condition
     * @type {number}
     */
    index : number = -1;

    /**
     * The unique child which can be absent
     * @type {ExtensionNode}
     */
    node : ExtensionNode;

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

}

/**
 * Defines a node witch can switch its children conditionally
 */
class SwitchedNode extends ExtensionNode {

    $ = new SwitchedNodePrivate();

    /**
     * Constructs a switch node and define a sync function
     */
    constructor () {
        super();

        this.$.sync = () => {
            let $ = this.$;
            let i = 0;

            for (; i < $.cases.length; i++) {
                if ($.cases[i].cond.$) {
                    break;
                }
            }

            if (i === $.index) {
                return;
            }

            if (i !== $.cases.length) {
                if ($.index !== -1) {
                    $.node.$destroy();
                }
                $.index = i;
                this.createChild(i, $.cases[i].cb);
            }
            else {
                if ($.node) {
                    $.node.$destroy();
                }
                $.index = -1;
            }
        };
    };

    /**
     * Set up switch cases
     * @param cases {{ cond : *, cb : Function }}
     */
    setCases (cases : Array<CaseArg>) {
        let $ = this.$;
        $.cases = [];

        for (let case_ of cases) {
            $.cases.push({ cond : vassilify(case_.cond), cb : case_.cb });
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

        this.$.node = node;
    };

    /**
     * Run then the node is ready
     */
    $ready () {
        let $ = this.$;

        super.$ready();

        for (let c of $.cases) {
            c.cond.on($.sync);
        }

        $.sync();
    }

    /**
     * Unbind and clear dynamical nodes
     */
    $destroy () {
        let $ = this.$;

        for (let c of $.cases) {
            c.cond.off($.sync);
        }

        if ($.node) {
            $.node.$destroy();
        }
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
