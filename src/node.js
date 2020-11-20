// @flow
import { AttributeBinding, attributify }     from "./attribute.js";
import { Bind1, Binding, BindN }             from "./bind";
import { classify }                          from "./class";
import { CssCompozitor, CssDebugCompozitor } from "./css";
import { datify }                            from "./data.js";
import { eventify }                          from "./event.js";
import { Executor, FastExecutor }            from "./executor";
import type { CoreEl }                       from "./interfaces/core";
import { destroyObject }                     from "./interfaces/core";
import { Core }                              from "./interfaces/core.js";
import { IBind }                             from "./interfaces/ibind";
import { Callable }                          from "./interfaces/idefinition.js";
import { IValue }                            from "./interfaces/ivalue.js";
import { propertify, Property }              from "./property.js";
import { StyleBinding, stylify }             from "./style.js";
import { Value }                             from "./value.js";
import type { RepeatNode, RepeatNodeItem }   from "./views";



export interface INode {
    appendChild ( node : CoreEl, before : Node ) : void;
}

/**
 * Represents a Vasille.js node
 * @extends Core
 */
export class Node extends Core {
    /**
     * A link to a parent node
     * @type {Node}
     */
    parent : Node;

    /**
     * The next node
     * @type {?Node}
     */
    next : ?Node;

    /**
     * The previous node
     * @type {?Node}
     */
    prev : ?Node;

    /**
     * The root node
     * @type {BaseNode}
     */
    $rt : Core;

    /**
     * The app node
     * @type {Node}
     */
    $app : AppNode;

    /**
     * Begin comment for debugging
     * @type {Comment}
     */
    debugComment : Comment;

    /**
     * Construct the base of a node
     */
    constructor () {
        super ();
    }

    /**
     * Pre-initializes the base of a node
     * @param app {App} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?Node} Node to paste this after
     */
    preinit ( app : AppNode, rt : BaseNode, ts : BaseNode, before : ?Node ) {
        this.$app = app;
        this.$rt = rt;

        if (!(
            this.constructor === ElementNode || this.constructor === TextNode || this instanceof ShadowNode
        )) {
            this.debugComment = document.createComment ( ` ${ rt.constructor.name } > ${ this.constructor.name } ` );
            ts.appendChild ( this.debugComment, before );
        }
    }

    /**
     * Creates a reference to this element
     * @param reference {String} The reference name
     * @param likeArray {Boolean} Store reference to array
     */
    ref ( reference : string, likeArray : boolean = false ) : void {
        if (this.$rt instanceof BaseNode) {
            let ref = this.$rt.$refs[reference];

            if (likeArray) {
                if (ref instanceof Array) {
                    ref.push ( this );
                }
                else {
                    this.$rt.$refs[reference] = [this];
                }
            }
            else {
                this.$rt.$refs[reference] = this;
            }
        }
    }

    /**
     * Runs garbage collector
     */
    destroy () : void {
        super.destroy ();

        if (this.$rt instanceof BaseNode) {
            for (let i in this.$rt.$refs) {
                if (this.$rt.$refs[i] === this) {
                    delete this.$rt.$refs[i];
                }
                else if (
                    this.$rt.$refs[i] instanceof Array &&
                    this.$rt.$refs[i].includes ( this )
                ) {
                    this.$rt.$refs[i].splice ( this.$rt.$refs[i].indexOf ( this ), 1 );
                }
            }
        }
    }
}

/**
 * Represents a text node
 */
export class TextNode extends Node {
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
     * Constructs a text node
     */
    constructor () {
        super ();
    }

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {Node} node to apste after
     * @param text {String | IValue}
     */
    preinitText ( app : AppNode, rt : BaseNode, ts : BaseNode, before : Node, text : IValue<string> | string ) {
        super.preinit ( app, rt, ts, before );

        let value = text instanceof IValue ? text : new Value ( text );
        let node = document.createTextNode ( value.get () );

        this.value = value;
        this.handler = function ( v : IValue<string> ) {
            node.replaceData ( 0, -1, v.get () );
        }.bind ( null, value );

        value.on ( this.handler );

        ts.appendChild ( node, before );
    }

    /**
     * Runs garbage collector
     */
    destroy () : void {
        super.destroy ();
        this.value.off ( this.handler );
    }
}

export type TextNodeCB = ( text : TextNode, v : ?any ) => void;
export type ElementNodeCB = ( text : ElementNode, v : ?any ) => void;
export type Signal = {|args : Array<Function>, handlers : Array<Function> |};

