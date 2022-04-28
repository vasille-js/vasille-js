import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import type { AppNode } from "./app";
import { Options, TagOptions } from "../functional/options";
import { AcceptedTagsMap } from "../spec/react";
/**
 * Represents a Vasille.js node
 * @class FragmentPrivate
 * @extends ReactivePrivate
 */
export declare class FragmentPrivate extends ReactivePrivate {
    /**
     * The app node
     * @type {AppNode}
     */
    app: AppNode;
    /**
     * Parent node
     * @type {Fragment}
     */
    parent: Fragment;
    /**
     * Next node
     * @type {?Fragment}
     */
    next?: Fragment;
    /**
     * Previous node
     * @type {?Fragment}
     */
    prev?: Fragment;
    constructor();
    /**
     * Pre-initializes the base of a fragment
     * @param app {App} the app node
     * @param parent {Fragment} the parent node
     */
    preinit(app: AppNode, parent: Fragment): void;
    /**
     * Unlinks all bindings
     */
    destroy(): void;
}
/**
 * This class is symbolic
 * @extends Reactive
 */
export declare class Fragment<T extends Options = Options> extends Reactive {
    /**
     * Private part
     * @protected
     */
    protected $: FragmentPrivate;
    /**
     * The children list
     * @type Array
     */
    children: Set<Fragment>;
    lastChild: Fragment | null;
    /**
     * Constructs a Vasille Node
     * @param input
     * @param $ {FragmentPrivate}
     */
    constructor(input: T, $?: FragmentPrivate);
    /**
     * Gets the app of node
     */
    get app(): AppNode;
    /**
     * Prepare to init fragment
     * @param app {AppNode} app of node
     * @param parent {Fragment} parent of node
     * @param data {*} additional data
     */
    preinit(app: AppNode, parent: Fragment, data?: unknown): void;
    protected compose(input: Options): void;
    /** To be overloaded: ready event handler */
    ready(): void;
    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    protected pushNode(node: Fragment): void;
    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    protected findFirstChild(): Node;
    /**
     * Append a node to end of element
     * @param node {Node} node to insert
     */
    appendNode(node: Node): void;
    /**
     * Insert a node as a sibling of this
     * @param node {Node} node to insert
     */
    insertAdjacent(node: Node): void;
    /**
     * Defines a text fragment
     * @param text {String | IValue} A text fragment string
     * @param cb {function (TextNode)} Callback if previous is slot name
     */
    text(text: string | IValue<string>, cb?: (text: TextNode) => void): void;
    debug(text: IValue<string>): void;
    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param input
     * @param cb {function(Tag, *)} callback
     */
    tag<K extends keyof AcceptedTagsMap>(tagName: K, input: TagOptionsWithSlot<K>, cb?: (node: Tag<K>) => void): (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    create<T extends Fragment>(node: T, callback?: T['input']['slot']): void;
    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    if(cond: IValue<boolean>, cb: (node: Fragment) => void): void;
    else(cb: (node: Fragment) => void): void;
    elif(cond: IValue<boolean>, cb: (node: Fragment) => void): void;
    /**
     * Create a case for switch
     * @param cond {IValue<boolean>}
     * @param cb {function(Fragment) : void}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    case(cond: IValue<boolean>, cb: (node: Fragment) => void): {
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    };
    /**
     * @param cb {(function(Fragment) : void)}
     * @return {{cond : IValue, cb : (function(Fragment) : void)}}
     */
    default(cb: (node: Fragment) => void): {
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    };
    insertBefore(node: Fragment): void;
    insertAfter(node: Fragment): void;
    remove(): void;
    destroy(): void;
}
/**
 * The private part of a text node
 * @class TextNodePrivate
 * @extends FragmentPrivate
 */
export declare class TextNodePrivate extends FragmentPrivate {
    node: Text;
    constructor();
    /**
     * Pre-initializes a text node
     * @param app {AppNode} the app node
     * @param parent
     * @param text {IValue}
     */
    preinitText(app: AppNode, parent: Fragment, text: IValue<string> | string): void;
    /**
     * Clear node data
     */
    destroy(): void;
}
/**
 * Represents a text node
 * @class TextNode
 * @extends Fragment
 */
export declare class TextNode extends Fragment {
    protected $: TextNodePrivate;
    constructor($?: TextNodePrivate);
    preinit(app: AppNode, parent: Fragment, text?: IValue<string> | string): void;
    protected findFirstChild(): Node;
    destroy(): void;
}
/**
 * The private part of a base node
 * @class INodePrivate
 * @extends FragmentPrivate
 */
export declare class INodePrivate extends FragmentPrivate {
    /**
     * Defines if node is unmounted
     * @type {boolean}
     */
    unmounted: boolean;
    /**
     * The element of vasille node
     * @type Element
     */
    node: Element;
    constructor();
    destroy(): void;
}
/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
export declare class INode<T extends TagOptions<any> = TagOptions<any>> extends Fragment<T> {
    protected $: INodePrivate;
    /**
     * Constructs a base node
     * @param input
     * @param $ {?INodePrivate}
     */
    constructor(input: T, $?: INodePrivate);
    /**
     * Get the bound node
     */
    get node(): Element;
    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    attr(name: string, value: IValue<string | number | boolean>): void;
    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    setAttr(name: string, value: string | number | boolean): this;
    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    addClass(cl: string): this;
    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    removeClasse(cl: string): this;
    /**
     * Bind a CSS class
     * @param className {IValue}
     */
    bindClass(className: IValue<string>): this;
    /**
     * Bind a floating class name
     * @param cond {IValue} condition
     * @param className {string} class name
     */
    floatingClass(cond: IValue<boolean>, className: string): this;
    /**
     * Defines a style attribute
     * @param name {String} name of style attribute
     * @param value {IValue} value
     */
    style(name: string, value: IValue<string>): this;
    /**
     * Sets a style property value
     * @param prop {string} Property name
     * @param value {string} Property value
     */
    setStyle(prop: string, value: string): this;
    /**
     * Add a listener for an event
     * @param name {string} Event name
     * @param handler {function (Event)} Event handler
     * @param options {Object | boolean} addEventListener options
     */
    listen(name: string, handler: (ev: Event) => void, options?: boolean | AddEventListenerOptions): this;
    insertAdjacent(node: Node): void;
    /**
     * A v-show & ngShow alternative
     * @param cond {IValue} show condition
     */
    bindShow(cond: IValue<boolean>): this;
    /**
     * bind HTML
     * @param value {IValue}
     */
    bindDomApi(name: string, value: IValue<string>): void;
    protected applyOptions(options: T): void;
}
export interface TagOptionsWithSlot<K extends keyof AcceptedTagsMap> extends TagOptions<K> {
    slot?: (tag: Tag<K>) => void;
}
/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export declare class Tag<K extends keyof AcceptedTagsMap> extends INode<TagOptionsWithSlot<K>> {
    constructor(input: TagOptionsWithSlot<K>);
    preinit(app: AppNode, parent: Fragment, tagName?: string): void;
    protected compose(input: TagOptionsWithSlot<K>): void;
    protected findFirstChild(): Node;
    insertAdjacent(node: Node): void;
    appendNode(node: Node): void;
    /**
     * Mount/Unmount a node
     * @param cond {IValue} show condition
     */
    bindMount(cond: IValue<boolean>): void;
    /**
     * Runs GC
     */
    destroy(): void;
}
/**
 * Represents a vasille extension node
 * @class Extension
 * @extends INode
 */
export declare class Extension<T extends TagOptions<any> = TagOptions<any>> extends INode<T> {
    preinit(app: AppNode, parent: Fragment): void;
    destroy(): void;
}
/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
export declare class Component<T extends TagOptions<any>> extends Extension<T> {
    ready(): void;
    preinit(app: AppNode, parent: Fragment): void;
}
/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
export declare class SwitchedNodePrivate extends FragmentPrivate {
    /**
     * Index of current true condition
     * @type number
     */
    index: number;
    /**
     * Array of possible cases
     * @type {Array<{cond : IValue<boolean>, cb : function(Fragment)}>}
     */
    cases: {
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    }[];
    /**
     * A function which sync index and content, will be bounded to each condition
     * @type {Function}
     */
    sync: () => void;
    constructor();
    /**
     * Runs GC
     */
    destroy(): void;
}
/**
 * Defines a node witch can switch its children conditionally
 */
export declare class SwitchedNode extends Fragment {
    protected $: SwitchedNodePrivate;
    /**
     * Constructs a switch node and define a sync function
     */
    constructor();
    addCase(case_: {
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    }): void;
    /**
     * Creates a child node
     * @param cb {function(Fragment)} Call-back
     */
    createChild(cb: (node: Fragment) => void): void;
    ready(): void;
    destroy(): void;
}
/**
 * The private part of a text node
 */
export declare class DebugPrivate extends FragmentPrivate {
    node: Comment;
    constructor();
    /**
     * Pre-initializes a text node
     * @param app {App} the app node
     * @param parent {Fragment} parent node
     * @param text {String | IValue}
     */
    preinitComment(app: AppNode, parent: Fragment, text: IValue<string>): void;
    /**
     * Clear node data
     */
    destroy(): void;
}
/**
 * Represents a debug node
 * @class DebugNode
 * @extends Fragment
 */
export declare class DebugNode extends Fragment {
    /**
     * private data
     * @type {DebugNode}
     */
    protected $: DebugPrivate;
    constructor();
    preinit(app: AppNode, parent: Fragment, text?: IValue<string>): void;
    /**
     * Runs garbage collector
     */
    destroy(): void;
}
