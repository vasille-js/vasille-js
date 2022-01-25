import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import { Reference } from "../value/reference";
import { Expression } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { ClassBinding } from "../binding/class";
import { StyleBinding } from "../binding/style";
import { internalError, userError } from "../core/errors";
import type { AppNode } from "./app";



/**
 * Represents a Vasille.js node
 * @class FragmentPrivate
 * @extends ReactivePrivate
 */
export class FragmentPrivate extends ReactivePrivate {

    /**
     * The app node
     * @type {AppNode}
     */
    public app : AppNode;

    /**
     * Parent node
     * @type {Fragment}
     */
    public parent : Fragment;

    /**
     * Next node
     * @type {?Fragment}
     */
    public next ?: Fragment;

    /**
     * Previous node
     * @type {?Fragment}
     */
    public prev ?: Fragment;

    public constructor () {
        super ();
        this.$seal ();
    }

    /**
     * Pre-initializes the base of a fragment
     * @param app {App} the app node
     * @param parent {Fragment} the parent node
     */
    public preinit (app : AppNode, parent : Fragment) {
        this.app = app;
        this.parent = parent;
    }

    /**
     * Unlinks all bindings
     */
    public $destroy () {
        this.next = null;
        this.prev = null;
        super.$destroy();
    }
}

/**
 * This class is symbolic
 * @extends Reactive
 */
export class Fragment extends Reactive {

    /**
     * Private part
     * @protected
     */
    protected $ : FragmentPrivate;

    /**
     * The children list
     * @type Array
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

    /**
     * Gets the app of node
     */
    get app () : AppNode {
        return this.$.app;
    }

    /**
     * Prepare to init fragment
     * @param app {AppNode} app of node
     * @param parent {Fragment} parent of node
     * @param data {*} additional data
     */
    public $preinit (app: AppNode, parent : Fragment, data ?: unknown) {
        const $ : FragmentPrivate = this.$;

        $.preinit(app, parent);
    }

    /**
     * Initialize node
     */
    public $init () : this {

        this.$createSignals();
        this.$createWatchers();

        this.$created();
        this.$compose();
        this.$mounted();

        return this;
    }

    /** To be overloaded: created event handler */
    public $created () {
        // empty
    }

    /** To be overloaded: mounted event handler */
    public $mounted () {
        // empty
    }

    /** To be overloaded: ready event handler */
    public $ready () {
        // empty
    }

    /** To be overloaded: signals creation milestone */
    public $createSignals () {
        // empty
    }

    /** To be overloaded: watchers creation milestone */
    public $createWatchers () {
        // empty
    }

