// @flow
import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import { Reference } from "../value/reference";
import { Expression } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { ClassBinding } from "../binding/class";
import { StyleBinding } from "../binding/style";
import { Slot } from "../core/slot";
import { internalError, userError } from "../core/errors";
import type { AppNode } from "./app";



/**
 * Represents a Vasille.js node
 * @extends ReactivePrivate
 */
export class FragmentPrivate extends ReactivePrivate {

    /**
     * The app node
     * @type {Fragment}
     */
    public app : AppNode;

    /**
     * A link to a parent node
     * @type {Fragment}
     */
    public parent : Fragment;

    /**
     * The next node
     * @type {?Fragment}
     */
    public next ?: Fragment;

    /**
     * The previous node
     * @type {?Fragment}
     */
    public prev ?: Fragment;

    /**
     * The building active state
     * @type {boolean}
     */
    public building : boolean;

    public constructor () {
        super ();
        this.$seal ();
    }

    /**
     * Pre-initializes the base of a fragment
     * @param app {App} the app node
     */
    public preinit (app : AppNode) {
        this.app = app;
    }

    /**
     * Unlinks all bindings
     */
    public $destroy () {
        this.next = null;
        this.prev = null;
    }
}

/**
 * This class is symbolic
 * @extends Reactive
 */
export class Fragment extends Reactive {

    protected $ : FragmentPrivate;

    /**
     * The children list
     * @type {Array<Fragment>}
     */
    public $children : Array<Fragment> = [];

    /**
     * Constructs a Vasille Node
     * @param $ {FragmentPrivate}
     */
    public constructor ($ ?: FragmentPrivate) {
        super ();
        this.$ = $ || new FragmentPrivate;
    }

    get app () : AppNode {
        return this.$.app;
    }

    /**
     * Start component building
     */
    protected $$startBuilding () {
        this.$.building = true;
    }

    /**
     * Stop component building
     */
    protected $$stopBuilding () {
        this.$.building = false;
        this.$mounted();
    }

    public $preinit (app: AppNode, parent : Fragment, data ?: any) {
        const $ : FragmentPrivate = this.$;

        $.preinit(app);
        $.parent = parent;
    }

    /**
     * Initialize node
     */
    public $init () : this {
        this.$$startBuilding();

        this.$createSignals();
        this.$createWatchers();

        this.$created();
        this.$compose();

        this.$$stopBuilding();

        return this;
    }

    /** To be overloaded: created event handler */
    public $created () {
    }

    /** To be overloaded: mounted event handler */
    public $mounted () {
    }

    /** To be overloaded: ready event handler */
    public $ready () {
    }

    /** To be overloaded: signals creation milestone */
    public $createSignals () {
    }

    /** To be overloaded: watchers creation milestone */
    public $createWatchers () {
    }

