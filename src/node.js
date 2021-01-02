// @flow
import { AttributeBinding, attributify } from "./attribute.js";
import { Bind1, Binding, BindN }         from "./bind.js";
import { classify }                      from "./class.js";
import { eventify }                      from "./event.js";
import { Executor, InstantExecutor }     from "./executor.js";
import type { CoreEl }                   from "./interfaces/core.js";
import { $destroyObject }                from "./interfaces/core.js";
import { Core }                          from "./interfaces/core.js";
import { IBind }                         from "./interfaces/ibind.js";
import { Callable }                      from "./interfaces/idefinition.js";
import { IValue }                        from "./interfaces/ivalue.js";
import { vassilify }                     from "./models.js";
import { StyleBinding, stylify }         from "./style.js";
import { Value }                         from "./value.js";
import type { RepeatNode }               from "./views.js";



/**
 * Represents a Vasille.js node
 * @extends Core
 */
export class VasilleNode extends Core {
    /**
     * A link to a parent node
     * @type {VasilleNode}
     */
    $parent : BaseNode;

    /**
     * The next node
     * @type {?VasilleNode}
     */
    $next : ?VasilleNode;

    /**
     * The previous node
     * @type {?VasilleNode}
     */
    $prev : ?VasilleNode;

    /**
     * The root node
     * @type {BaseNode}
     */
    $$rt : BaseNode;

    /**
     * The app node
     * @type {VasilleNode}
     */
    $app : AppNode;

    /**
     * Pre-initializes the base of a node
     * @param app {App} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} VasilleNode to paste this after
     */
    $$preinit (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode) {
        this.$app = app;
        this.$$rt = rt;
    }

    /**
     * Creates a reference to this element
     * @param reference {String} The reference name
     * @param likeArray {Boolean} Store reference to array
     */
    $ref (reference : string, likeArray : boolean = false) : void {
        if (this.$$rt instanceof BaseNode) {
            let ref = this.$$rt.$refs[reference];

            if (likeArray) {
                if (ref instanceof Array) {
                    ref.push(this);
                }
                else {
                    this.$$rt.$refs[reference] = [this];
                }
            }
            else {
                this.$$rt.$refs[reference] = this;
            }
        }
    }

    /**
     * Runs garbage collector
     */
    $destroy () : void {
        super.$destroy();

        if (this.$$rt instanceof BaseNode) {
            for (let i in this.$$rt.$refs) {
                if (this.$$rt.$refs[i] === this) {
                    delete this.$$rt.$refs[i];
                }
                else if (
                    this.$$rt.$refs[i] instanceof Array &&
                    this.$$rt.$refs[i].includes(this)
                ) {
                    this.$$rt.$refs[i].splice(this.$$rt.$refs[i].indexOf(this), 1);
                }
            }
        }
    }
}

/**
 * Represents a text node
 */
export class TextNode extends VasilleNode {
    /**
     * Contains the text of node as Value
     * @type {IValue}
     */
    $$value : IValue<string>;

    /**
     * User defined handler to handle text change
     * @type {Function}
     */
    $$handler : Function;

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param rt {BaseNode} The root node
     * @param ts {BaseNode} The this node
     * @param before {?VasilleNode} node to paste after
     * @param text {String | IValue}
     */
    $$preinitText (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode, text : IValue<string> | string) {
        super.$$preinit(app, rt, ts, before);

        let value = text instanceof IValue ? text : new Value(text);
        let node = document.createTextNode(value.get());

        this.$$value = value;
        this.$$handler = function (v : IValue<string>) {
            node.replaceData(0, -1, v.get());
        }.bind(null, value);

        value.on(this.$$handler);
        this.$$encapsulate(node);

        ts.$$appendChild(node, before);
    }

    /**
     * Runs garbage collector
     */
    $destroy () : void {
        super.$destroy();
        this.$$value.off(this.$$handler);
    }
}