/**
 * Represents an Vasille.js node which can contains children
 * @extends Node
 */
export class BaseNode extends Node implements INode {
    /**
     * The children list
     * @type {Array<Node>}
     */
    children : Array<Node> = [];

    /**
     * The building active state
     * @type {boolean}
     */
    building : boolean;

    /**
     * Represents style bindings
     * @type {Array<Binding>}
     */
    $class : Array<Binding> = [];

    /**
     * Represents a list of user-defined bindings
     * @type {Array<IBind>}
     */
    $watch : Array<IBind> = [];

    /**
     * List of events
     * @type {Object<String, IValue>}
     */
    $listener : { [key : string] : IValue<Function> } = {};

    /**
     * List of user defined signals
     * @type {Object<string, {args : Array<Function>, handlers : Array<Function>}>}
     */
    $signal : { [name : string]: Signal };

    /**
     * List of references
     * @type {Object<String, Node|Array<Node>>}
     */
    $refs : { [key : string] : Node | Array<Node> } = {};

    /**
     * List of $slots
     * @type {Object<String, BaseNode>}
     */
    $slots : { [key : string] : BaseNode } = {};

    /**
     * List of defined properties
     * @type {Object<String, Property>}
     */
    $propsDefs : { [key : string] : Property } = {};

    /**
     * Constructs a base node which can contain children
     */
    constructor () {
        super ();
    }

    /**
     * Get the current root (this on building, $rt on filling)
     * @type {BaseNode}
     */
    get rt () : BaseNode {
        return !this.building && this.$rt instanceof BaseNode ? this.$rt : this;
    }

    /**
     * Pre-initializes a base node which can contain children
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {Node} node to paste after it
     * @param node {HTMLElement | Text | Comment} The encapsulated node
     */
    preinitNode (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : Node,
        node : CoreEl
    ) {
        this.preinit ( app, rt, ts, before );
        this.encapsulate ( node );

        ts.appendChild ( node, before );
    }

    startBuilding () {
        this.$slots["default"] = this;
        this.building = true;
    }

    stopBuilding () {
        this.building = false;
        this.mounted ();
    }

    /**
     * Initialize node
     * @param props {Object} Node properties values
     */
    init ( props : Object ) {
        this.startBuilding ();

        this.createProps ();
        this.initProps ( props );
        this.createData ();
        this.createAttrs ();
        this.createStyle ();
        this.createSignals ();
        this.createWatchers ();

        this.$app.css.initStyle(this);

        this.created ();
        this.createDom ();

        this.stopBuilding ();
    }

    /** To be overloaded: created event handler */
    created () {
    }

    /** To be overloaded: ready event handler */
    ready () {
    }

    /** To be overloaded: mounted event handler */
    mounted () {
    }

    /**
     * Runs garbage collector
     */
    destroy () : void {
        super.destroy ();

        if (this.$rt instanceof BaseNode) {
            for (let i in this.$rt.$slots) {
                if (this.$rt.$slots[i] === this) {
                    delete this.$rt.$slots[i];
                }
            }
        }

        for (let child of this.children) {
            child.destroy ();
        }

        destroyObject(this.$class);
        destroyObject(this.$watch);
    }

    /** To be overloaded: property creation milestone */
    createProps () {
    }

    /** To be overloaded: data creation milestone */
    createData () {
    }

    /** To be overloaded: attributes creation milestone */
    createAttrs () {
    }

    /** To be overloaded: style attributes creation milestone */
    createStyle () {
    }

    /** To be overloaded: signals creation milestone */
    createSignals () {
    }

    /** To be overloaded: watchers creation milestone */
    createWatchers () {
    }

    /** To be overloaded: DOM creation milestone */
    createDom () {
    }

    /**
     * Defines a property
     * @param name {String} The name of property
     * @param _type {Function} The type checker and constructor
     * @param init {...any} Constructor arguments
     * @return {BaseNode} A pointer to this
     */
    defProp ( name : string, _type : Function, ...init : Array<any> ) : this {
        this.$propsDefs[name] = new Property ( _type, ...init );
        return this;
    }

    /**
     * Defines a set of properties without constructor arguments
     * @param props {Object<String, Function>} The collection of properties
     * @return {BaseNode} A pointer to this
     */
    defProps ( props : { [key : string] : Function } ) : this {
        for (let i in props) {
            if (props.hasOwnProperty ( i )) {
                this.$propsDefs[i] = new Property ( props[i] );
            }
        }
        return this;
    }