    /** To be overloaded: DOM creation milestone */
    public $compose () {
    }

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @private
     */
    protected $$pushNode (node : Fragment) : void {
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
     * @return {?CoreEl}
     */
    protected $$findFirstChild () : Element {
        for (let child of this.$children) {
            let first = this.$$findFirstChild();

            if (first) {
                return first;
            }
        }
    }

    public $$appendNode (node : Node) : void {
        let $ : FragmentPrivate = this.$;

        if ($.next) {
            $.next.$$insertAdjacent(node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    }

    public $$insertAdjacent (node : Node) : void {
        let child = this.$$findFirstChild();
        let $ : FragmentPrivate = this.$;

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
     * Enable/Disable reactivity of component
     * @param cond {IValue} show condition
     */
    public $bindAlive (cond : IValue<boolean>) : this {
        return this.$bindFreeze(cond);
    }

    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {?function (TextNode)} Callback if previous is slot name
     * @return {INode} A pointer to this
     */
    public $text (
        text : string | IValue<string>,
        cb ?: (text : TextNode) => void
    ) : this {
        let $ = this.$;
        let node = new TextNode();
        let textValue = text instanceof IValue ? text : this.$ref(text);

        node.$preinit($.app, this, textValue);
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
     * @param cb {function(Tag, *)} Callback if previous is slot name
     * @return {INode} A pointer to this
     */
    public $tag<K extends keyof HTMLElementTagNameMap>(
        tagName : K,
        cb ?: (node : Tag, element : HTMLElementTagNameMap[K]) => void
    ) : this
    public $tag<K extends keyof SVGElementTagNameMap>(
        tagName : K,
        cb ?: (node : Tag, element : SVGElementTagNameMap[K]) => void
    ) : this
    public $tag(
        tagName : string,
        cb ?: (node : Tag, element : Element) => void
    ) : this
    public $tag<T extends Element>(
        tagName : string,
        cb ?: (node : Tag, element : T) => void
    ) : this {
        let $ : FragmentPrivate = this.$;
        let node = new Tag();

        node.$preinit($.app, this, tagName);
        node.$init();
        this.$$pushNode(node);

        $.app.$run.callCallback(() => {
            if (cb) {
                cb(node, node.node as T);
            }
            node.$ready();
        });
        return this;
    }

    /**
     * Defines a custom element
     * @param node {*} Custom element constructor
     * @param props {function(INode)} List of properties values
     * @param cb {?function(INode, *)} Callback if previous is slot name
     * @return {INode} A pointer to this
     */
    public $create<T> (
        node : T,
        callback : ($ : T) => void
    ) : this {
        let $ : FragmentPrivate = this.$;

        if (node instanceof Fragment) {
            node.$.parent = this;
            node.$preinit($.app, this);

            callback(node);

            this.$$pushNode(node);
            node.$init().$ready();
        }
        else {
            throw userError('wrong $create call', 'user-error');
        }

        return this;
    }

    /**
     * Defines an if node
     * @param cond {* | IValue<*>} condition
     * @param cb {function(RepeatNodeItem, ?number)} Call-back to create child nodes
     * @return {this}
     */
    public $if (
        cond : any,
        cb : (node : Fragment) => void
    ) : this {
        return this.$switch({ cond, cb });
    }

    /**
     * Defines a if-else node
     * @param ifCond {* | IValue<*>} `if` condition
     * @param ifCb {function(RepeatNodeItem, ?number)} Call-back to create `if` child nodes
     * @param elseCb {function(RepeatNodeItem, ?number)} Call-back to create `else` child nodes
     * @return {this}
     */
    public $if_else (
        ifCond : any,
        ifCb : (node : Fragment) => void,
        elseCb : (node : Fragment) => void
    ) : this {
        return this.$switch({ cond : ifCond, cb : ifCb }, { cond : new Reference(true), cb : elseCb });
    }

    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue<boolean> | boolean, cb : function(RepeatNodeItem, ?number) }}
     * @return {INode}
     */
    public $switch (
        ...cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>
    ) : this {
        let $ : FragmentPrivate = this.$;
        let node = new SwitchedNode();

        node.$preinit($.app, this);
        node.$init();
        this.$$pushNode(node);
        node.setCases(cases);
        node.$ready();

        return this;
    }

    /**
     * @param cond {IValue<boolean> | boolean}
     * @param cb {(function(RepeatNodeItem, ?number) : void)}
     * @return {{cond : (IValue<boolean>|boolean), cb : (function(RepeatNodeItem, ?number) : void)}}
     */
    public $case (cond : IValue<boolean> | boolean, cb : (node : Fragment) => void)
        : {cond : IValue<boolean> | boolean, cb : (node : Fragment) => void} {
        return {cond, cb};
    }

    /**
     * @param cb {(function(RepeatNodeItem, ?number) : void)}
     * @return {{cond : boolean, cb : (function(RepeatNodeItem, ?number) : void)}}
     */
    public $default (cb: (node : Fragment) => void)
        : {cond : IValue<boolean> | boolean, cb : (node : Fragment) => void} {
        return {cond: true, cb};
    }

    public $destroy () {
        for (let child of this.$children) {
            child.$destroy();
        }

        this.$children.splice(0);
        super.$destroy ();
    }
}

/**
 * The private part of a text node
 */
export class TextNodePrivate extends FragmentPrivate {
    public node : Text;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param text {String | IValue}
     */
    public preinitText (
        app : AppNode,
        text : IValue<string>
    ) {
        super.preinit(app);
        this.node = document.createTextNode(text.$);

        this.bindings.add(new Expression((v : string) => {
            this.node.replaceData(0, -1, v);
        }, true, text));

        if (this.prev) {
            this.prev.$$insertAdjacent(this.node);
        }
        else {
            this.parent.$$appendNode(this.node);
        }
    }

    /**
     * Clear node data
     */
    public $destroy () {
        super.$destroy();
    }
}

/**
 * Represents a text node
 */
export class TextNode extends Fragment {
    /**
     * private data
     * @type {TextNodePrivate}
     */
    protected $ : TextNodePrivate = new TextNodePrivate();

    /**
     * Constructs a text node
     */
    public constructor () {
        super();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param rt {INode} The root node
     * @param ts {INode} The this node
     * @param before {?Fragment} node to paste after
     * @param text {String | IValue}
     */
    public $preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : TextNodePrivate = this.$;

        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }

        $.preinitText(app, text);
    }

    /**
     * Runs garbage collector
     */
    public $destroy () : void {
        this.$.$destroy();
        super.$destroy();
    }
}

/**
 * The private part of a base node
 */
export class INodePrivate extends FragmentPrivate {
    /**
     * Defines if node is unmounted
     * @type {boolean}
     */
    public unmounted : boolean = false;

    public node : Element;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Garbage collection
     */
    public $destroy () {
        super.$destroy();
    }
}

/**
 * Represents an Vasille.js node which can contains children
 * @extends Fragment
 */
export class INode extends Fragment {
    protected $ : INodePrivate;

    /**
     * Constructs a base node
     * @param $ {?INodePrivate}
     */
    constructor ($ ?: INodePrivate) {
        super($ || new INodePrivate);
        this.$seal();
    }

    get node () : Element {
        return this.$.node;
    }

    /**
     * Initialize node
     */
    public $init () : this {
        this.$$startBuilding();

        this.$createAttrs();
        this.$createStyle();
        this.$createSignals();
        this.$createWatchers();

        this.$created();
        this.$compose();

        this.$$stopBuilding();

        return this;
    }

    /** To be overloaded: attributes creation milestone */
    public $createAttrs () {
    }

    /** To be overloaded: $style attributes creation milestone */
    public $createStyle () {
    }

    /**
     * Defines a attribute
     * @param name {String} The name of attribute
     * @param value {String | IValue | Callable} A $$value or a $$value getter
     * @return {INode} A pointer to this
     */
    public $attr (name : string, value : IValue<string>) : this {
        let $ : INodePrivate = this.$;
        let attr = new AttributeBinding(this, name, value);

        $.bindings.add(attr);
        return this;
    }

    /**
     * Creates and binds a multivalued binding to attribute
     * @param name {String} The name of attribute
     * @param calculator {Function} Binding calculator (must return a value)
     * @param values {...IValue} Values to bind
     * @return {INode} A pointer to this
     */
    public $bindAttr<T1> (
        name : string,
        calculator : (a1 : T1) => string,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2> (
        name : string,
        calculator : (a1 : T1, a2 : T2) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5, T6> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5, T6, T7> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5, T6, T7, T8> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this
    public $bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this {
        let $ : INodePrivate = this.$;
        let expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);

        $.bindings.add(new AttributeBinding(this, name, expr));
        return this;
    }

    /**
     * Sets a attribute value
     * @param name {string} Name of attribute
     * @param value {string} Reference of attribute
     * @return {INode} A pointer to this
     */
    public $setAttr (
        name : string,
        value : string
    ) : this {
        this.$.app.$run.setAttribute(this.$.node, name, value);
        return this;
    }

    /**
     * Adds a CSS class
     * @param cl {string} Class name
     * @return {INode} A pointer to this
     */
    public $addClass (cl : string) : this {
        this.$.node.classList.add(cl);
        return this;
    }

    /**
     * Adds some CSS classes
     * @param cl {...string} Classes names
     * @return {INode} A pointer to this
     */
    public $addClasses (...cl : Array<string>) : this {
        this.$.node.classList.add(...cl);
        return this;
    }

    /**
     * Bind a CSS class
     * @param cl {?string}
     * @param className {string | IValue | null}
     * @return {INode}
     */
    public $bindClass (
        className : IValue<string>
    ) : this {
        let $ : INodePrivate = this.$;

        $.bindings.add(new ClassBinding(this, "", className));
        return this;
    }

    public $floatingClass (cond : IValue<boolean>, className : string) : this {
        let $ : INodePrivate = this.$;

        $.bindings.add(new ClassBinding(this, className, cond));
        return this;
    }

    /**
     * Defines a style attribute
     * @param name {String} The name of style attribute
     * @param value {String | IValue | Callable} A value or a value getter
     * @return {this} A pointer to this
     */
    public $style (name : string, value : IValue<string>) : this {
        let $ : INodePrivate = this.$;

        $.bindings.add(new StyleBinding(this, name, value));
        return this;
    }

    /**
     * Creates and binds a calculator to a style attribute
     * @param name {String} Name of style attribute
     * @param calculator {Function} A calculator for style value
     * @param values {...IValue} Values to bind
     * @return {this} A pointer to this
     */
    public $bindStyle<T1> (
        name : string,
        calculator : (a1 : T1) => string,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2> (
        name : string,
        calculator : (a1 : T1, a2 : T2) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5, T6> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5, T6, T7> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5, T6, T7, T8> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this
    public $bindStyle<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this {
        let $ : INodePrivate = this.$;
        let expr = this.$bind<string, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
            calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);

        $.bindings.add(new StyleBinding(this, name, expr));
        return this;
    }

    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     * @return {INode}
     */
    public $setStyle (
        prop : string,
        value : string
    ) : this {
        if (this.$.node instanceof HTMLElement) {
            this.$.app.$run.setStyle(this.$.node, prop, value);
        }
        else {
            throw userError("Style can be setted for HTML elements only", "dom-error");
        }
        return this;
    }

    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     * @return {this}
     */
    public $listen (
        name : string,
        handler : (ev : Event) => void,
        options ?: boolean | AddEventListenerOptions
    ) : this {
        let $ : INodePrivate = this.$;

        $.node.addEventListener(name, handler, options);
        return this;
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $oncontextmenu (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("contextmenu", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmousedown (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mousedown", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmouseenter (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mouseenter", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmouseleave (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mouseleave", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmousemove (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mousemove", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmouseout (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mouseout", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmouseover (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mouseover", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onmouseup (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("mouseup", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $onclick (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("click", handler, options);
    }

    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    public $ondblclick (handler : (ev : MouseEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dblclick", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    public $onblur (handler : (ev : FocusEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("blur", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    public $onfocus (handler : (ev : FocusEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("focus", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    public $onfocusin (handler : (ev : FocusEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("focusin", handler, options);
    }

    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    public $onfocusout (handler : (ev : FocusEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("focusout", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    public $onkeydown (handler : (ev : KeyboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("keydown", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    public $onkeyup (handler : (ev : KeyboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("keyup", handler, options);
    }

    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    public $onkeypress (handler : (ev : KeyboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("keypress", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    public $ontouchstart (handler : (ev : TouchEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("touchstart", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    public $ontouchmove (handler : (ev : TouchEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("touchmove", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    public $ontouchend (handler : (ev : TouchEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("touchend", handler, options);
    }

    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    public $ontouchcancel (handler : (ev : TouchEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("touchcancel", handler, options);
    }

    /**
     * @param handler {function (WheelEvent)}
     * @param options {Object | boolean}
     */
    public $onwheel (handler : (ev : WheelEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("wheel", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onabort (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("abort", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onerror (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("error", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onload (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("load", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onloadend (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("loadend", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onloadstart (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("loadstart", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $onprogress (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("progress", handler, options);
    }

    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    public $ontimeout (handler : (ev : ProgressEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("timeout", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondrag (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("drag", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragend (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragend", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragenter (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragenter", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragexit (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragexit", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragleave (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragleave", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragover (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragover", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondragstart (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("dragstart", handler, options);
    }

    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    public $ondrop (handler : (ev : DragEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("drop", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerover (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerover", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerenter (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerenter", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerdown (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerdown", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointermove (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointermove", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerup (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerup", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointercancel (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointercancel", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerout (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerout", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onpointerleave (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("pointerleave", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $ongotpointercapture (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("gotpointercapture", handler, options);
    }

    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    public $onlostpointercapture (handler : (ev : PointerEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("lostpointercapture", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    public $onanimationstart (handler : (ev : AnimationEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("animationstart", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    public $onanimationend (handler : (ev : AnimationEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("animationend", handler, options);
    }

    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    public $onanimationiteraton (handler : (ev : AnimationEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("animationiteration", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    public $onclipboardchange (handler : (ev : ClipboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("clipboardchange", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    public $oncut (handler : (ev : ClipboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("cut", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    public $oncopy (handler : (ev : ClipboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("copy", handler, options);
    }

    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    public $onpaste (handler : (ev : ClipboardEvent) => void, options ?: boolean | AddEventListenerOptions) : this {
        return this.$listen("paste", handler, options);
    }

    public $$appendNode (node : Node) {
        let $ : INodePrivate = this.$;

        $.app.$run.appendChild($.node, node);
    }

    public $$insertAdjacent (node : Node) {
        let $ : INodePrivate = this.$;

        $.app.$run.insertBefore($.node, node);
    }

    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    public $bindShow (cond : IValue<boolean>) : this {
        let $ : INodePrivate = this.$;
        let node = $.node;

        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            let htmlNode : HTMLElement = node;

            return this.$bindFreeze(cond, () => {
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
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    public $bindMount (cond : IValue<boolean>) : this {
        let $ : INodePrivate = this.$;

        return this.$bindFreeze(cond, () => {
            $.unmounted = true;
        }, () => {
            $.unmounted = false;
        });
    }

    /**
     * bind HTML
     * @param value {IValue<string>}
     */
    public $html (value : IValue<string>) {
        let $ : INodePrivate = this.$;
        const node = $.node;

        if (node instanceof HTMLElement) {
            node.innerHTML = value.$;
            this.$watch((v : string) => {
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
 */
export class Tag extends INode {

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Constructs an element node
     * @param app {App} the app node
     * @param rt {INode} The root node
     * @param ts {INode} The this node
     * @param before {Fragment} Node to insert before it
     * @param tagName {String} Name of HTML tag
     */
    public $preinit (
        app : AppNode,
        parent : Fragment,
        tagName ?: string
    ) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError('wrong Tag::$preinit call');
        }

        let node = document.createElement(tagName);
        let $ : INodePrivate = this.$;

        $.preinit(app);
        $.node = node;

        if ($.next) {
            $.next.$$insertAdjacent (node);
        }
        else {
            $.parent.$$appendNode(node);
        }
    }

    /**
     * Runs GC
     */
    public $destroy () {
        super.$destroy();
        this.$.node.remove();
    }
}

/**
 * Represents a Vasille.js extension node
 */
export class Extension extends INode {
    /**
     * Pre-initialize a shadow node
     * @param app {App} the app node
     * @param rt {INode} The root node
     * @param ts {INode} The this node
     * @param before {Fragment} node to paste after it
     */
    public $preinit (app : AppNode, parent : Fragment) {

        if (parent instanceof INode) {
            const $ : INodePrivate = this.$;

            $.preinit(app);
            $.node = parent.node;
        }
        else {
            throw internalError("A extension node can be encapsulated only in a tag/extension/component");
        }
    }

    public constructor ($ ?: INodePrivate) {
        super ($);
        this.$seal();
    }

    /**
     * Runs GC
     */
    public $destroy () {
        super.$destroy();
    }
}

/**
 * Defines a node which cas has just a child (TagNode | Component)
 */
export class Component extends Extension {
    public constructor () {
        super ();
        this.$seal();
    }

    public $mounted () {
        super.$mounted();

        if (this.$children.length !== 1) {
            throw userError("UserNode must have a child only", "dom-error");
        }
        let child = this.$children[0];

        if (child instanceof Tag || child instanceof Component) {
            let $ : INodePrivate = this.$;

            $.node = child.node;
        }
        else {
            throw userError("UserNode child must be Tag or Component", "dom-error");
        }
    }
}

/**
 * Private part of switch node
 */
export class SwitchedNodePrivate extends INodePrivate {
    /**
     * Index of current true condition
     * @type {number}
     */
    public index : number = -1;

    /**
     * The unique child which can be absent
     * @type {Extension}
     */
    public fragment ?: Fragment;

    /**
     * Array of possible casses
     * @type {Array<{cond : IValue<boolean>, cb : function(RepeatNodeItem, ?number)}>}
     */
    public cases : { cond : IValue<boolean>, cb : (node : Fragment) => void }[];

    /**
     * A function which sync index and content, will be bounded to each condition
     * @type {Function}
     */
    public sync : () => void;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Runs GC
     */
    public $destroy () {
        for (let c of this.cases) {
            //$FlowFixMe
            delete c.cond;
            //$FlowFixMe
            delete c.cb;
        }
        this.cases.splice(0);

        super.$destroy();
    }
}

/**
 * Defines a node witch can switch its children conditionally
 */
class SwitchedNode extends Extension {
    protected $ : SwitchedNodePrivate;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor ($ ?: SwitchedNodePrivate) {
        super($ ?? new SwitchedNodePrivate);

        this.$.sync = () => {
            let $ : SwitchedNodePrivate = this.$;
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
    };

    /**
     * Set up switch cases
     * @param cases {{ cond : IValue | boolean, cb : function(RepeatNodeItem, ?number) }}
     */
    public setCases (cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>) {
        let $ = this.$;
        $.cases = [];

        for (let case_ of cases) {
            $.cases.push(case_);
        }
    }

    /**
     * Creates a child node
     * @param id {*} id of node
     * @param cb {function(RepeatNodeItem, *)} Call-back
     */
    public createChild (cb : (node : Fragment) => void) {
        let node = new Fragment();

        node.$preinit(this.$.app, this);

        node.$init();

        node.$ready();

        this.$.fragment = node;
        this.$children.push(node);
    };



    /**
     * Run then the node is ready
     */
    public $ready () {
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
    public $destroy () {
        let $ = this.$;

        for (let c of $.cases) {
            c.cond.off($.sync);
        }

        super.$destroy();
    }
}

/**
 * The private part of a text node
 */
export class DebugPrivate extends FragmentPrivate {
    public node : Comment;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param text {String | IValue}
     */
    public preinitComment (
        app : AppNode,
        text : IValue<string>
    ) {
        super.preinit(app);
        this.node = document.createComment(text.$);

        this.bindings.add(new Expression((v : string) => {
            this.node.replaceData(0, -1, v);
        }, true, text));

        if (this.prev) {
            this.prev.$$insertAdjacent(this.node);
        }
        else {
            this.parent.$$appendNode(this.node);
        }
    }

    /**
     * Clear node data
     */
    public $destroy () {
        super.$destroy();
    }
}

/**
 * Represents a text node
 */
export class DebugNode extends Fragment {
    /**
     * private data
     * @type {TextNodePrivate}
     */
    protected $ : DebugPrivate = new DebugPrivate();

    /**
     * Constructs a text node
     */
    public constructor () {
        super();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param rt {INode} The root node
     * @param ts {INode} The this node
     * @param before {?Fragment} node to paste after
     * @param text {String | IValue}
     */
    public $preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : DebugPrivate = this.$;

        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }

        $.preinitComment(app, text);
    }

    /**
     * Runs garbage collector
     */
    public $destroy () : void {
        this.$.$destroy();
        super.$destroy();
    }
}

