import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import { Reference } from "../value/reference";
import { Expression, KindOfIValue } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { StaticClassBinding, DynamicalClassBinding } from "../binding/class";
import { StyleBinding } from "../binding/style";
import { internalError, userError } from "../core/errors";
import type { AppNode } from "./app";
import { Options, TagOptions } from "../functional/options";



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
        this.seal ();
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
    public destroy () {
        this.next = null;
        this.prev = null;
        super.destroy();
    }
}

/**
 * This class is symbolic
 * @extends Reactive
 */
export class Fragment<T extends Options = Options> extends Reactive {

    /**
     * Private part
     * @protected
     */
    protected $ : FragmentPrivate;

    /**
     * The children list
     * @type Array
     */
    public children : Set<Fragment> = new Set;
    public lastChild : Fragment | null = null;

    /**
     * Constructs a Vasille Node
     * @param $ {FragmentPrivate}
     */
    public constructor ($ ?: FragmentPrivate) {
        super ($ || new FragmentPrivate);
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
    public preinit (app: AppNode, parent : Fragment, data ?: unknown) {
        const $ : FragmentPrivate = this.$;

        $.preinit(app, parent);
    }

    /** To be overloaded: ready event handler */
    public ready () {
        // empty
    }

    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode (node : Fragment) : void {
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
    protected findFirstChild () : Node {
        let first : Node;

        this.children.forEach(child => {
            first = first || child.findFirstChild();
        });

        return first;
    }

    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    public appendNode (node : Node) : void {
        const $ : FragmentPrivate = this.$;

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
    public insertAdjacent (node : Node) : void {
        const child = this.findFirstChild();
        const $ : FragmentPrivate = this.$;

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
    public text (
        text : string | IValue<string>,
        cb ?: (text : TextNode) => void
    ) : void {
        const $ = this.$;
        const node = new TextNode();
        const textValue = text instanceof IValue ? text : this.ref(text);

        node.preinit($.app, this, textValue);
        this.pushNode(node);

        cb && cb(node);
    }

    public debug(text : IValue<string>) : this {
        if (this.$.app.debugUi) {
            const node = new DebugNode();

            node.preinit(this.$.app, this, text);
            this.pushNode(node);
        }
        return this;
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag<K extends keyof HTMLElementTagNameMap>(
        tagName : K,
        input : TagOptionsWithSlot<HTMLElementTagNameMap[K]>,
        cb ?: TagOptionsWithSlot<HTMLElementTagNameMap[K]>['slot']
    ) : HTMLElementTagNameMap[K]
    public tag<K extends keyof SVGElementTagNameMap>(
        tagName : K,
        input : TagOptionsWithSlot<SVGElementTagNameMap[K]>,
        cb ?: TagOptionsWithSlot<SVGElementTagNameMap[K]>['slot']
    ) : SVGElementTagNameMap[K]
    public tag(
        tagName : string,
        input : TagOptionsWithSlot<Element>,
        cb ?: TagOptionsWithSlot<Element>['slot']
    ) : Element
    public tag<T extends Element>(
        tagName : string,
        input : TagOptionsWithSlot<T>,
        cb ?: TagOptionsWithSlot<T>['slot']
    ) : T {
        const $ : FragmentPrivate = this.$;
        const node = new Tag();

        input.slot = cb;
        node.preinit($.app, this, tagName);
        node.init(input);
        this.pushNode(node);
        node.ready();

        return node.node as T;
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment> (
        node : T,
        input : T['input'],
        callback ?: T['input']['slot']
    ) : void {
        const $ : FragmentPrivate = this.$;


        node.$.parent = this;
        node.preinit($.app, this);
        if (callback) input.slot = callback;
        this.pushNode(node);
        node.init(input);
        node.ready();
    }

    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    public if (
        cond : IValue<boolean>,
        cb : (node : Fragment) => void
    ) {
        const node = new SwitchedNode();

        node.preinit(this.$.app, this);
        node.init({});
        this.pushNode(node);
        node.addCase(this.case(cond, cb));
        node.ready();
    }

    public else (cb : (node : Fragment) => void) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.default(cb));
        }
        else {
            throw 'wrong `else` function use';
        }
    }

    public elif (
        cond : IValue<boolean>,
        cb : (node : Fragment) => void
    ) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.case(cond, cb));
        }
        else {
            throw 'wrong `elif` function use';
        }
    }

    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public case (cond : IValue<boolean>, cb : (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void} {
        return {cond, cb};
    }

    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    public default (cb: (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void} {
        return {cond: trueIValue, cb};
    }

    insertBefore (node : Fragment) {
        const $ = this.$;

        node.$.prev = $.prev;
        node.$.next = this;

        if ($.prev) {
            $.prev.$.next = node;
        }
        $.prev = node;
    }

    insertAfter (node : Fragment) {
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

    public destroy () {
        this.children.forEach(child => child.destroy());

        this.children.clear();
        this.lastChild = null;

        if (this.$.parent.lastChild === this) {
            this.$.parent.lastChild = this.$.prev;
        }
        super.destroy ();
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
        this.seal();
    }

    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param parent
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
    }

    /**
     * Clear node data
     */
    public destroy () {
        super.destroy();
    }
}

/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export class TextNode extends Fragment {

    protected $ : TextNodePrivate;

    public constructor ($ = new TextNodePrivate()) {
        super($);
        this.seal();
    }

    public preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : TextNodePrivate = this.$;

        if (!text) {
            throw internalError('wrong TextNode::$preninit call');
        }

        $.preinitText(app, parent, text);
        $.parent.appendNode($.node);
    }

    protected findFirstChild(): Node {
        return this.$.node;
    }

    public destroy () : void {
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
        this.seal();
    }

    public destroy () {
        super.destroy();
    }
}

/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
export class INode<T extends TagOptions = TagOptions> extends Fragment<T> {
    protected $ : INodePrivate;