    /**
     * Initializes the node properties
     * @param props {Object<String, Callable | IValue | *>} Properties values
     * @private
     */
    initProps ( props : { [key : string] : Callable | IValue<any> | any } ) {
        // add properties from object
        for (let i in props) {
            if (props.hasOwnProperty ( i )) {
                let value = props[i];
                let propertyValue;

                if (value instanceof Callable) {
                    propertyValue = propertify ( null, value );
                }
                else {
                    propertyValue = propertify ( value );
                }

                if (!this.$propsDefs[i]) {
                    throw "No such property: " + i;
                }
                let v = propertyValue.get();
                let t = this.$propsDefs[i].type;
                if (!(v instanceof t ) &&
                    !(typeof v === "number" && t === Number) &&
                    !(typeof v === "string" && t === String) &&
                    !(typeof v === "boolean" && t === Boolean)
                ) {
                    throw "Wrong value type of property: " + i;
                }

                this.$props[i] = propertyValue;
            }
        }

        // Create default value for missing properties
        for (let i in this.$propsDefs) {
            if (!this.$props[i]) {
                this.$props[i] = this.$propsDefs[i].createDefaultValue ();
            }
        }
    }

    /**
     * Crates the object data
     * @param nameOrSet {string | Object<String, *>} The data name of set of data
     * @param funcOrAny {?Callable | ?*} Function to calculate a value or a value
     * @return {BaseNode} A pointer to this
     */
    defData (
        nameOrSet : string | { [key : string] : any },
        funcOrAny : ?Callable | ?any = null
    ) : this {
        if (nameOrSet instanceof String && funcOrAny instanceof Callable) {
            this.$data[nameOrSet] = datify ( null, funcOrAny );
            return this;
        }

        if (nameOrSet instanceof String) {
            this.$data[nameOrSet] = datify ( funcOrAny );
            return this;
        }

        if (nameOrSet instanceof Object && funcOrAny == null) {
            for (let i in nameOrSet) {
                if (nameOrSet.hasOwnProperty ( i )) {
                    this.$data[i] = datify ( nameOrSet[i] );
                }
            }
            return this;
        }

        throw "Wrong function call";
    }

    /**
     * Defines a attribute
     * @param name {String} The name of attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {BaseNode} A pointer to this
     */
    defAttr ( name : string, value : string | IValue<any> | Callable ) : this {
        if (value instanceof Callable) {
            this.$attrs[name] = attributify ( this.rt, this, name, null, value );
        }
        else {
            this.$attrs[name] = attributify ( this.rt, this, name, value );
        }
        return this;
    }

