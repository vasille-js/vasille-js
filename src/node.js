// @flow
import { AttributeBinding, attributify }                               from "./attribute.js";
import { Binding, Expression }                                         from "./bind.js";
import { classify }                                                    from "./class.js";
import { Executor, InstantExecutor }                                   from "./executor.js";
import type { CoreEl }                                                 from "./interfaces/core.js";
import { VasilleNode, VasilleNodePrivate }                             from "./interfaces/core.js";
import { internalError, notFound, typeError, userError, wrongBinding } from "./interfaces/errors.js";
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

    /**
     * Clear node data
     */
    $destroy () {
        //$FlowFixMe
        this.value = null;
        //$FlowFixMe
        this.handler = null;

        super.$destroy();
    }
}

/**
 * Represents a text node
 */
export class TextNode extends VasilleNode {
    /**
     * private data
     * @type {TextNodePrivate}
     */
    $ : any = new TextNodePrivate();

    /**
     * Pointer to text node
     * @type {Text}
     */
    node : Text;

    /**
     * Constructs a text node
     */
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
        this.$.$destroy();
        this.$ = null;
        //$FlowFixMe
        this.node = null;

        super.$destroy();
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
     * Defined the frozen state of component
     * @type {boolean}
     */
    frozen : boolean = false;

    /**
     * Defines if node is unmounted
     * @type {boolean}
     */
    unmounted : boolean = false;

    /**
     * Handle to run on component destroy
     * @type {Function}
     */
    onDestroy : Function;

    /**
     * Get the current root (ts on building, rt on filling)
     * @type {BaseNode}
     */
    get rt () : BaseNode {
        return !this.building && super.root instanceof BaseNode ? super.root : this.ts;
    }

