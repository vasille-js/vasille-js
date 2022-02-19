import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import type { AppNode } from "./app";
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
export declare class Fragment extends Reactive {
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
    lastChild: any;
    /**
     * Constructs a Vasille Node
     * @param $ {FragmentPrivate}
     */
    constructor($?: FragmentPrivate);
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
    /**
     * Initialize node
     */
    init(): this;
    /** To be overloaded: created event handler */
    created(): void;
    /** To be overloaded: mounted event handler */
    mounted(): void;
    /** To be overloaded: ready event handler */
    ready(): void;
    /** To be overloaded: watchers creation milestone */
    createWatchers(): void;
    /** To be overloaded: DOM creation milestone */
    compose(): void;
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
    debug(text: IValue<string>): this;
    /**
     * Defines a tag element
     * @param tagName {String} the tag name
     * @param cb {function(Tag, *)} callback
     */
    tag<K extends keyof HTMLElementTagNameMap>(tagName: K, cb?: (node: Tag, element: HTMLElementTagNameMap[K]) => void): void;
    tag<K extends keyof SVGElementTagNameMap>(tagName: K, cb?: (node: Tag, element: SVGElementTagNameMap[K]) => void): void;
    tag(tagName: string, cb?: (node: Tag, element: Element) => void): void;
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     * @param callback1 {function($ : *)}
     */
    create<T extends Fragment>(node: T, callback?: ($: T) => void, callback1?: ($: T) => void): void;
    /**
     * Defines an if node
     * @param cond {IValue} condition
     * @param cb {function(Fragment)} callback to run on true
     * @return {this}
     */
    if(cond: IValue<boolean>, cb: (node: Fragment) => void): this;
    /**
     * Defines a if-else node
     * @param ifCond {IValue} `if` condition
     * @param ifCb {function(Fragment)} Call-back to create `if` child nodes
     * @param elseCb {function(Fragment)} Call-back to create `else` child nodes
     */
    if_else(ifCond: IValue<boolean>, ifCb: (node: Fragment) => void, elseCb: (node: Fragment) => void): this;
    /**
     * Defines a switch nodes: Will break after first true condition
     * @param cases {...{ cond : IValue, cb : function(Fragment) }} cases
     * @return {INode}
     */
    switch(...cases: Array<{
        cond: IValue<boolean>;
        cb: (node: Fragment) => void;
    }>): this;
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
     * @param text {IValue}
     */
    preinitText(app: AppNode, parent: Fragment, text: IValue<string>): void;
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
    preinit(app: AppNode, parent: Fragment, text?: IValue<string>): void;
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
export declare class INode extends Fragment {
    protected $: INodePrivate;
    /**
     * Constructs a base node
     * @param $ {?INodePrivate}
     */
    constructor($?: INodePrivate);
    /**
     * Get the bound node
     */
    get node(): Element;
    /**
     * Initialize node
     */
    init(): this;
    /** To be overloaded: attributes creation milestone */
    createAttrs(): void;
    /** To be overloaded: $style attributes creation milestone */
    createStyle(): void;
    /**
     * Bind attribute value
     * @param name {String} name of attribute
     * @param value {IValue} value
     */
    attr(name: string, value: IValue<string>): void;
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
    bindAttr<T1>(name: string, calculator: (a1: T1) => string, v1: IValue<T1>, v2?: IValue<void>, v3?: IValue<void>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2>(name: string, calculator: (a1: T1, a2: T2) => string, v1: IValue<T1>, v2: IValue<T2>, v3?: IValue<void>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3>(name: string, calculator: (a1: T1, a2: T2, a3: T3) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4?: IValue<void>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5?: IValue<void>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4, T5>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6?: IValue<void>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4, T5, T6>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7?: IValue<void>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4, T5, T6, T7>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8?: IValue<void>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4, T5, T6, T7, T8>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9?: IValue<void>): this;
    bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>): this;
    /**
     * Set attribute value
     * @param name {string} name of attribute
     * @param value {string} value
     */
    setAttr(name: string, value: string): this;
    /**
     * Adds a CSS class
     * @param cl {string} Class name
     */
    addClass(cl: string): this;
    /**
     * Adds some CSS classes
     * @param cls {...string} classes names
     */
    addClasses(...cls: Array<string>): this;
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
    bindStyle<T1>(name: string, calculator: (a1: T1) => string, v1: IValue<T1>): this;
    bindStyle<T1, T2>(name: string, calculator: (a1: T1, a2: T2) => string, v1: IValue<T1>, v2: IValue<T2>): this;
    bindStyle<T1, T2, T3>(name: string, calculator: (a1: T1, a2: T2, a3: T3) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>): this;
    bindStyle<T1, T2, T3, T4>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>): this;
    bindStyle<T1, T2, T3, T4, T5>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>): this;
    bindStyle<T1, T2, T3, T4, T5, T6>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>): this;
    bindStyle<T1, T2, T3, T4, T5, T6, T7>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>): this;
    bindStyle<T1, T2, T3, T4, T5, T6, T7, T8>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>): this;
    bindStyle<T1, T2, T3, T4, T5, T6, T7, T8, T9>(name: string, calculator: (a1: T1, a2: T2, a3: T3, a4: T4, a5: T5, a6: T6, a7: T7, a8: T8, a9: T9) => string, v1: IValue<T1>, v2: IValue<T2>, v3: IValue<T3>, v4: IValue<T4>, v5: IValue<T5>, v6: IValue<T6>, v7: IValue<T7>, v8: IValue<T8>, v9: IValue<T9>): this;
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
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    oncontextmenu(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmousedown(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmouseenter(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmouseleave(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmousemove(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmouseout(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmouseover(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onmouseup(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    onclick(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (MouseEvent)}
     * @param options {Object | boolean}
     */
    ondblclick(handler: (ev: MouseEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    onblur(handler: (ev: FocusEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    onfocus(handler: (ev: FocusEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    onfocusin(handler: (ev: FocusEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (FocusEvent)}
     * @param options {Object | boolean}
     */
    onfocusout(handler: (ev: FocusEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    onkeydown(handler: (ev: KeyboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    onkeyup(handler: (ev: KeyboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (KeyboardEvent)}
     * @param options {Object | boolean}
     */
    onkeypress(handler: (ev: KeyboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    ontouchstart(handler: (ev: TouchEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    ontouchmove(handler: (ev: TouchEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    ontouchend(handler: (ev: TouchEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (TouchEvent)}
     * @param options {Object | boolean}
     */
    ontouchcancel(handler: (ev: TouchEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (WheelEvent)}
     * @param options {Object | boolean}
     */
    onwheel(handler: (ev: WheelEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onabort(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onerror(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onload(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onloadend(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onloadstart(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    onprogress(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ProgressEvent)}
     * @param options {Object | boolean}
     */
    ontimeout(handler: (ev: ProgressEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondrag(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragend(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragenter(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragexit(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragleave(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragover(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondragstart(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (DragEvent)}
     * @param options {Object | boolean}
     */
    ondrop(handler: (ev: DragEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerover(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerenter(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerdown(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointermove(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerup(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointercancel(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerout(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onpointerleave(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    ongotpointercapture(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (PointerEvent)}
     * @param options {Object | boolean}
     */
    onlostpointercapture(handler: (ev: PointerEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    onanimationstart(handler: (ev: AnimationEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    onanimationend(handler: (ev: AnimationEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (AnimationEvent)}
     * @param options {Object | boolean}
     */
    onanimationiteraton(handler: (ev: AnimationEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    onclipboardchange(handler: (ev: ClipboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    oncut(handler: (ev: ClipboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    oncopy(handler: (ev: ClipboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
    /**
     * @param handler {function (ClipboardEvent)}
     * @param options {Object | boolean}
     */
    onpaste(handler: (ev: ClipboardEvent) => void, options?: boolean | AddEventListenerOptions): this;
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
    html(value: IValue<string>): void;
}
/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
export declare class Tag extends INode {
    constructor();
    preinit(app: AppNode, parent: Fragment, tagName?: string): void;
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
export declare class Extension extends INode {
    preinit(app: AppNode, parent: Fragment): void;
    constructor($?: INodePrivate);
    destroy(): void;
}
/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
export declare class Component extends Extension {
    constructor();
    mounted(): void;
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