    /**
     * Constructs a base node
     * @param $ {?INodePrivate}
     */
    constructor ($ ?: INodePrivate) {
        super($ || new INodePrivate);
        this.seal();
    }

    /**
     * Get the bound node
     */
    get node () : Element {
        return this.$.node;
    }

    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    public attr (name : string, value : IValue<string>) : void {
        const $ : INodePrivate = this.$;
        const attr = new AttributeBinding(this, name, value);

        $.bindings.add(attr);
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
    public bindAttr<T1> (
        name : string,
        calculator : (a1 : T1) => string,
        v1 : IValue<T1>, v2 ?: IValue<void>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2> (
        name : string,
        calculator : (a1 : T1, a2 : T2) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 ?: IValue<void>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 ?: IValue<void>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 ?: IValue<void>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 ?: IValue<void>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5, T6> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 ?: IValue<void>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5, T6, T7> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 ?: IValue<void>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5, T6, T7, T8> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 ?: IValue<void>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : void
    public bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : void {
        const $ : INodePrivate = this.$;
        const expr = this.expr(calculator, v1, v2, v3, v4, v5, v6, v7, v8, v9);

        $.bindings.add(new AttributeBinding(this, name, expr));
    }

    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    public setAttr (name : string, value : string) : this {
        this.$.node.setAttribute(name, value);
        return this;
    }

    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    public addClass (cl : string) : this {
        this.$.node.classList.add(cl);
        return this;
    }

    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    public addClasses (...cls : Array<string>) : this {
        this.$.node.classList.add(...cls);
        return this;
    }

    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    public bindClass (
        className : IValue<string>
    ) : this {
        const $ : INodePrivate = this.$;

        $.bindings.add(new DynamicalClassBinding(this, className));
        return this;
    }

    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    public floatingClass (cond : IValue<boolean>, className : string) : this {
        this.$.bindings.add(new StaticClassBinding(this, className, cond));
        return this;
    }

    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    public style (name : string, value : IValue<string>) : this {
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
     * @param values
     */
    public bindStyle<T, Args extends unknown[]> (
        name : string,
        calculator : (...args : Args) => string,
        ...values : KindOfIValue<Args>
    ) : this {
        const $ : INodePrivate = this.$;
        const expr = this.expr<string, Args>(
            calculator, ...values);

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
    public setStyle (
        prop : string,
        value : string
    ) : this {
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
    public listen (
        name : string,
        handler : (ev : Event) => void,
        options ?: boolean | AddEventListenerOptions
    ) : this {
        this.$.node.addEventListener(name, handler, options);
        return this;
    }

    public insertAdjacent (node : Node) {
        this.$.node.parentNode.insertBefore(node, this.$.node);
    }

    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    public bindShow (cond : IValue<boolean>) {
        const $ : INodePrivate = this.$;
        const node = $.node;

        if (node instanceof HTMLElement) {
            let lastDisplay = node.style.display;
            const htmlNode : HTMLElement = node;

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
    public html (value : IValue<string>) {
        const $ : INodePrivate = this.$;
        const node = $.node;

        if (node instanceof HTMLElement) {
            node.innerHTML = value.$;
            this.watch((v : string) => {
                node.innerHTML = v;
            }, value);
        }
        else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    }

    protected applyOptions(options: T) {
        super.applyOptions(options);

        options.attr && Object.keys(options.attr).forEach(name => {
            const value = options.attr[name];

            if (value instanceof IValue) {
                this.attr(name, value);
            }
            else {
                this.setAttr(name, value);
            }
        });

        options.class && options.class.forEach(item => {
            if (item instanceof IValue) {
                this.bindClass(item);
            }
            else if (typeof item == "string") {
                this.addClass(item);
            }
            else {
                Object.keys(item).forEach(name => {
                    this.floatingClass(item[name], name);
                });
            }
        });

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
                    this.bindStyle(name, (v) => v + value[1], value[0]);
                }
                else {
                    this.setStyle(name, value[0] + value[1]);
                }
            }
        });

        options.events && Object.keys(options.events).forEach(name => {
            this.listen(name, options.events[name]);
        });

        if (options.bind) {
            options.bind.html && this.html(options.bind.html);

            const inode = this.node;

            if (inode instanceof HTMLInputElement || inode instanceof  HTMLTextAreaElement) {
                if (options.bind.value) {
                    this.watch(v => inode.value = v, options.bind.value);
                    inode.oninput = () => options.bind.value.$ = inode.value;
                }
                if (options.bind.checked && inode instanceof HTMLInputElement) {
                    this.watch(v => inode.checked = v, options.bind.checked);
                    inode.oninput = () => options.bind.checked.$ = inode.checked;
                }
            }
        }

        options.set && Object.keys(options.set).forEach(key => {
            this.node[key] = options.set[key];
        });
    }
}

export interface TagOptionsWithSlot<T extends Element> extends TagOptions {
    slot ?: (tag : Fragment, element : T) => void
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export class Tag<T extends Element> extends INode<TagOptionsWithSlot<T>> {

    public constructor () {
        super ();
        this.seal();
    }

    public preinit (
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

        $.parent.appendNode(node);
    }

    protected compose(input: TagOptionsWithSlot<T>) {
        super.compose(input);
        input.slot && input.slot(this, this.node as T);
    }

    protected findFirstChild(): Node {
        return this.$.unmounted ? null : this.$.node;
    }

    public insertAdjacent(node: Node) {
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

    public appendNode (node : Node) {
        this.$.node.appendChild(node);
    }

    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    public bindMount (cond : IValue<boolean>) {
        const $ : INodePrivate = this.$;

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
    public destroy () {
        this.node.remove();
        super.destroy();
    }
}

/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
export class Extension<T extends TagOptions> extends INode<T> {

    public preinit (app : AppNode, parent : Fragment) {

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
        this.seal();
    }

    public destroy () {
        super.destroy();
    }
}

/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
export class Component<T extends TagOptions> extends Extension<T> {

    public constructor () {
        super ();
    }

    public ready () {
        super.ready();

        if (this.children.size !== 1) {
            throw userError("Component must have a child only", "dom-error");
        }
        const child = this.lastChild;

        if (child instanceof Tag || child instanceof Component) {
            const $ : INodePrivate = this.$;

            $.node = child.node;
        }
        else {
            throw userError("Component child must be Tag or Component", "dom-error");
        }
    }

    preinit(app: AppNode, parent: Fragment) {
        this.$.preinit(app, parent);
    }
}

/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
export class SwitchedNodePrivate extends FragmentPrivate {
    /**
     * Index of current true condition
     * @type number
     */
    public index : number;

    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<boolean>, cb : function(Fragment)}>}
     */
    public cases : { cond : IValue<boolean>, cb : (node : Fragment) => void }[] = [];

    /**
     * A function which sync index and content, will be bounded to each condition
     * @type {Function}
     */
    public sync : () => void;

    public constructor () {
        super ();
        this.seal();
    }

    /**
     * Runs GC
     */
    public destroy () {
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
export class SwitchedNode extends Fragment {
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

    public addCase(case_ : { cond : IValue<boolean>, cb : (node : Fragment) => void }) {
        this.$.cases.push(case_);
        case_.cond.on(this.$.sync);
        this.$.sync();
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild (cb : (node : Fragment) => void) {
        const node = new Fragment();

        node.preinit(this.$.app, this);
        node.init({});

        this.lastChild = node;
        this.children.add(node);

        cb(node);
    }

    public ready () {
        const $ = this.$;

        $.cases.forEach(c => {
            c.cond.on($.sync);
        });

        $.sync();
    }

    public destroy () {
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
export class DebugPrivate extends FragmentPrivate {
    public node : Comment;

    public constructor () {
        super ();
        this.seal();
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

        this.parent.appendNode(this.node);
    }

    /**
     * Clear node data
     */
    public destroy () {
        this.node.remove();
        super.destroy();
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
        this.seal();
    }

    public preinit (app : AppNode, parent : Fragment, text ?: IValue<string>) {
        const $ : DebugPrivate = this.$;

        if (!text) {
            throw internalError('wrong DebugNode::$preninit call');
        }

        $.preinitComment(app, parent, text);
    }

    /**
     * Runs garbage collector
     */
    public destroy () : void {
        this.$.destroy();
        super.destroy();
    }
}