    /** To be overloaded: DOM creation milestone */
    public $compose () {
        // empty
    }

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
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
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    protected $$findFirstChild () : Node {
        let first : Node;

        this.$children.forEach(child => {
            first = first || child.$$findFirstChild();
        });

        return first;
    }

    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    public $$appendNode (node : Node) : void {
        const $ : FragmentPrivate = this.$;

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
    public $$insertAdjacent (node : Node) : void {
        const child = this.$$findFirstChild();
        const $ : FragmentPrivate = this.$;

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
    public $text (
        text : string | IValue<string>,
        cb ?: (text : TextNode) => void
    ) : this {
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

    public $debug(text : IValue<string>) : this {
        if (this.$.app.$debugUi) {
            const node = new DebugNode();

            node.$preinit(this.$.app, this, text);
            this.$$pushNode(node);
        }
        return this;
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param cb {function(Tag, *)} callback
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
        const $ : FragmentPrivate = this.$;
        const node = new Tag();

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
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     * @param callback1 {function($ : *)}
     */
    public $create<T extends Fragment> (
        node : T,
        callback ?: ($ : T) => void,
        callback1 ?: ($ : T) => void
    ) : this {
        const $ : FragmentPrivate = this.$;

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
    public $if (
        cond : IValue<boolean>,
        cb : (node : Fragment) => void
    ) : this {
        return this.$switch({ cond, cb });
    }

    /**
     * Defines a if-else node
     * @param ifCond {IValue} `if` condition
     * @param ifCb {function(Fragment)} Call-back to create `if` child nodes
     * @param elseCb {function(Fragment)} Call-back to create `else` child nodes
     */
    public $if_else (
        ifCond : IValue<boolean>,
        ifCb : (node : Fragment) => void,
        elseCb : (node : Fragment) => void
    ) : this {
        return this.$switch({ cond : ifCond, cb : ifCb }, { cond : trueIValue, cb : elseCb });
    }

    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue, cb : function(Fragment) }} cases
     * @return {INode}
     */
    public $switch (
        ...cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>
    ) : this {
        const $ : FragmentPrivate = this.$;
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
    public $case (cond : IValue<boolean>, cb : (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void} {
        return {cond, cb};
    }

    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public $default (cb: (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void} {
        return {cond: trueIValue, cb};
    }

    public $destroy () {
        for (const child of this.$children) {
            child.$destroy();
        }

        this.$children.splice(0);
        super.$destroy ();
    }
}

const trueIValue = new Reference(true);

/**
 * The private part of a text node
 * @class TextNodePrivate
 * @extends FragmentPrivate
 */
export class TextNodePrivate extends FragmentPrivate {
    public node : Text;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param text {IValue}
     */
    public preinitText (
        app : AppNode,
        parent : Fragment,
        text : IValue<string>
    ) {
        super.preinit(app, parent);
        this.node = document.createTextNode(text.$);

        this.bindings.add(new Expression((v : string) => {
            this.node.replaceData(0, -1, v);
        }, true, text));

        this.parent.$$appendNode(this.node);
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
 * @class TextNode
 * @extends Fragment
 */
export class TextNode extends Fragment {

    protected $ : TextNodePrivate = new TextNodePrivate();

    public constructor () {
        super();
        this.$seal();
    }

    public $preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : TextNodePrivate = this.$;

        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }

        $.preinitText(app, parent, text);
    }

    protected $$findFirstChild(): Node {
        return this.$.node;
    }

    public $destroy () : void {
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
export class INodePrivate extends FragmentPrivate {
    /**
     * Defines if node is unmounted
     * @type {boolean}
     */
    public unmounted = false;

    /**
     * The element of vasille node
     * @type Element
     */
    public node : Element;

    public constructor () {
        super ();
        this.$seal();
    }

    public $destroy () {
        super.$destroy();
    }
}

/**
 * Vasille node which can manipulate an element node
 * @class INode
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

    /**
     * Get the bound node
     */
    get node () : Element {
        return this.$.node;
    }

    /**
     * Initialize node
     */
    public $init () : this {

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
    public $createAttrs () {
        // empty
    }

    /** To be overloaded: $style attributes creation milestone */
    public $createStyle () {
        // empty
    }

    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    public $attr (name : string, value : IValue<string>) : this {
        const $ : INodePrivate = this.$;
        const attr = new AttributeBinding(this, name, value);

        $.bindings.add(attr);
        return this;
    }

    /**
     * Creates and binds a multivalued binding to attribute
     * @param name {String} The name of attribute
     * @param calculator {Function} Binding calculator (must return a value)
     * @param v1 {*} argument
     * @param v2 {*} argument
     * @param v3 {*} argument
     * @param v4 {*} argument
     * @param v5 {*} argument
     * @param v6 {*} argument
     * @param v7 {*} argument
     * @param v8 {*} argument
     * @param v9 {*} argument
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
        const $ : INodePrivate = this.$;
        const expr = this.$bind(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);

        $.bindings.add(new AttributeBinding(this, name, expr));
        return this;
    }

    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    public $setAttr (name : string, value : string) : this {
        this.$.app.$run.setAttribute(this.$.node, name, value);
        return this;
    }

    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    public $addClass (cl : string) : this {
        this.$.app.$run.addClass(this.$.node, cl);
        return this;
    }

    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    public $addClasses (...cls : Array<string>) : this {
        cls.forEach(cl => {
            this.$.app.$run.addClass(this.$.node, cl);
        });
        return this;
    }

    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    public $bindClass (
        className : IValue<string>
    ) : this {
        const $ : INodePrivate = this.$;

        $.bindings.add(new ClassBinding(this, "", className));
        return this;
    }

    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    public $floatingClass (cond : IValue<boolean>, className : string) : this {
        this.$.bindings.add(new ClassBinding(this, className, cond));
        return this;
    }

    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    public $style (name : string, value : IValue<string>) : this {
        const $ : INodePrivate = this.$;

        if ($.node instanceof HTMLElement) {
            $.bindings.add(new StyleBinding(this, name, value));
        }
        else {
            throw userError('style can be applied to HTML elements only', 'non-html-element');
        }
        return this;
    }

    /**
     * Binds style property value
     * @param name {string} name of style attribute
     * @param calculator {function} calculator for style value
     * @param v1 {*} argument
     * @param v2 {*} argument
     * @param v3 {*} argument
     * @param v4 {*} argument
     * @param v5 {*} argument
     * @param v6 {*} argument
     * @param v7 {*} argument
     * @param v8 {*} argument
     * @param v9 {*} argument
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
        const $ : INodePrivate = this.$;
        const expr = this.$bind<string, T1, T2, T3, T4, T5, T6, T7, T8, T9>(
            calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);

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
    public $setStyle (
        prop : string,
        value : string
    ) : this {
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
    public $listen (
        name : string,
        handler : (ev : Event) => void,
        options ?: boolean | AddEventListenerOptions
    ) : this {
        this.$.node.addEventListener(name, handler, options);
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

    public $$insertAdjacent (node : Node) {
        const $ : INodePrivate = this.$;

        $.app.$run.insertBefore($.node, node);
    }

    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    public $bindShow (cond : IValue<boolean>) : this {
        const $ : INodePrivate = this.$;
        const node = $.node;

        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            const htmlNode : HTMLElement = node;

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
    public $html (value : IValue<string>) {
        const $ : INodePrivate = this.$;
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
 * @class Tag
 * @extends INode
 */
export class Tag extends INode {

    public constructor () {
        super ();
        this.$seal();
    }

    public $preinit (
        app : AppNode,
        parent : Fragment,
        tagName ?: string
    ) {
        if (!tagName || typeof tagName !== "string") {
            throw internalError('wrong Tag::$preinit call');
        }

        const node = document.createElement(tagName);
        const $ : INodePrivate = this.$;

        $.preinit(app, parent);
        $.node = node;

        $.parent.$$appendNode(node);
    }

    protected $$findFirstChild(): Node {
        return this.$.unmounted ? null : this.$.node;
    }

    public $$insertAdjacent(node: Node) {
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

    public $$appendNode (node : Node) {
        const $ : INodePrivate = this.$;

        $.app.$run.appendChild($.node, node);
    }

    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    public $bindMount (cond : IValue<boolean>) : this {
        const $ : INodePrivate = this.$;

        return this.$bindAlive(cond, () => {
            $.node.remove();
            $.unmounted = true;
        }, () => {
            if (!$.unmounted) return;

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
    public $destroy () {
        this.node.remove();
        super.$destroy();
    }
}

/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
export class Extension extends INode {

    public $preinit (app : AppNode, parent : Fragment) {

        if (parent instanceof INode) {
            const $ : INodePrivate = this.$;

            $.preinit(app, parent);
            $.node = parent.node;
        }
        else {
            throw userError("A extension node can be encapsulated only in a tag/extension/component", "virtual-dom");
        }
    }

    public constructor ($ ?: INodePrivate) {
        super ($);
        this.$seal();
    }

    public $destroy () {
        super.$destroy();
    }
}

/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
export class Component extends Extension {

    public constructor () {
        super ();
        this.$seal();
    }

    public $mounted () {
        super.$mounted();

        if (this.$children.length !== 1) {
            throw userError("Component must have a child only", "dom-error");
        }
        const child = this.$children[0];

        if (child instanceof Tag || child instanceof Component) {
            const $ : INodePrivate = this.$;

            $.node = child.node;
        }
        else {
            throw userError("Component child must be Tag or Component", "dom-error");
        }
    }

    $preinit(app: AppNode, parent: Fragment) {
        this.$.preinit(app, parent);
    }
}

/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
export class SwitchedNodePrivate extends INodePrivate {
    /**
     * Index of current true condition
     * @type number
     */
    public index : number;

    /**
     * The unique child which can be absent
     * @type Extension
     */
    public fragment ?: Fragment;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<boolean>, cb : function(Fragment)}>}
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
    protected $ : SwitchedNodePrivate;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor () {
        super(new SwitchedNodePrivate);

        this.$.sync = () => {
            const $ : SwitchedNodePrivate = this.$;
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
    public setCases (cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>) {
        const $ = this.$;
        $.cases = [...cases];
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild (cb : (node : Fragment) => void) {
        const node = new Fragment();

        node.$preinit(this.$.app, this);
        node.$init();
        node.$ready();

        this.$.fragment = node;
        this.$children.push(node);

        cb(node);
    }

    public $ready () {
        const $ = this.$;

        super.$ready();

        $.cases.forEach(c => {
            c.cond.on($.sync);
        });

        $.sync();
    }

    public $destroy () {
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
export class DebugPrivate extends FragmentPrivate {
    public node : Comment;

    public constructor () {
        super ();
        this.$seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param parent {Fragment} parent node
     * @param text {String | IValue}
     */
    public preinitComment (
        app : AppNode,
        parent : Fragment,
        text : IValue<string>
    ) {
        super.preinit(app, parent);
        this.node = document.createComment(text.$);

        this.bindings.add(new Expression((v : string) => {
            this.node.replaceData(0, -1, v);
        }, true, text));

        this.parent.$$appendNode(this.node);
    }

    /**
     * Clear node data
     */
    public $destroy () {
        this.node.remove();
        super.$destroy();
    }
}

/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
export class DebugNode extends Fragment {
    /**
     * private data
     * @type {DebugNode}
     */
    protected $ : DebugPrivate = new DebugPrivate();

    public constructor () {
        super();
        this.$seal();
    }

    public $preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : DebugPrivate = this.$;

        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }

        $.preinitComment(app, parent, text);
    }

    /**
     * Runs garbage collector
     */
    public $destroy () : void {
        this.$.$destroy();
        super.$destroy();
    }
}