export type Signal = {| args : Array<Function>, handlers : Array<Function> |};

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
     * The building active state
     * @type {boolean}
     */
    $$building : boolean;

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
    $signal : { [name : string] : Signal } = {};

    /**
     * List of references
     * @type {Object<String, VasilleNode|Array<VasilleNode>>}
     */
    $refs : { [key : string] : VasilleNode | Array<VasilleNode> } = {};

    /**
     * List of $slots
     * @type {Object<String, BaseNode>}
     */
    $slots : { [key : string] : BaseNode } = {};

    /**
     * Get the current root (this on building, rt on filling)
     * @type {BaseNode}
     */
    get $rt () : BaseNode {
        return !this.$$building && this.$$rt instanceof BaseNode ? this.$$rt : this;
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
        this.$$preinit(app, rt, ts, before);
        this.$$encapsulate(node);

        ts.$$appendChild(node, before);
    }

    $$startBuilding () {
        this.$slots["default"] = this;
        this.$$building = true;
    }

    $$stopBuilding () {
        this.$$building = false;
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

        if (this.$$rt instanceof BaseNode) {
            for (let i in this.$$rt.$slots) {
                if (this.$$rt.$slots[i] === this) {
                    delete this.$$rt.$slots[i];
                }
            }
        }

        for (let child of this.$children) {
            child.$destroy();
        }

        $destroyObject(this.$class);
        $destroyObject(this.$watch);
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
     * Defines a attribute
     * @param name {String} The name of attribute
     * @param value {String | IValue | Callable} A $$value or a $$value getter
     * @return {BaseNode} A pointer to this
     */
    $defAttr (name : string, value : string | IValue<any> | Callable) : this {
        if (value instanceof Callable) {
            this.$$attrs[name] = attributify(this.$rt, this, name, null, value);
        }
        else {
            this.$$attrs[name] = attributify(this.$rt, this, name, value);
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
            this.$$attrs[i] = attributify(this.$rt, this, i, obj[i]);
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
        this.$$attrs[name] = new AttributeBinding(
            this.$rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    $setAttr (
        name : string,
        value : string
    ) : this {
        this.$app.$run.setAttribute(this.$el, name, value);
        return this;
    }

    $setAttrs (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$app.$run.setAttribute(this.$el, i, data[i]);
        }
        return this;
    }

    $addClass (cl : string) : this {
        this.$el.classList.add(cl);
        return this;
    }

    $addClasses (...cl : Array<string>) : this {
        this.$el.classList.add(...cl);
        return this;
    }

    $bindClass (
        cl : ?string,
        value : boolean | string | IValue<boolean | string> = false,
        func : ?Callable                                    = null
    ) : this {
        this.$class.push(classify(this.$rt, this, cl || "", value, func));
        return this;
    }

    /**
     * Defines a style attribute
     * @param name {String} The name of style attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {BaseNode} A pointer to this
     */
    $defStyle (name : string, value : string | IValue<string> | Callable) : this {
        if (value instanceof Callable) {
            this.$$style[name] = stylify(this.$rt, this, name, null, value);
        }
        else {
            this.$$style[name] = stylify(this.$rt, this, name, value);
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
            this.$$style[i] = stylify(this.$rt, this, i, obj[i]);
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
        this.$$style[name] = new StyleBinding(
            this.$rt,
            this,
            name,
            calculator,
            ...values
        );
        return this;
    }

    $setStyle (
        prop : string,
        value : string
    ) : this {
        this.$app.$run.setStyle(this.$el, prop, value);
        return this;
    }

    $setStyles (
        data : { [key : string] : string }
    ) : this {
        for (let i in data) {
            this.$app.$run.setStyle(this.$el, i, data[i]);
        }
        return this;
    }

    $defSignal (name : string, ...types : Array<Function>) {
        this.$signal[name] = { args : types, handlers : [] };
    }

    $on (name : string, func : Function) {
        let signal = this.$signal[name];

        if (!signal) {
            throw "No such signal: " + name;
        }

        this.$signal[name].handlers.push(func);
    }

    $emit (name : string, ...args : Array<any>) {
        let compatible = args.length === this.$signal[name].args.length;

        if (compatible && this.$app.$debug) {
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
    $defListener (name : string, event : Function) : this {
        this.$listener[name] = eventify(this, name, event);
        return this;
    }

    $listen (name : string, handler : Function, options : ?EventListenerOptionsOrUseCapture) : this {
        this.$el.addEventListener(name, handler, options || {});
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

    $defWatcher (func : Function, ...vars : Array<IValue<any>>) {
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
    $makeSlot (name : string) : this {
        if (this.$$rt instanceof BaseNode) {
            this.$$rt.$slots[name] = this;
        }
        return this;
    }

    $slot (name : string) : BaseNode {
        let node = this.$slots[name];

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
            lastChild.$next = node;
        }
        node.$prev = lastChild;
        node.$parent = this;

        this.$children.push(node);
    }

    $$findFirstChild (node : ShadowNode) : ?CoreEl {
        for (let child of node.$children) {
            if (child instanceof ShadowNode) {
                let first = this.$$findFirstChild(child);

                if (first) {
                    return first;
                }
            }
            else if (child instanceof ElementNode || child instanceof TextNode) {
                return child.$$el;
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
            this.$app.$run.insertBefore(this.$el, node, before.$el);
            return;
        }

        // If we are inserting in a shadow node or uninitiated element node
        if (
            (this instanceof ShadowNode && !(this.$parent instanceof AppNode)) ||
            (this instanceof ElementNode && !this.$el)
        ) {
            this.$parent.$$appendChild(node, this.$next);
            return;
        }

        // If we are inserting before a shadow node
        if (before instanceof ShadowNode) {
            let beforeNode = this.$$findFirstChild(before);

            if (beforeNode) {
                this.$app.$run.insertBefore(this.$el, node, beforeNode);
                return;
            }
        }

        // If we have no more variants
        this.$app.$run.appendChild(this.$el, node);
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
        if (this.$slots["default"] !== this && !this.$$building) {
            this.$slots["default"].$defText(text, cb);
            return this;
        }

        let node = new TextNode();

        node.$$preinitText(this.$app, this.$rt, this, null, text);
        this.$$pushNode(node);

        if (cb) {
            this.$app.$run.callCallback(() => {
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
        if (this.$slots["default"] !== this && !this.$$building) {
            this.$slots["default"].$defTag(tagName, cb);
            return this;
        }
        let node = new ElementNode();

        node.$parent = this;
        node.$$preinitElementNode(this.$app, this.$rt, this, null, tagName);
        node.$init({});
        this.$$pushNode(node);

        this.$app.$run.callCallback(() => {
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
        if (this.$slots["default"] !== this && !this.$$building) {
            this.$slots["default"].$defElement(node, props, cb);
            return this;
        }

        if (node instanceof VasilleNode) {
            node.$parent = this;
        }

        if (node instanceof ShadowNode) {
            node.$$preinitShadow(this.$app, this.$rt, this, null);
        }
        else if (node instanceof VasilleNode) {
            node.$$preinit(this.$app, this.$rt, this, null);
        }

        if (node instanceof BaseNode) {
            node.$init(props);
        }

        if (node instanceof VasilleNode) {
            this.$$pushNode(node);
        }

        this.$app.$run.callCallback(() => {
            if (cb) {
                cb(node);
            }

            if (node instanceof BaseNode) {
                node.$ready();
            }
        });

        return this;
    }

    $defRepeater (
        node : RepeatNode,
        props : Object,
        cb : (node : RepeatNodeItem, v : ?any) => void
    ) : this {
        if (this.$slots["default"] !== this && !this.$$building) {
            this.$slots["default"].$defRepeater(node, props, cb);
            return this;
        }

        node.$parent = this;
        node.$$preinitShadow(this.$app, this.$rt, this, null);
        node.$init(props);
        this.$$pushNode(node);
        node.setCallback(cb);
        this.$app.$run.callCallback(() => {
            node.$ready();
        });

        return this;
    }

    $defIf (
        cond : any,
        cb : CaseCallBack
    ) : this {
        return this.$defSwitch({ cond, cb });
    }

    $defIfElse (
        ifCond : any,
        ifCb : CaseCallBack,
        elseCb : CaseCallBack
    ) : this {
        return this.$defSwitch({ cond : ifCond, cb : ifCb }, { cond : true, cb : elseCb });
    }

    $defSwitch (
        ...cases : Array<CaseArg>
    ) : this {
        if (this.$slots["default"] !== this && !this.$$building) {
            this.$slots["default"].$defSwitch(...cases);
            return this;
        }

        let node = new SwitchedNode();

        node.$parent = this;
        node.$$preinitShadow(this.$app, this.$rt, this, null);
        node.$init({});
        this.$$pushNode(node);
        node.setCases(cases);
        this.$app.$run.callCallback(() => {
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
        let node = document.createElement(tagName);
        this.$$preinitNode(app, rt, ts.$parent || ts, before, node);
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
        this.$$preinit(app, rt, ts, before);

        try {
            this.$$encapsulate(ts.$el);
        }
        catch (e) {
            throw "A shadow node can be encapsulated in a element or shadow node only";
        }
    }

    $destroy () {
        super.$destroy();
    }
}

type CallBack = (node : RepeatNodeItem, v : ?any) => void;
type CaseCallBack = (node : RepeatNodeItem, v : ?number) => void;
type Case = { cond : IValue<boolean>, cb : CaseCallBack };
type CaseArg = { cond : IValue<boolean> | boolean, cb : CaseCallBack };

export class RepeatNodeItem extends ShadowNode {
    $id : any;

    constructor (id : any) {
        super();
        this.$id = id;
    }

    $destroy () {
        super.$destroy();

        for (let child of this.$children) {
            if (child.$el !== this.$el) {
                this.$el.removeChild(child.$el);
            }
        }
    }
}

class SwitchedNode extends ShadowNode {

    index : number = -1;
    node : ShadowNode;
    cases : Array<Case>;
    sync : Function;

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

    setCases (cases : Array<CaseArg>) {
        this.cases = [];

        for (let case_ of cases) {
            this.cases.push({ cond : vassilify(case_.cond), cb : case_.cb });
        }
    }

    $$preinitShadow (app : AppNode, rt : BaseNode, ts : BaseNode, before : ?VasilleNode) {
        super.$$preinitShadow(app, rt, ts, before);
        this.$$encapsulate(ts.$el);
    }

    createChild (id : any, cb : CallBack) {
        let node = new RepeatNodeItem(id);

        node.$parent = this;
        node.$$preinitShadow(this.$app, this.$rt, this);

        node.$init({});
        cb(node, id);
        node.$ready();

        this.node = node;
    };



    $ready () {
        super.$ready();

        for (let c of this.cases) {
            c.cond.on(this.sync);
        }

        this.sync();
    }

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

    $run : Executor;

    /**
     * Constructs a app node
     * @param node {HTMLElement} The root of application
     * @param props {{debug : boolean}} Application properties
     */
    constructor (node : HTMLElement, props : { debug : boolean }) {
        super();

        this.$run = new InstantExecutor();
        this.$$encapsulate(node);
        this.$$preinit(this, this, this, this);

        if (props.debug instanceof Boolean) {
            this.$debug = props.debug;
        }
    }
}