    /**
     * Defines a set of attributes
     * @param obj {Object<String, String | IValue>} A set attributes
     * @return {BaseNode} A pointer to this
     */
    defAttrs ( obj : { [key : string] : string | IValue<any> } ) : this {
        for (let i in obj) {
            this.$attrs[i] = attributify ( this.rt, this, i, obj[i] );
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
    bindAttr (
        name : string,
        calculator : Function,
        ...values : Array<IValue<any>>
    ) : this {
        this.$attrs[name] = new AttributeBinding (
            this.rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    setAttr (
        name: string,
        value: string
    ) : this {
        this.$app.run.setAttribute(this.el, name, value);
        return this;
    }
    
    setAttrs (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$app.run.setAttribute(this.el, i, data[i]);
        }
        return this;
    }

    addClass ( cl : string ) : this {
        let classes = this.scopedClass(cl);
        for (let cl of classes) {
            this.el.classList.add(cl);
        }
        return this;
    }

    bindClass (
        cl : ?string,
        value : boolean | string | IValue<boolean | string> = false,
        func : ?Callable                                    = null
    ) : this {
        this.$class.push ( classify ( this.rt, this, cl || '', value, func ) );
        return this;
    }

    scopedClass (cl : ?string) : Array<string> {
        return cl ? this.$app.css.scopedClass(this, cl) : [];
    }

    createCss () : { [key : string] : Object } {
        return {};
    }

    createReposiveCss () : { [key : string] : { [key : string] : Object } } {
        return {};
    }

    /**
     * Defines a style attribute
     * @param name {String} The name of style attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {BaseNode} A pointer to this
     */
    defStyle ( name : string, value : string | IValue<any> | Callable ) : this {
        if (value instanceof Callable) {
            this.$style[name] = stylify ( this.rt, this, name, null, value );
        }
        else {
            this.$style[name] = stylify ( this.rt, this, name, value );
        }
        return this;
    }

    /**
     * Defines a set of style attributes
     * @param obj {Object<String, String | IValue>} A set of style attributes
     * @return {BaseNode} A pointer to this
     */
    defStyles ( obj : { [key : string] : string | IValue<any> } ) : this {
        for (let i in obj) {
            this.$style[i] = stylify ( this.rt, this, i, obj[i] );
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
    bindStyle (
        name : string,
        calculator : Function,
        ...values : Array<IValue<any>>
    ) : this {
        this.$style[name] = new StyleBinding (
            this.rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    setStyle (
        prop : string,
        value : string
    ) : this {
        this.$app.run.setStyle( this.el, prop, value );
        return this;
    }

    setStyles (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$app.run.setStyle( this.el, i, data[i] );
        }
        return this;
    }

    defSignal ( name : string, ...types : Array<Function> ) {
        this.$signal[name] = { args: types, handlers: [] };
    }

    on ( name : string, func : Function ) {
        this.$signal[name].handlers.push(func);
    }

    emit ( name : string, ...args : Array<any> ) {
        let compatible = args.length === this.$signal[name].args.length;

        if (compatible && this.$app.debug) {
            for (let i = 0; i < args.length; i++) {
                let v = args[i], t = this.$signal[name].args[i];

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

        for (let handler of this.$signal[name].handlers) {
            try {
                handler(...args);
            }
            catch (e) {
                console.error(`Handler throw exception at ${this.constructor.name}::${name}: `, e);
            }
        }
    }

    /**
     * Defines a element event
     * @param name {String} Event name
     * @param event {Function} Event handler as function
     * @return {BaseNode} A pointer to this
     */
    defListener ( name : string, event : Function ) : this {
        this.$listener[name] = eventify ( this.rt, this, name, event );
        return this;
    }

    addListener ( name : string, handler : Function, options: EventListenerOptionsOrUseCapture ) : this {
        this.el.addEventListener(name, handler, options);
        return this;
    }

    removeListener ( name : string, handler : Function, options: EventListenerOptionsOrUseCapture ) : this {
        this.el.removeEventListener(name, handler, options);
        return this;
    }

    defWatcher ( func: Function, ...vars : Array<IValue<any>> ) {
        if (vars.length === 0) {
            throw "A watcher must be binded to a value at last";
        }

        if (vars.length === 1) {
            this.$watch.push(new Bind1(func, vars[0]));
        }
        else {
            this.$watch.push(new BindN(func, vars));
        }
    }

    /**
     * Register current node as named slot
     * @param name {String} The name of slot
     */
    slot ( name : string ) : this {
        if (this.$rt instanceof BaseNode) {
            this.$rt.$slots[name] = this;
        }
        return this;
    }

    /**
     * Pushes a node to children immediately
     * @param node {Node} A node to push
     * @private
     */
    pushNodeNow ( node : Node ) : void {
        if (this.lastChild) {
            this.lastChild.next = node;
        }
        node.prev = this.lastChild;
        node.parent = this;

        this.children.push ( node );
        this.lastChild = node;
    }

    /**
     * Pushes a node with children slot checking
     * @param node {Node} A node to push
     * @param slotName {String} The slot name
     */
    pushNode ( node : Node, slotName : ?string ) : void {
        if (this.building) {
            this.pushNodeNow ( node );
        }
        else {
            let slot = slotName ? this.$slots[slotName] : this.$slots["default"];

            if (!slot) {
                throw "No such slot: " + (
                    slotName || "default"
                );
            }

            slot.pushNodeNow ( node );
        }
    }

    /**
     * Append a child in correct parent (to be overwritten)
     * @param node {HTMLElement | Text | Comment} A node to push
     * @param before {Node} node to paste after
     * @private
     */
    appendChild ( node : CoreEl, before : ?Node ) : void {
        if (before instanceof BaseNode && before.el.nextSibling) {
            this.el.insertBefore ( node, before.el.nextSibling );
        }
        else {
            this.el.appendChild ( node );
        }
    }

    /**
     * The last inserted child (Child are not destructible)
     * @type {?Node}
     */
    lastChild : Node;

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param slot {?String} Slot name
     * @param cb {?Function} Callback if previous is slot name
     * @param v {?IValue} pointer tot current value in repeatable node
     * @return {BaseNode} A pointer to this
     */
    defText (
        text : string | IValue<any>,
        slot : ?string,
        cb : ?TextNodeCB,
        v : ?IValue<any>
    ) : BaseNode {
        let node = new TextNode ();

        node.preinitText ( this.$app, this.rt, this, this.lastChild, text );
        this.pushNode ( node, slot instanceof String ? slot : null );

        if (cb) {
            cb ( node, v );
        }
        return this;
    }

    /**
     * Defines a tag element
     * @param tagName {String} is the tag name
     * @param slot {String | Function} Callback or slot name
     * @param cb {Function} Callback if previous is slot name
     * @param v {IValue} pointer to current item in model of repeatable nodes
     * @return {BaseNode} A pointer to this
     */
    defTag (
        tagName : string,
        slot : ?string,
        cb : ?ElementNodeCB,
        v : ?any
    ) : BaseNode {
        let node = new ElementNode ();

        node.preinitElementNode ( this.$app, this.rt, this, tagName );
        node.init ( {} );
        this.pushNode ( node, slot );

        if (cb) {
            cb ( node, v );
        }
        node.ready();
        return this;
    }

    /**
     * Defines a custom element
     * @param node {*} Custom element constructor
     * @param props {Object} List of properties values
     * @param slot {?String} Slot name
     * @param cb {?Function} Callback if previous is slot name
     * @param v P
     * @return {BaseNode} A pointer to this
     */
    defElement<T> (
        node : T,
        props : Object,
        slot : ?string,
        cb : ?( node : T, v : ?any ) => void,
        v : ?any
    ) : BaseNode {

        if (node instanceof ShadowNode) {
            node.preinitShadow ( this.$app, this.rt, this, this.lastChild );
        }
        else if (node instanceof Node) {
            node.preinit ( this.$app, this.rt, this, this.lastChild );
        }

        if (node instanceof BaseNode) {
            node.init ( props );
        }

        if (node instanceof Node) {
            this.pushNode ( node, slot );
        }

        if (cb) {
            cb ( node, v );
        }

        if (node instanceof BaseNode) {
            node.ready ();
        }
        return this;
    }

    defRepeater (
        node : RepeatNode,
        props : Object,
        slot : ?string,
        cb : ( node : RepeatNodeItem, v : ?any ) => void,
        v : ?any
    ) {
        node.preinitShadow ( this.$app, this.rt, this, this.lastChild );
        node.init ( props );
        this.pushNode ( node, slot );
        node.setCallback(cb);
        node.ready ();
    }
}

/**
 * Represents an Vasille.js HTML element node
 */
export class ElementNode extends BaseNode {
    /**
     * Pointer to embed HTML node
     * @type {HTMLElement}
     */
    node : HTMLElement;

    /**
     * Constructs a element node
     */
    constructor () {
        super ();
    }

    /**
     * Constructs a element node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param tagName {String} Name of HTML tag
     */
    preinitElementNode (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        tagName : string
    ) {
        let node = document.createElement ( tagName );
        this.preinitNode ( app, rt, ts, this.lastChild, node );
        this.node = node;
    }

    /**
     * Returns a pointer to HTML element
     * @return {HTMLElement}
     */
    get el () : HTMLElement {
        return this.node;
    }
}

/**
 * Represents a Vasille.js shadow node
 */
export class ShadowNode extends BaseNode {
    /**
     * A HTML comment used as shadow
     * @type {Comment}
     */
    $shadow : Comment;

    /**
     * Constructs a shadow node
     */
    constructor () {
        super();
    }

    /**
     * Pre-initialize a shadow node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {Node} node to paste after it
     */
    preinitShadow (
        app : AppNode,
        rt : BaseNode,
        ts : BaseNode,
        before : ?Node
    ) {
        this.$shadow = document.createComment ( ` ${ rt.constructor.name } > ${ this.constructor.name } ` );
        this.preinit ( app, rt, ts, before );

        try {
            this.encapsulate ( ts.el );
        }
        catch (e) {
            throw "A shadow node can be encapsulated in a element or shadow node only";
        }

        ts.appendChild ( this.$shadow, before );
    }

    destroy () {
        super.destroy ();
        this.el.removeChild ( this.$shadow );
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
    debug : boolean = false;

    run : Executor;

    css : CssCompozitor;

    /**
     * Constructs a app node
     * @param node {HTMLElement} The root of application
     * @param props {{debug : boolean}} Application properties
     */
    constructor ( node : HTMLElement, props : { debug : boolean } ) {
        super ();

        this.run = new FastExecutor ();
        this.css = new CssDebugCompozitor ();
        this.encapsulate ( node );
        this.preinit ( this, this, this, this );

        if (props.debug instanceof Boolean) {
            this.debug = props.debug;
        }

        this.init ( {} );
    }
}
