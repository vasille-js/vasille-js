import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import { Reference } from "../value/reference";
import { Expression } from "../value/expression";
import { AttributeBinding } from "../binding/attribute";
import { StaticClassBinding, DynamicalClassBinding } from "../binding/class";
import { StyleBinding } from "../binding/style";
import { internalError, userError } from "../core/errors";
import type { AppNode } from "./app";
import { FragmentOptions, TagOptions } from "../functional/options";
import {AcceptedTagsMap} from "../spec/react";



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
export class Fragment<T extends FragmentOptions = FragmentOptions> extends Reactive {

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
     * @param input
     * @param $ {FragmentPrivate}
     */
    public constructor (input : T, $ ?: FragmentPrivate) {
        super (input, $ || new FragmentPrivate);
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

    init() : T['return'] {
        const ret = super.init();
        this.ready();
        return ret;
    }

    protected compose(input: T) : T['return'] {
        input.slot && input.slot(this);
        return {};
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

        node.preinit($.app, this, text);
        this.pushNode(node);

        cb && cb(node);
    }

    public debug(text : IValue<string>) {
        if (this.$.app.debugUi) {
            const node = new DebugNode();

            node.preinit(this.$.app, this, text);
            this.pushNode(node);
        }
    }

    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    public tag<K extends keyof AcceptedTagsMap>(
        tagName : K,
        input : TagOptionsWithSlot<K>,
        cb ?: (node : Tag<K>) => void
        // @ts-ignore
    ) : (HTMLElementTagNameMap & SVGElementTagNameMap)[K] {
        const $ : FragmentPrivate = this.$;
        const node = new Tag(input);

        input.slot = cb || input.slot;
        node.preinit($.app, this, tagName);
        node.init();
        this.pushNode(node);
        node.ready();

        // @ts-ignore
        return node.node as (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
    }

    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    public create<T extends Fragment> (
        node : T,
        callback ?: T['input']['slot']
    ) : T['input']['return'] {
        const $ : FragmentPrivate = this.$;


        node.$.parent = this;
        node.preinit($.app, this);
        node.input.slot = callback || node.input.slot;
        this.pushNode(node);
        return node.init();
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
        node.init();
        this.pushNode(node);
        node.addCase(this.case(cond, cb));
        node.ready();
    }

    public else (cb : (node : Fragment) => void) {
        if (this.lastChild instanceof SwitchedNode) {
            this.lastChild.addCase(this.default(cb));
        }
        else {
            throw userError('wrong `else` function use', 'logic-error');
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
            throw userError('wrong `elif` function use', 'logic-error');
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

    public $destroy () {
        this.children.forEach(child => child.$destroy());

        this.children.clear();
        this.lastChild = null;

        if (this.$.parent.lastChild === this) {
            this.$.parent.lastChild = this.$.prev;
        }
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
     * @param parent
     * @param text {IValue}
     */
    public preinitText (
        app : AppNode,
        parent : Fragment,
        text : IValue<string> | string
    ) {
        super.preinit(app, parent);
        this.node = document.createTextNode(text instanceof IValue ? text.$ : text);

        if (text instanceof IValue) {
            this.bindings.add(new Expression((v : string) => {
                this.node.replaceData(0, -1, v);
            }, true, text));
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
 * @class TextNode
 * @extends Fragment
 */
export class TextNode extends Fragment {

    protected $ : TextNodePrivate;

    public constructor ($ = new TextNodePrivate()) {
        super({}, $);
        this.$seal();
    }

    public preinit (app : AppNode, parent : Fragment, text ?: IValue<string> | string) {
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
export class INode<T extends TagOptions<any> = TagOptions<any>> extends Fragment<T> {
    protected $ : INodePrivate;

    /**
     * Constructs a base node
     * @param input
     * @param $ {?INodePrivate}
     */
    constructor (input : T, $ ?: INodePrivate) {
        super(input, $ || new INodePrivate);
        this.$seal();
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
    public attr (name : string, value : IValue<string | number | boolean>) : void {
        const $ : INodePrivate = this.$;
        const attr = new AttributeBinding(this, name, value);

        $.bindings.add(attr);
    }

    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    public setAttr (name : string, value : string | number | boolean) : this {
        if (typeof value === 'boolean') {
            if (value) {
                this.$.node.setAttribute(name, "");
            }
        }
        else {
            this.$.node.setAttribute(name, `${value}`);
        }
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
    public removeClasse (cl : string) : this {
        this.$.node.classList.remove(cl);
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
    public bindDomApi (name : string, value : IValue<string>) {
        const $ : INodePrivate = this.$;
        const node = $.node;

        if (node instanceof HTMLElement) {
            node[name] = value.$;
            this.watch((v : string) => {
                node[name] = v;
            }, value);
        }
        else {
            throw userError("HTML can be bound for HTML nodes only", "dom-error");
        }
    }

    protected applyOptions(options : T) {

        options["v:attr"] && Object.keys(options["v:attr"]).forEach(name => {
            const value = options["v:attr"][name];

            if (value instanceof IValue) {
                this.attr(name, value);
            }
            else {
                this.setAttr(name, value);
            }
        });

        if (options.class) {
            const handleClass = (name : string, value : IValue<boolean> | string | boolean) => {
                if (value instanceof IValue) {
                    this.floatingClass(value, name);
                }
                else if (value && name !== '$') {
                    this.addClass(name);
                }
                else {
                    this.removeClasse(name);
                }
            }

            if (Array.isArray(options.class)) {
                options.class.forEach(item => {
                    if (item instanceof IValue) {
                        this.bindClass(item);
                    }
                    else if (typeof item == "string") {
                        this.addClass(item);
                    }
                    else {
                        Reflect.ownKeys(item).forEach((name : string) => {
                            handleClass(name, item[name]);
                        });
                    }
                });
            }
            else {
                options.class.$.forEach(item => {
                    this.bindClass(item);
                });
                Reflect.ownKeys(options.class).forEach((name : string) => {
                    handleClass(name, options.class[name]);
                });
            }
        }

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
                    this.style(name, this.expr((v) => v + value[1], value[0]));
                }
                else {
                    this.setStyle(name, value[0] + value[1]);
                }
            }
        });

        options["v:events"] && Object.keys(options["v:events"]).forEach(name => {
            this.listen(name, options["v:events"][name]);
        });

        if (options["v:bind"]) {
            const inode = this.node;

            Reflect.ownKeys(options["v:bind"]).forEach((k : string) => {
                const value = options["v:bind"][k];

                if (k === 'value' && (inode instanceof HTMLInputElement || inode instanceof  HTMLTextAreaElement)) {
                    inode.oninput = () => value.$ = inode.value;
                }
                else if (k === 'checked' && inode instanceof HTMLInputElement) {
                    inode.oninput = () => value.$ = inode.checked;
                }
                else if (k === 'volume' && inode instanceof HTMLMediaElement) {
                    inode.onvolumechange = () => value.$ = inode.volume;
                }

                this.bindDomApi(k, value);
            });
        }

        options["v:set"] && Object.keys(options["v:set"]).forEach(key => {
            this.node[key] = options["v:set"][key];
        });
    }
}

export interface TagOptionsWithSlot<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    slot ?: (tag : Tag<K>) => void
}

/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export class Tag<K extends keyof AcceptedTagsMap> extends INode<TagOptionsWithSlot<K>> {

    public constructor (input : TagOptionsWithSlot<K>) {
        super (input);
        this.$seal();
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

    protected compose(input: TagOptionsWithSlot<K>) : TagOptionsWithSlot<K>['return'] {
        input.slot && input.slot(this);
        return {};
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
export class Extension<T extends TagOptions<any> = TagOptions<any>> extends INode<T> {

    public preinit (app : AppNode, parent : Fragment) {

        const $ : INodePrivate = this.$;
        let it : Reactive = parent;

        while (it && !(it instanceof INode)) {
            it = it.parent;
        }

        if (it && it instanceof INode) {
            $.node = it.node;
        }

        $.preinit(app, parent);

        if (!it) {
            throw userError("A extension node can be encapsulated only in a tag/extension/component", "virtual-dom");
        }
    }

    public extend(options : T) {
        this.applyOptions(options);
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
export class Component<T extends TagOptions<any>> extends Extension<T> {

    init() : T['return'] {
        const ret = super.composeNow();
        this.ready();
        super.applyOptionsNow();
        return ret;
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
export class SwitchedNode extends Fragment {
    protected $ : SwitchedNodePrivate;

    /**
     * Constructs a switch node and define a sync function
     */
    public constructor () {
        super({}, new SwitchedNodePrivate);

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
                this.lastChild.$destroy();
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

        this.$seal();
    }

    public addCase(case_ : { cond : IValue<boolean>, cb : (node : Fragment) => void }) {
        this.$.cases.push(case_);
        case_.cond.$on(this.$.sync);
        this.$.sync();
    }

    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    public createChild (cb : (node : Fragment) => void) {
        const node = new Fragment({});

        node.preinit(this.$.app, this);
        node.init();

        this.lastChild = node;
        this.children.add(node);

        cb(node);
    }

    public ready () {
        const $ = this.$;

        $.cases.forEach(c => {
            c.cond.$on($.sync);
        });

        $.sync();
    }

    public $destroy () {
        const $ = this.$;

        $.cases.forEach(c => {
            c.cond.$off($.sync);
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

        this.parent.appendNode(this.node);
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
        super({});
        this.$seal();
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
    public $destroy () : void {
        this.$.$destroy();
        super.$destroy();
    }
}