    /**
     * Garbage collection
     */
    $destroy () {
        for (let c of this.class) {
            c.$destroy();
        }
        this.class.clear();
        //$FlowFixMe
        this.class = null;

        for (let w of this.watch) {
            w.$destroy();
        }
        this.watch.clear();
        //$FlowFixMe
        this.watch = null;

        this.signal.clear();
        //$FlowFixMe
        this.signal = null;

        for (let ref of this.refs) {
            if (ref instanceof Set) {
                ref.clear();
            }
        }
        this.refs.clear();
        //$FlowFixMe
        this.refs = null;

        this.slots.clear();
        //$FlowFixMe
        this.slots = null;

        if (this.onDestroy) {
            this.onDestroy();
        }

        super.$destroy();
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

    /**
     * Constructs a base node
     * @param $ {?BaseNodePrivate}
     */
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

    /**
     * Start component building
     */
    $$startBuilding () {
        this.$.slots.set("default", this);
        this.$.building = true;
    }

    /**
     * Stop component building
     */
    $$stopBuilding () {
        this.$.building = false;
        this.$mounted();
    }

    /**
     * Initialize node
     */
    $init () {
        this.$$startBuilding();

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

        if (!field || !(
            field instanceof IValue
        )) {
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
            field.$ = value;
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

    /** To be overloaded: attributes creation milestone */
    $createAttrs () {
    }

    /**
     * Runs garbage collector
     */
    $destroy () : void {
        let $ : BaseNodePrivate = this.$;

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

        $.$destroy();
        this.$ = null;
        this.$children.splice(0);
        //$FlowFixMe
        this.$children = null;

        super.$destroy();
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
     * create a private field
     * @param value {*}
     * @return {IValue<*>}
     */
    $private (value : any) : IValue<any> {
        let ret = vassilify(value);
        this.$.watch.add(ret);
        return ret;
    }

    /**
     * creates a publis field
     * @param type {Function}
     * @param value {*}
     * @return {Reference}
     */
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

    /**
     * creates a pointer
     * @param type {Function}
     * @return {Pointer}
     */
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
     * @param cl {?string}
     * @param value {string | IValue | null}
     * @param func {?Callable}
     * @return {BaseNode}
     */
    $bindClass (
        cl : ?string,
        value : string | IValue<boolean | string> | null = null,
        func : ?Callable                                 = null
    ) : this {
        this.$.class.add(classify(this.$.rt, this, cl || "", value, func));
        return this;
    }

    /**
     * Gets a style attribute value
     * @param name {string} Name of style attribute
     * @return {IValue}
     */
    $style (name : string) : IValue<string> {
        return this.$.style(name);
    }

    /**
     * Defines a style attribute
     * @param name {String} The name of style attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {this} A pointer to this
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
     * @return {this} A pointer to this
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
     * @return {this} A pointer to this
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
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     * @return {this}
     */
    $listen (name : string, handler : Function, options : ?EventListenerOptionsOrUseCapture) : this {
        this.$.el.addEventListener(name, handler, options || {});
        return this;
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenContextMenu (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("contextmenu", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseDown (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mousedown", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseEnter (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseenter", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseLeave (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseleave", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseMove (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mousemove", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseOut (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseout", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseOver (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseover", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenMouseUp (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("mouseup", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenClick (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("click", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    $listenDblClick (handler : MouseEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dblclick", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $listenBlur (handler : FocusEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("blur", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $listenFocus (handler : FocusEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focus", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $listenFocusIn (handler : FocusEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focusin", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    $listenFocusOut (handler : FocusEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("focusout", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $listenKeyDown (handler : KeyboardEvent => void, options : EventListenerOptionsOrUseCapture) {
        this.$listen("keydown", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $listenKeyUp (handler : KeyboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("keyup", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    $listenKeyPress (handler : KeyboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("keypress", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $listenTouchStart (handler : TouchEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchstart", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $listenTouchMove (handler : TouchEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchmove", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $listenTouchEnd (handler : TouchEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchend", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    $listenTouchCancel (handler : TouchEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("touchcancel", handler, options);
    }

    /**
     * @param handler {function (WheelEvent)}
     * @param options {Object | boolean}
     */
    $listenWheel (handler : WheelEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("wheel", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenAbort (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("abort", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenError (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("error", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenLoad (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("load", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenLoadEnd (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("loadend", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenLoadStart (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("loadstart", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenProgress (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("progress", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    $listenTimeout (handler : ProgressEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("timeout", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDrag (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("drag", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragEnd (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragend", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragEnter (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragenter", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragExit (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragexit", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragLeave (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragleave", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragOver (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragover", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDragStart (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("dragstart", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    $listenDrop (handler : DragEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("drop", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerOver (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerover", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerEnter (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerenter", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerDown (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerdown", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerMove (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointermove", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerUp (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerup", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerCancel (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointercancel", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerOut (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerout", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenPointerLeave (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("pointerleave", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenGotPointerCapture (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("gotpointercapture", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    $listenLostPointerCapture (handler : PointerEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("lostpointercapture", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $listenAnimationStart (handler : AnimationEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationstart", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $listenAnimationEnd (handler : AnimationEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationend", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    $listenAnimationIteraton (handler : AnimationEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("animationiteration", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $listenClipboardChange (handler : ClipboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("clipboardchange", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $listenCut (handler : ClipboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("cut", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $listenCopy (handler : ClipboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
        this.$listen("copy", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    $listenPaste (handler : ClipboardEvent => void, options : ?EventListenerOptionsOrUseCapture) {
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

        this.$.watch.add(new Expression(func, vars, !this.freezed));
    }

    /**
     * Creates a bind expression
     * @param f {Function} function to alc expression value
     * @param args {...IValue} value sto bind
     * @return {IBind}
     */
    $bind (f : Function, ...args : Array<IValue<any>>) : IBind {
        let res : IBind;

        if (args.length === 0) {
            throw wrongBinding("no values to bind");
        }
        else {
            res = new Expression(f, args, !this.freezed);
        }

        this.$.watch.add(res);
        return res;
    }

    $runOnDestroy (f : Function) {
        (this.$ : BaseNodePrivate).onDestroy = f;
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
            if (child.$.unmounted) continue;

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
        let $ : BaseNodePrivate = this.$;
        before = before || $.next;

        while (before && before.$.unmounted) {
            before = before.$.next;
        }

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
            (this instanceof TagNode && (!$.el || $.el === node))) {
            $.parent.$$appendChild(node, $.next);
            return;
        }

        // If we have no more variants
        $.app.$run.appendChild($.el, node);
    }

    /**
     * Disable/Enable reactivity of component with feedback
     * @param cond {IValue} show condition
     * @param onOff {Function} on show feedback
     * @param onOn {Function} on hide feedback
     */
    $bindFreeze (cond : IValue<boolean>, onOff : ?Function, onOn : ?Function, onOffAfter: ?Function, onOnAfter : ?Function) : this {
        let $ : BaseNodePrivate = this.$;

        if ($.watch.has(cond)) {
            throw wrongBinding(":show must be bound to an external component");
        }

        let expr = null;

        expr = new Expression((cond) => {
            $.frozen = !cond;

            if (cond) {
                onOn?.();
                for (let watcher of $.watch) {
                    if (watcher instanceof IBind) {
                        watcher.link();
                    }
                }
                onOnAfter?.();
            }
            else {
                onOff?.();
                for (let watcher of $.watch) {
                    if (watcher instanceof IBind && watcher !== expr) {
                        watcher.unlink();
                    }
                }
                onOffAfter?.();
            }
        }, [cond]);

        $.watch.add(expr);
    }

    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    $bindShow (cond : IValue<boolean>) : this {
        let $ : BaseNodePrivate = this.$;
        let lastDisplay = $.el.style.display;

        return this.$bindFreeze(cond, () => {
            lastDisplay = $.el.style.display;
            $.el.style.display = 'none';
        }, () => {
            $.el.style.display = lastDisplay;
        });
    }

    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    $bindMount (cond : IValue<boolean>) : this {
        let $ : BaseNodePrivate = this.$;

        return this.$bindFreeze(cond, () => {
            $.unmounted = true;
        }, () => {
            $.unmounted = false;
        });
    }

    /**
     * Enable/Disable reactivity o component
     * @param cond {IValue} show condition
     */
    $bindAlive (cond : IValue<boolean>) : this {
        return this.$bindFreeze(cond);
    }

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {?function (TextNode)} Callback if previous is slot name
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
     * @param cb {function(TagNode, *)} Callback if previous is slot name
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
        node.$init();
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
     * @param props {function(BaseNode)} List of properties values
     * @param cb {?function(BaseNode, *)} Callback if previous is slot name
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

    /**
     * Calls callback function to create properties
     * @param node {BaseNode}
     * @param props {function(BaseNode)}
     * @return {*}
     */
    $$callPropsCallback<T> (node : T, props : ($ : T) => void) {
        if (node instanceof BaseNode) {
            let obj = {
                $bind : function (...args) {
                    return node.$bind(...args);
                }
            };

            for (let i in node) {
                if (node.hasOwnProperty(i)) {
                    Object.defineProperty(obj, i, {
                        configurable : false,
                        enumerable   : false,
                        set (value) {
                            node.$$unsafeAssign(node, i, value);
                        },
                        get () {
                            return (node : Object)[i];
                        }
                    });
                }
            }

            //$FlowFixMe[incompatible-call]
            props(obj);
            node.$init();
        }
    }

    /**
     * Defines a repeater node
     * @param nodeT {RepeatNode} A repeat node object
     * @param props {function(BaseNode)} Send data to repeat node
     * @param cb {function(RepeatNodeItem, *)} Call-back to create child nodes
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
     * @param cb {function(RepeatNodeItem, ?number)} Call-back to create child nodes
     * @return {this}
     */
    $defIf (
        cond : any,
        cb : (node : RepeatNodeItem, v : ?number) => void
    ) : this {
        return this.$defSwitch({ cond, cb });
    }

    /**
     * Defines a if-else node
     * @param ifCond {* | IValue<*>} `if` condition
     * @param ifCb {function(RepeatNodeItem, ?number)} Call-back to create `if` child nodes
     * @param elseCb {function(RepeatNodeItem, ?number)} Call-back to create `else` child nodes
     * @return {this}
     */
    $defIfElse (
        ifCond : any,
        ifCb : (node : RepeatNodeItem, v : ?number) => void,
        elseCb : (node : RepeatNodeItem, v : ?number) => void
    ) : this {
        return this.$defSwitch({ cond : ifCond, cb : ifCb }, { cond : true, cb : elseCb });
    }

    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue<boolean> | boolean, cb : function(RepeatNodeItem, ?number) }}
     * @return {BaseNode}
     */
    $defSwitch (
        ...cases : Array<{ cond : IValue<boolean> | boolean, cb : (node : RepeatNodeItem, v : ?number) => void }>
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
        node.$init();
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

    /**
     * Runs GC
     */
    $destroy () {
        super.$destroy();
        this.$node.remove();
        //$FlowFixMe
        this.$node = null;
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

    /**
     * Runs GC
     */
    $destroy () {
        super.$destroy();
    }
}

/**
 * Defines a node which cas has just a child (TagNode | UserNode)
 */
export class UserNode extends ExtensionNode {
    $mounted () {
        super.$mounted();

        if (this.$children.length !== 1) {
            throw userError("UserNode must have a child only", "dom-error");
        }
        let child = this.$children[0];

        if (child instanceof TagNode || child instanceof UserNode) {
            let $ : BaseNodePrivate = this.$.

            $.encapsulate(child.$.el);
            if ($.app.$debug) {
                this.$.el.vasille ||= this;
            }
        }
        else {
            throw userError("UserNode child must be TagNode or UserNode", "dom-error");
        }
    }
}

type CallBack = (node : RepeatNodeItem, v : ?any) => void;
type CaseArg = { cond : IValue<boolean> | boolean, cb : (node : RepeatNodeItem, v : ?number) => void };

/**
 * Defines a abstract node, which represents a dynamical part of application
 */
export class RepeatNodeItem extends ExtensionNode {
    /**
     * node identifier
     * @type {*}
     */
    $id : any;

    /**
     * Constructs a repeat node item
     * @param id {*}
     */
    constructor (id : any) {
        super();
        this.$id = id;
    }

    /**
     * Destroy all children
     */
    $destroy () {
        this.$id = null;
        super.$destroy();
    }
}

/**
 * Private part of switch node
 */
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
     * @type {Array<{cond : IValue<boolean>, cb : function(RepeatNodeItem, ?number)}>}
     */
    cases : { cond : IValue<boolean>, cb : (node : RepeatNodeItem, v : ?number) => void }[];

    /**
     * A function which sync index and content, will be bounded to each condition
     * @type {Function}
     */
    sync : Function;

    /**
     * Runs GC
     */
    $destroy () {
        //$FlowFixMe
        this.index = null;
        //$FlowFixMe
        this.node = null;

        for (let c of this.cases) {
            //$FlowFixMe
            delete c.cond;
            //$FlowFixMe
            delete c.cb;
        }
        this.cases.splice(0);
        //$FlowFixMe
        this.cases = null;
        //$FlowFixMe
        this.sync = null;

        super.$destroy();
    }
}

/**
 * Defines a node witch can switch its children conditionally
 */
class SwitchedNode extends ExtensionNode {
    /**
     * Constructs a switch node and define a sync function
     */
    constructor ($ : SwitchedNodePrivate) {
        super($ || new SwitchedNodePrivate);

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

            if ($.node) {
                $.node.$destroy();
                this.$children.splice(this.$children.indexOf($.node), 1);
                //$FlowFixMe
                $.node = null;
            }

            if (i !== $.cases.length) {
                $.index = i;
                this.createChild(i, $.cases[i].cb);
            }
            else {
                $.index = -1;
            }
        };
    };

    /**
     * Set up switch cases
     * @param cases {{ cond : IValue | boolean, cb : function(RepeatNodeItem, ?number) }}
     */
    setCases (cases : Array<CaseArg>) {
        let $ = this.$;
        $.cases = [];

        for (let case_ of cases) {
            $.cases.push({ cond : vassilify(case_.cond), cb : case_.cb });
        }
    }

    /**
     * Creates a child node
     * @param id {*} id of node
     * @param cb {function(RepeatNodeItem, *)} Call-back
     */
    createChild (id : any, cb : CallBack) {
        let node = new RepeatNodeItem(id);

        node.$.parent = this;
        node.$$preinitShadow(this.$.app, this.$.rt, this);

        node.$init();
        cb(node, id);
        node.$ready();

        this.$.node = node;
        this.$children.push(node);
    };

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

    $mounted () {
        super.$mounted();

        if (this.$debug) {
            (this.$ : BaseNodePrivate).el.vasille = this;
        }
    }

    $destroy () {
        //$FlowFixMe
        this.$run = null;
        super.$destroy();
    }
}
