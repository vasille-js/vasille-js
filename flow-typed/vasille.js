declare module "vasille" {
declare type Record<K, T> = {[k : K] : T};
/**
 * Declares a notifiable bind to a value
 * @class Mirror
 * @extends IValue
 * @version 2
 */
declare class Mirror<T> extends Reference<T> {
    /**
     * pointed value
     * @type IValue
     */
    pointedValue: IValue<T>;
    /**
     * Collection of handlers
     * @type Set
     */
    handler: any;
    /**
     * Ensure forward only synchronization
     */
    forwardOnly: boolean;
    /**
     * Constructs a notifiable bind to a value
     * @param value {IValue} is initial value
     * @param forwardOnly {boolean} ensure forward only synchronization
     */
    constructor(value: IValue<T>, forwardOnly?: boolean): void;
    get $(): T;
    set $(v: T): void;
    enable(): void;
    disable(): void;
    destroy(): void;
}


declare type KindOfIValue<T> = any[];
/**
 * Bind some values to one expression
 * @class Expression
 * @extends IValue
 */
declare class Expression<T,Args> extends IValue<T> {
    /**
     * The array of value which will trigger recalculation
     * @type {Array}
     */
    values: any;
    /**
     * Cache the values of expression variables
     * @type {Array}
     */
    valuesCache: any;
    /**
     * The function which will be executed on recalculation
     */
    func: any;
    /**
     * Expression will link different handler for each value of list
     */
    linkedFunc: any;
    /**
     * The buffer to keep the last calculated value
     */
    sync: any;
    /**
     * Creates a function bounded to N values
     * @param func {Function} the function to bound
     * @param values
     * @param link {Boolean} links immediately if true
     */
    constructor(func: (...args: Args) => T, link: boolean, ...values: KindOfIValue<Args>): void;
    get $(): T;
    set $(value: T): void;
    on(handler: (value: T) => void): this;
    off(handler: (value: T) => void): this;
    enable(): this;
    disable(): this;
    destroy(): void;
}


/**
 * Declares a notifiable value
 * @class Reference
 * @extends IValue
 */
declare class Reference<T> extends IValue<T> {
    /**
     * The encapsulated value
     * @type {*}
     */
    value: any;
    /**
     * Array of handlers
     * @type {Set}
     * @readonly
     */
    onchange: any;
    /**
     * @param value {any} the initial value
     */
    constructor(value: T): void;
    get $(): T;
    set $(value: T): void;
    enable(): void;
    disable(): void;
    on(handler: (value: T) => void): void;
    off(handler: (value: T) => void): void;
    destroy(): void;
}


/**
 * r/w pointer to a value
 * @class Pointer
 * @extends Mirror
 */
declare class Pointer<T> extends Mirror<T> {
    /**
     * @param value {IValue} value to point
     * @param forwardOnly {boolean} forward only data flow
     */
    constructor(value: IValue<T>, forwardOnly?: boolean): void;
    /**
     * Point a new ivalue
     * @param value {IValue} value to point
     */
    point(value: IValue<T>): void;
}


/**
 * Create a children pack for each object field
 * @class ObjectView
 * @extends BaseView
 */
declare class ObjectView<T> extends BaseView<string, T, ObjectModel<T>> {
    compose(input: BSO<string, T, ObjectModel<T>>): void;
}


/**
 * Create a children pack for each map value
 * @class MapView
 * @extends BaseView
 */
declare class MapView<K, T> extends BaseView<K, T, MapModel<K, T>> {
    compose(input: BSO<K, T, MapModel<K, T>>): void;
}


/**
 * Private part of repeat node
 * @class RepeatNodePrivate
 * @extends INodePrivate
 */
declare class RepeatNodePrivate<IdT> extends INodePrivate {
    /**
     * Children node hash
     * @type {Map}
     */
    nodes: Map<IdT, Fragment>;
    constructor(): void;
    destroy(): void;
}
declare interface RNO<T, IdT> extends Options {
    slot?: (node: Fragment, value: T, index: IdT) => void;
}
/**
 * Repeat node repeats its children
 * @class RepeatNode
 * @extends Fragment
 */
declare class RepeatNode<IdT, T,Opts> extends Fragment<Opts> {
    $: RepeatNodePrivate<IdT>;
    /**
     * If false will use timeout executor, otherwise the app executor
     */
    freezeUi: boolean;
    constructor(input: Opts, $: RepeatNodePrivate<IdT>): void;
    createChild(opts: Opts, id: IdT, item: T, before?: Fragment): any;
    destroyChild(id: IdT, item: T): void;
}


/**
 * Represents a view of an array model
 * @class ArrayView
 * @extends BaseView
 */
declare class ArrayView<T> extends BaseView<T, T, ArrayModel<T>> {
    createChild(input: BSO<T, T, ArrayModel<T>>, id: T, item: T, before?: Fragment): any;
    compose(input: BSO<T, T, ArrayModel<T>>): void;
}


/**
 * Create a children pack for each set value
 * @class SetView
 * @extends BaseView
 */
declare class SetView<T> extends BaseView<T, T, SetModel<T>> {
    compose(input: BSO<T, T, SetModel<T>>): void;
}


/**
 * Private part of BaseView
 * @class BaseViewPrivate
 * @extends RepeatNodePrivate
 */
declare class BaseViewPrivate<K, T> extends RepeatNodePrivate<K> {
    /**
     * Handler to catch values addition
     * @type {Function}
     */
    addHandler: (index: K, value: T) => void;
    /**
     * Handler to catch values removes
     * @type {Function}
     */
    removeHandler: (index: K, value: T) => void;
    constructor(): void;
}
declare interface BSO<K, T,Model> extends RNO<T, K> {
    model: Model;
}
/**
 * Base class of default views
 * @class BaseView
 * @extends RepeatNode
 * @implements IModel
 */
declare class BaseView<K, T,Model> extends RepeatNode<K, T, BSO<K, T, Model>> {
    $: BaseViewPrivate<K, T>;
    input: BSO<K, T, Model>;
    constructor(input: BSO<K, T, Model>, $?: BaseViewPrivate<K, T>): void;
    compose(input: BSO<K, T, Model>): void;
}


/**
 * Object based model
 * @extends Object
 */
declare class ObjectModel<T> extends Object implements ListenableModel<string, T> {
    listener: Listener<T, string>;
    container: any;
    /**
     * Constructs a object model
     * @param obj {Object} input data
     */
    constructor(obj?: {
        [p: string]: T;
    }) : void;
    /**
     * Gets a value of a field
     * @param key {string}
     * @return {*}
     */
    get(key: string): T;
    /**
     * Sets an object property value
     * @param key {string} property name
     * @param v {*} property value
     * @return {ObjectModel} a pointer to this
     */
    set(key: string, v: T): this;
    /**
     * Deletes an object property
     * @param key {string} property name
     */
    delete(key: string): void;
    proxy(): Record<string, T>;
    enableReactivity(): void;
    disableReactivity(): void;
}


/**
 * A Map based memory
 * @class MapModel
 * @extends Map
 * @implements IModel
 */
declare class MapModel<K, T> extends Map<K, T> implements ListenableModel<K, T> {
    listener: Listener<T, K>;
    /**
     * Constructs a map model
     * @param map {[*, *][]} input data
     */
    constructor(map?: [K, T][]): void;
    /**
     * Calls Map.clear and notify abut changes
     */
    clear(): void;
    /**
     * Calls Map.delete and notify abut changes
     * @param key {*} key
     * @return {boolean} true if removed something, otherwise false
     */
    delete(key: any): boolean;
    /**
     * Calls Map.set and notify abut changes
     * @param key {*} key
     * @param value {*} value
     * @return {MapModel} a pointer to this
     */
    set(key: K, value: T): this;
    enableReactivity(): void;
    disableReactivity(): void;
}


/**
 * Model based on Array class
 * @extends Array
 * @implements IModel
 */
declare class ArrayModel<T> extends Array<T> implements ListenableModel<T, T> {
    listener: Listener<T, T>;
    /**
     * @param data {Array} input data
     */
    constructor(data?: Array<T>): void;
    proxy(): ArrayModel<T>;
    /**
     * Gets the last item of array
     * @return {*} the last item of array
     */
    get last(): T;
    /**
     * Calls Array.fill and notify about changes
     * @param value {*} value to fill with
     * @param start {?number} begin index
     * @param end {?number} end index
     */
    fill(value: T, start?: number, end?: number): this;
    /**
     * Calls Array.pop and notify about changes
     * @return {*} removed value
     */
    pop(): T;
    /**
     * Calls Array.push and notify about changes
     * @param items {...*} values to push
     * @return {number} new length of array
     */
    push(...items: Array<T>): number;
    /**
     * Calls Array.shift and notify about changed
     * @return {*} the shifted value
     */
    shift(): T;
    /**
     * Calls Array.splice and notify about changed
     * @param start {number} start index
     * @param deleteCount {?number} delete count
     * @param items {...*}
     * @return {ArrayModel} a pointer to this
     */
    splice(start: number, deleteCount?: number, ...items: Array<T>): ArrayModel<T>;
    /**
     * Calls Array.unshift and notify about changed
     * @param items {...*} values to insert
     * @return {number} the length after prepend
     */
    unshift(...items: Array<T>): number;
    /**
     * Inserts a value to the end of array
     * @param v {*} value to insert
     */
    append(v: T): this;
    /**
     * Clears array
     * @return {this} a pointer to this
     */
    clear(): this;
    /**
     * Inserts a value to position `index`
     * @param index {number} index to insert value
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    insert(index: number, v: T): this;
    /**
     * Inserts a value to the beginning of array
     * @param v {*} value to insert
     * @return {this} a pointer to this
     */
    prepend(v: T): this;
    /**
     * Removes a value from an index
     * @param index {number} index of value to remove
     * @return {this} a pointer to this
     */
    removeAt(index: number): this;
    /**
     * Removes the first value of array
     * @return {this} a pointer to this
     */
    removeFirst(): this;
    /**
     * Removes the ast value of array
     * @return {this} a pointer to this
     */
    removeLast(): this;
    /**
     * Remove the first occurrence of value
     * @param v {*} value to remove
     * @return {this}
     */
    removeOne(v: T): this;
    enableReactivity(): void;
    disableReactivity(): void;
}


/**
 * A Set based model
 * @class SetModel
 * @extends Set
 * @implements IModel
 */
declare class SetModel<T> extends Set<T> implements ListenableModel<T, T> {
    listener: Listener<T, T>;
    /**
     * Constructs a set model based on a set
     * @param set {Set} input data
     */
    constructor(set?: T[]): void;
    /**
     * Calls Set.add and notify abut changes
     * @param value {*} value
     * @return {this} a pointer to this
     */
    add(value: T): this;
    /**
     * Calls Set.clear and notify abut changes
     */
    clear(): void;
    /**
     * Calls Set.delete and notify abut changes
     * @param value {*}
     * @return {boolean} true if a value was deleted, otherwise false
     */
    delete(value: T): boolean;
    enableReactivity(): void;
    disableReactivity(): void;
}


/**
 * Represent a listener for a model
 * @class Listener
 */
declare class Listener<ValueT, IndexT = string | number> {
    /**
     * Functions to run on adding new items
     * @type Set
     */
    onAdded: any;
    /**
     * Functions to run on item removing
     * @type Set
     */
    onRemoved: any;
    /**
     * Describe the frozen state of model
     * @type boolean
     * @private
     */
    frozen: any;
    /**
     * The queue of operations in frozen state
     * @type Object[]
     * @private
     */
    queue: any;
    constructor(): void;
    /**
     * Exclude the repeated operation in queue
     * @private
     */
    excludeRepeat: any;
    /**
     * Emits added event to listeners
     * @param index {*} index of value
     * @param value {*} value of added item
     */
    emitAdded(index: IndexT, value: ValueT): void;
    /**
     * Emits removed event to listeners
     * @param index {*} index of removed value
     * @param value {*} value of removed item
     */
    emitRemoved(index: IndexT, value: ValueT): void;
    /**
     * Adds a handler to added event
     * @param handler {function} function to run on event emitting
     */
    onAdd(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Adds a handler to removed event
     * @param handler {function} function to run on event emitting
     */
    onRemove(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Removes an handler from added event
     * @param handler {function} handler to remove
     */
    offAdd(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Removes an handler form removed event
     * @param handler {function} handler to remove
     */
    offRemove(handler: (index: IndexT, value: ValueT) => void): void;
    /**
     * Run all queued operation and enable reactivity
     */
    enableReactivity(): void;
    /**
     * Disable the reactivity and enable the queue
     */
    disableReactivity(): void;
}


/**
 * @declare interface IModel
 */
declare interface IModel {
    /**
     * Enable the reactivity of model
     */
    enableReactivity(): void;
    /**
     * Disable the reactivity of model
     */
    disableReactivity(): void;
}
declare interface ListenableModel<K, T> extends IModel {
    /**
     * The listener of model
     * @type Listener
     */
    listener: Listener<T, K>;
}


declare interface WatchOptions<T> extends Options {
    model: IValue<T>;
    slot?: (node: Fragment, value: T) => void;
}
/**
 * Watch Node
 * @class Watch
 * @extends Fragment
 */
declare class Watch<T> extends Fragment<WatchOptions<T>> {
    input: WatchOptions<T>;
    compose(input: WatchOptions<T>): void;
}



/**
 * Represents a Vasille.js node
 * @class FragmentPrivate
 * @extends ReactivePrivate
 */
declare class FragmentPrivate extends ReactivePrivate {
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
    constructor(): void;
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
declare class Fragment<T> extends Reactive {
    /**
     * Private part
     * @protected
     */
    $: FragmentPrivate;
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
    constructor(input: T, $?: FragmentPrivate): void;
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
    preinit(app: AppNode, parent: Fragment, data?: any): void;
    compose(input: Options): void;
    /** To be overloaded: ready event handler */
    ready(): void;
    /**
     * Pushes a node to children immediately
     * @param node {Fragment} A node to push
     * @protected
     */
    pushNode(node: Fragment): void;
    /**
     * Find first node in element if so exists
     * @return {?Element}
     * @protected
     */
    findFirstChild(): Node;
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
    tag<K>(tagName: K, input: TagOptionsWithSlot<K>, cb?: (node: Tag<K>) => void): (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
    /**
     * Defines a custom element
     * @param node {Fragment} vasille element to insert
     * @param callback {function($ : *)}
     */
    create<T>(node: T, callback?: T['input']['slot']): void;
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
 * The part of a text node
 * @class TextNodePrivate
 * @extends FragmentPrivate
 */
declare class TextNodePrivate extends FragmentPrivate {
    node: Text;
    constructor(): void;
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
declare class TextNode extends Fragment {
    $: TextNodePrivate;
    constructor($?: TextNodePrivate): void;
    preinit(app: AppNode, parent: Fragment, text?: IValue<string> | string): void;
    findFirstChild(): Node;
    destroy(): void;
}
/**
 * The part of a base node
 * @class INodePrivate
 * @extends FragmentPrivate
 */
declare class INodePrivate extends FragmentPrivate {
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
    constructor(): void;
    destroy(): void;
}
/**
 * Vasille node which can manipulate an element node
 * @class INode
 * @extends Fragment
 */
declare class INode<T> extends Fragment<T> {
    $: INodePrivate;
    /**
     * Constructs a base node
     * @param input
     * @param $ {?INodePrivate}
     */
    constructor(input: T, $?: INodePrivate): void;
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
    applyOptions(options: T): void;
}
declare interface TagOptionsWithSlot<K> extends TagOptions<K> {
    slot?: (tag: Tag<K>) => void;
}
/**
 * Represents an Vasille.js HTML element node
 * @class Tag
 * @extends INode
 */
declare class Tag<K> extends INode<TagOptionsWithSlot<K>> {
    constructor(input: TagOptionsWithSlot<K>): void;
    preinit(app: AppNode, parent: Fragment, tagName?: string): void;
    compose(input: TagOptionsWithSlot<K>): void;
    findFirstChild(): Node;
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
declare class Extension<T> extends INode<T> {
    preinit(app: AppNode, parent: Fragment): void;
    destroy(): void;
}
/**
 * Node which cas has just a child
 * @class Component
 * @extends Extension
 */
declare class Component<T> extends Extension<T> {
    ready(): void;
    preinit(app: AppNode, parent: Fragment): void;
}
/**
 * Private part of switch node
 * @class SwitchedNodePrivate
 * @extends INodePrivate
 */
declare class SwitchedNodePrivate extends FragmentPrivate {
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
    constructor(): void;
    /**
     * Runs GC
     */
    destroy(): void;
}
/**
 * Defines a node witch can switch its children conditionally
 */
declare class SwitchedNode extends Fragment {
    $: SwitchedNodePrivate;
    /**
     * Constructs a switch node and define a sync function
     */
    constructor(): void;
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
 * The part of a text node
 */
declare class DebugPrivate extends FragmentPrivate {
    node: Comment;
    constructor(): void;
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
declare class DebugNode extends Fragment {
    /**
     * data
     * @type {DebugNode}
     */
    $: DebugPrivate;
    constructor(): void;
    preinit(app: AppNode, parent: Fragment, text?: IValue<string>): void;
    /**
     * Runs garbage collector
     */
    destroy(): void;
}


declare interface AppOptions<K> extends TagOptions<K> {
    debugUi?: boolean;
}
/**
 * Application Node
 * @class AppNode
 * @extends INode
 */
declare class AppNode<T> extends INode<T> {
    /**
     * Enables debug comments
     */
    debugUi: boolean;
    /**
     * @param input
     */
    constructor(input: T): void;
}
/**
 * Represents a Vasille.js application
 * @class App
 * @extends AppNode
 */
declare class App<T> extends AppNode<T> {
    /**
     * Constructs an app node
     * @param node {Element} The root of application
     * @param input
     */
    constructor(node: Element, input: T): void;
    appendNode(node: Node): void;
}
declare interface PortalOptions extends AppOptions<'div'> {
    node: Element;
    slot?: (node: Fragment) => void;
}
declare class Portal extends AppNode<PortalOptions> {
    constructor(input: PortalOptions): void;
    appendNode(node: Node): void;
}



/**
 * Describe a common binding logic
 * @class Binding
 * @extends Destroyable
 */
declare class Binding<T> extends Destroyable {
    binding: any;
    func: any;
    /**
     * Constructs a common binding logic
     * @param value {IValue} the value to bind
     */
    constructor(value: IValue<T>): void;
    init(bounded: (v: T) => void): void;
    /**
     * Just clear bindings
     */
    destroy(): void;
}


/**
 * Represents an Attribute binding description
 * @class AttributeBinding
 * @extends Binding
 */
declare class AttributeBinding extends Binding<string | number | boolean | null> {
    /**
     * Constructs an attribute binding description
     * @param node {INode} the vasille node
     * @param name {String} the name of attribute
     * @param value {IValue} value to bind
     */
    constructor(node: INode, name: string, value: IValue<string | number | boolean | null>): void;
}


declare class StaticClassBinding extends Binding<boolean> {
    current: any;
    constructor(node: INode, name: string, value: IValue<boolean>): void;
}
declare class DynamicalClassBinding extends Binding<string> {
    current: any;
    constructor(node: INode, value: IValue<string>): void;
}


/**
 * Describes a style attribute binding
 * @class StyleBinding
 * @extends Binding
 */
declare class StyleBinding extends Binding<string> {
    /**
     * Constructs a style binding attribute
     * @param node {INode} the vasille node
     * @param name {string} the name of style property
     * @param value {IValue} the value to bind
     */
    constructor(node: INode, name: string, value: IValue<string>): void;
}


declare function arrayModel<T>(arr?: T[]): ArrayModel<T>;
declare function mapModel<K, T>(map?: [K, T][]): MapModel<K, T>;
declare function setModel<T>(arr?: T[]): SetModel<T>;
declare function objectModel<T>(obj?: {
    [p: string]: T;
}): ObjectModel<T>;


declare function ref<T>(value: T): [IValue<T>, (value: T) => void];
declare function mirror<T>(value: IValue<T>): Mirror<T>;
declare function forward<T>(value: IValue<T>): Mirror<T>;
declare function point<T>(value: IValue<T>): Pointer<T>;
declare function expr<T,Args>(func: (...args: Args) => T, ...values: KindOfIValue<Args>): IValue<T>;
declare function watch<Args>(func: (...args: Args) => void, ...values: KindOfIValue<Args>): void;
declare function valueOf<T>(value: IValue<T>): T;
declare function setValue<T>(ref: IValue<T>, value: IValue<T> | T): void;


declare function app<In>(renderer: (opts: In) => In["return"]): (node: Element, opts: In) => In["return"];
declare function component<In>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
declare function fragment<In>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
declare function extension<In>(renderer: (opts: In) => In["return"]): (opts: In, callback?: In['slot']) => In["return"];
declare function tag<K>(name: K, opts: TagOptionsWithSlot<K>, callback?: () => void): {
    node: (HTMLElementTagNameMap & SVGElementTagNameMap)[K];
};
declare type ExtractParams = any[];
declare function create<T>(node: T, callback?: (...args: ExtractParams<T['input']['slot']>) => void): T;
declare var v: {
    if(condition: IValue<boolean>, callback: () => void): void;
    else(callback: () => void): void;
    elif(condition: IValue<boolean>, callback: () => void): void;
    for<T, K>(model: ListenableModel<K, T>, callback: (value: T, index: K) => void): void;
    watch<T_1>(model: IValue<T_1>, callback: (value: T_1) => void): void;
    nextTick(callback: () => void): void;
};



declare function text(text: string | IValue<string>): void;
declare function debug(text: IValue<string>): void;
declare function predefine<T>(slot: T | null | undefined, predefined: T): T;


declare interface Options {
    "v:is"?: Record<string, IValue<any>>;
    return?: any;
    slot?: (node: Fragment, ...args: any[]) => void;
}
declare type AttrType<T> = IValue<T | string | null> | T | string | null | undefined;
declare interface TagOptions<T> extends Options {
    "v:attr"?: {
        [K : string]:? AttrType<AcceptedTagsSpec[T]['attrs'][K]>;
    } & Record<string, AttrType<number | boolean>>;
    class?: (string | IValue<string> | Record<string, boolean | IValue<boolean>>)[] | ({
        $: IValue<string>[];
    } & Record<string, boolean | IValue<boolean>>);
    style?: Record<string, string | IValue<string> | [number | string | IValue<number | string>, string]>;
    "v:events"?: Partial<AcceptedTagsSpec[T]['events']>;
    "v:set"?: Partial<AcceptedTagsMap[T]> & Record<string, any>;
    "v:bind"?: {
        [K : string]:? IValue<AcceptedTagsMap[T][K]>;
    } & Record<string, IValue<any>>;
}


declare function merge(main: Record<string, any>, ...targets: Record<string, any>[]): void;


/**
 * Mark an object which can be destroyed
 * @class Destroyable
 */
declare class Destroyable {
    /**
     * Make object fields non configurable
     * @protected
     */
    seal(): void;
    /**
     * Garbage collector method
     */
    destroy(): void;
}


declare function notOverwritten(): string;
declare function internalError(msg: string): string;
declare function userError(msg: string, err: string): string;
declare function wrongBinding(msg: string): string;


declare class Switchable extends Destroyable {
    /**
     * Enable update handlers triggering
     */
    enable(): void;
    /**
     * disable update handlers triggering
     */
    disable(): void;
}
/**
 * Interface which describes a value
 * @class IValue
 * @extends Destroyable
 */
declare class IValue<T> extends Switchable {
    /**
     * Is enabled state flag
     * @protected
     */
    isEnabled: boolean;
    /**
     * @param isEnabled {boolean} initial is enabled state
     */
    constructor(isEnabled: boolean): void;
    /**
     * Get the encapsulated value
     * @return {*} the encapsulated value
     */
    get $(): T;
    /**
     * Sets the encapsulated value
     * @param value {*} value to encapsulate
     */
    set $(value: T): void;
    /**
     * Add a new handler to value change
     * @param handler {function(value : *)} the handler to add
     */
    on(handler: (value: T) => void): void;
    /**
     * Removes a handler of value change
     * @param handler {function(value : *)} the handler to remove
     */
    off(handler: (value: T) => void): void;
}


declare var current: Reactive | null;
/**
 * Private stuff of a reactive object
 * @class ReactivePrivate
 * @extends Destroyable
 */
declare class ReactivePrivate extends Destroyable {
    /**
     * A list of user-defined values
     * @type {Set}
     */
    watch: Set<Switchable>;
    /**
     * A list of user-defined bindings
     * @type {Set}
     */
    bindings: Set<Destroyable>;
    /**
     * A list of user defined models
     */
    models: Set<IModel>;
    /**
     * Reactivity switch state
     * @type {boolean}
     */
    enabled: boolean;
    /**
     * The frozen state of object
     * @type {boolean}
     */
    frozen: boolean;
    /**
     * An expression which will freeze/unfreeze the object
     * @type {IValue<void>}
     */
    freezeExpr: Expression<void, [boolean]>;
    /**
     * Parent node
     * @type {Reactive}
     */
    parent: Reactive;
    onDestroy?: () => void;
    constructor(): void;
    destroy(): void;
}
/**
 * A reactive object
 * @class Reactive
 * @extends Destroyable
 */
declare class Reactive<T> extends Destroyable {
    /**
     * Private stuff
     * @protected
     */
    $: ReactivePrivate;
    input: T;
    constructor(input: T, $?: ReactivePrivate): void;
    /**
     * Get parent node
     */
    get parent(): Reactive;
    /**
     * Create a reference
     * @param value {*} value to reference
     */
    ref<T>(value: T): IValue<T>;
    /**
     * Create a mirror
     * @param value {IValue} value to mirror
     */
    mirror<T>(value: IValue<T>): Mirror<T>;
    /**
     * Create a forward-only mirror
     * @param value {IValue} value to mirror
     */
    forward<T>(value: IValue<T>): Mirror<T>;
    /**
     * Creates a pointer
     * @param value {*} default value to point
     * @param forwardOnly {boolean} forward only sync
     */
    point<T>(value: IValue<T>, forwardOnly?: boolean): Pointer<T>;
    /**
     * Register a model
     * @param model
     */
    register<T>(model: T): T;
    /**
     * Creates a watcher
     * @param func {function} function to run on any argument change
     * @param values
     */
    watch<Args>(func: (...args: Args) => void, ...values: KindOfIValue<Args>): void;
    /**
     * Creates a computed value
     * @param func {function} function to run on any argument change
     * @param values
     * @return {IValue} the created ivalue
     */
    expr<T,Args>(func: (...args: Args) => T, ...values: KindOfIValue<Args>): IValue<T>;
    /**
     * Enable reactivity of fields
     */
    enable(): void;
    /**
     * Disable reactivity of fields
     */
    disable(): void;
    /**
     * Disable/Enable reactivity of object fields with feedback
     * @param cond {IValue} show condition
     * @param onOff {function} on show feedback
     * @param onOn {function} on hide feedback
     */
    bindAlive(cond: IValue<boolean>, onOff?: () => void, onOn?: () => void): this;
    init(): void;
    applyOptions(input: T): void;
    compose(input: T): void;
    runFunctional<F>(f: F, ...args: Parameters<F>): ReturnType<F>;
    runOnDestroy(func: () => void): void;
    destroy(): void;
}


declare type SvgEvents = {
    [K : string]: EventHandler<SVGElementEventMap[K]> | undefined;
};
declare interface SvgAreaAttrs {
    "aria-activedescendant": string;
    "aria-atomic": string;
    "aria-autocomplete": string;
    "aria-busy": string;
    "aria-checked": string;
    "aria-colcount": string;
    "aria-colindex": string;
    "aria-colspan": string;
    "aria-controls": string;
    "aria-current": string;
    "aria-describedby": string;
    "aria-details": string;
    "aria-disabled": string;
    "aria-dropeffect": string;
    "aria-errormessage": string;
    "aria-expanded": string;
    "aria-flowto": string;
    "aria-grabbed": string;
    "aria-haspopup": string;
    "aria-hidden": string;
    "aria-invalid": string;
    "aria-keyshortcuts": string;
    "aria-label": string;
    "aria-labelledby": string;
    "aria-level": string;
    "aria-live": string;
    "aria-modal": string;
    "aria-multiline": string;
    "aria-multiselectable": string;
    "aria-orientation": string;
    "aria-owns": string;
    "aria-placeholder": string;
    "aria-posinset": string;
    "aria-pressed": string;
    "aria-readonly": string;
    "aria-relevant": string;
    "aria-required": string;
    "aria-roledescription": string;
    "aria-rowcount": string;
    "aria-rowindex": string;
    "aria-rowspan": string;
    "aria-selected": string;
    "aria-setsize": string;
    "aria-sort": string;
    "aria-valuemax": string;
    "aria-valuemin": string;
    "aria-valuenow": string;
    "aria-valuetext": string;
    "role": string;
}
declare interface SvgConditionalProcessingAtttrs {
    "requiredExtensions": string;
    "systemLanguage": string;
}
declare interface SvgCoreAttrs {
    "id": string;
    "tabindex": string;
    "lang": string;
    "xml:space": string;
}
declare interface SvgSvgAttrs extends SvgAreaAttrs, SvgConditionalProcessingAtttrs, SvgCoreAttrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "zoomAndPan": string;
    "transform": string;
    x: number;
    y: number;
    width: number;
    height: number;
}
declare interface Svg3in1Attrs extends SvgAreaAttrs, SvgConditionalProcessingAtttrs, SvgCoreAttrs {
}
declare interface SvgUseAttrs extends Svg3in1Attrs {
    href: string;
}
declare interface SvgPathLengthAttrs extends Svg3in1Attrs {
    pathLength: number;
    "marker-start": string;
    "marker-mid": string;
    "marker-end": string;
}
declare interface SvgPathAttrs extends SvgPathLengthAttrs {
    d: string;
}
declare interface SvgRectAttrs extends SvgPathLengthAttrs {
    x: number;
    y: number;
    width: number;
    height: number;
    rx: number;
    ry: number;
}
declare interface SvgCircleAttrs extends SvgPathLengthAttrs {
    cx: number;
    cy: number;
    r: number;
}
declare interface SvgEllipseAttrs extends SvgPathLengthAttrs {
    cx: number;
    cy: number;
    rx: number;
    ry: number;
}
declare interface SvgLineAttrs extends SvgPathLengthAttrs {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
}
declare interface SvgPolygonAttrs extends SvgPathLengthAttrs {
    points: number;
}
declare interface SvgCommonTextAttrs extends Svg3in1Attrs {
    x: number;
    y: number;
    dx: number;
    dy: number;
    rotate: number;
    textLength: number;
    lengthAdjust: 'spacing' | 'spacingAndGlyphs';
}
declare interface SvgTextPathAttrs extends Svg3in1Attrs {
    "lengthAdjust": 'spacing' | 'spacingAndGlyphs';
    "textLength": number;
    "path": string;
    "href": string;
    "startOffset": number;
    "method": 'align' | 'stretch';
    "spacing": 'auto' | 'exact';
    "side": 'left' | 'right';
}
declare interface SvgImageAttrs extends Svg3in1Attrs {
    "preserveAspectRatio": string;
    "href": string;
    "crossorigin": string;
    x: number;
    y: number;
    width: number;
    height: number;
}
declare interface SvgForeignObjectAttrs extends Svg3in1Attrs {
    x: number;
    y: number;
    width: number;
    height: number;
}
declare interface SvgMarkerAttrs extends Svg3in1Attrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "refX": number;
    "refY": number;
    "markerUnits": 'strokeWidth' | 'userSpaceOnUse';
    "markerWidth": number | 'left' | 'center' | 'right';
    "markerHeight": number | 'top' | 'center' | 'bottom';
    "orient": 'auto' | 'auto-start-reverse' | number;
}
declare interface SvgAAttrs extends SvgCoreAttrs {
    href: string;
    "target": '_self' | '_parent' | '_top' | '_blank';
    "download": string;
    "ping": string;
    "rel": string;
    "hreflang": string;
    "type": string;
    "referrerpolicy": string;
}
declare interface SvgViewAttrs extends SvgCoreAttrs, SvgAreaAttrs {
    "viewBox": string;
    "preserveAspectRatio": string;
    "zoomAndPan": string;
}
declare interface SvgTagMap {
    "a": Tag<SvgAAttrs, SvgEvents>;
    "animate": Tag<SvgCoreAttrs, SvgEvents>;
    "animateMotion": Tag<SvgCoreAttrs, SvgEvents>;
    "animateTransform": Tag<SvgCoreAttrs, SvgEvents>;
    "circle": Tag<SvgCircleAttrs, SvgEvents>;
    "clipPath": Tag<SvgCoreAttrs, SvgEvents>;
    "defs": Tag<SvgCoreAttrs, SvgEvents>;
    "desc": Tag<SvgCoreAttrs, SvgEvents>;
    "ellipse": Tag<SvgEllipseAttrs, SvgEvents>;
    "feBlend": Tag<SvgCoreAttrs, SvgEvents>;
    "feColorMatrix": Tag<SvgCoreAttrs, SvgEvents>;
    "feComponentTransfer": Tag<SvgCoreAttrs, SvgEvents>;
    "feComposite": Tag<SvgCoreAttrs, SvgEvents>;
    "feConvolveMatrix": Tag<SvgCoreAttrs, SvgEvents>;
    "feDiffuseLighting": Tag<SvgCoreAttrs, SvgEvents>;
    "feDisplacementMap": Tag<SvgCoreAttrs, SvgEvents>;
    "feDistantLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feDropShadow": Tag<SvgCoreAttrs, SvgEvents>;
    "feFlood": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncA": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncB": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncG": Tag<SvgCoreAttrs, SvgEvents>;
    "feFuncR": Tag<SvgCoreAttrs, SvgEvents>;
    "feGaussianBlur": Tag<SvgCoreAttrs, SvgEvents>;
    "feImage": Tag<SvgCoreAttrs, SvgEvents>;
    "feMerge": Tag<SvgCoreAttrs, SvgEvents>;
    "feMergeNode": Tag<SvgCoreAttrs, SvgEvents>;
    "feMorphology": Tag<SvgCoreAttrs, SvgEvents>;
    "feOffset": Tag<SvgCoreAttrs, SvgEvents>;
    "fePointLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feSpecularLighting": Tag<SvgCoreAttrs, SvgEvents>;
    "feSpotLight": Tag<SvgCoreAttrs, SvgEvents>;
    "feTile": Tag<SvgCoreAttrs, SvgEvents>;
    "feTurbulence": Tag<SvgCoreAttrs, SvgEvents>;
    "filter": Tag<SvgCoreAttrs, SvgEvents>;
    "foreignObject": Tag<SvgForeignObjectAttrs, SvgEvents>;
    "g": Tag<Svg3in1Attrs, SvgEvents>;
    "image": Tag<SvgImageAttrs, SvgEvents>;
    "line": Tag<SvgLineAttrs, SvgEvents>;
    "linearGradient": Tag<SvgCoreAttrs, SvgEvents>;
    "marker": Tag<SvgMarkerAttrs, SvgEvents>;
    "mask": Tag<SvgCoreAttrs, SvgEvents>;
    "metadata": Tag<SvgCoreAttrs, SvgEvents>;
    "mpath": Tag<SvgCoreAttrs, SvgEvents>;
    "path": Tag<SvgPathAttrs, SvgEvents>;
    "pattern": Tag<SvgCoreAttrs, SvgEvents>;
    "polygon": Tag<SvgCoreAttrs, SvgEvents>;
    "polyline": Tag<SvgPolygonAttrs, SvgEvents>;
    "radialGradient": Tag<SvgCoreAttrs, SvgEvents>;
    "rect": Tag<SvgRectAttrs, SvgEvents>;
    "script": Tag<SvgCoreAttrs, SvgEvents>;
    "set": Tag<SvgCoreAttrs, SvgEvents>;
    "stop": Tag<SvgCoreAttrs, SvgEvents>;
    "style": Tag<SvgCoreAttrs, SvgEvents>;
    "svg": Tag<SvgSvgAttrs, SvgEvents>;
    "switch": Tag<Svg3in1Attrs, SvgEvents>;
    "symbol": Tag<SvgCoreAttrs, SvgEvents>;
    "text": Tag<SvgCommonTextAttrs, SvgEvents>;
    "textPath": Tag<SvgTextPathAttrs, SvgEvents>;
    "title": Tag<SvgCoreAttrs, SvgEvents>;
    "tspan": Tag<SvgCommonTextAttrs, SvgEvents>;
    "use": Tag<SvgUseAttrs, SvgEvents>;
    "view": Tag<SvgViewAttrs, SvgEvents>;
}
declare type SvgTag = HtmlAndSvgEvents;
declare interface SvgATag extends SvgTag {
    rel: string;
}
declare interface SvgSvgTag extends SvgTag {
    currentScale: number;
}
declare interface SvgTagNameMap {
    "a": SvgATag;
    "animate": SvgTag;
    "animateMotion": SvgTag;
    "animateTransform": SvgTag;
    "circle": SvgTag;
    "clipPath": SvgTag;
    "defs": SvgTag;
    "desc": SvgTag;
    "ellipse": SvgTag;
    "feBlend": SvgTag;
    "feColorMatrix": SvgTag;
    "feComponentTransfer": SvgTag;
    "feComposite": SvgTag;
    "feConvolveMatrix": SvgTag;
    "feDiffuseLighting": SvgTag;
    "feDisplacementMap": SvgTag;
    "feDistantLight": SvgTag;
    "feDropShadow": SvgTag;
    "feFlood": SvgTag;
    "feFuncA": SvgTag;
    "feFuncB": SvgTag;
    "feFuncG": SvgTag;
    "feFuncR": SvgTag;
    "feGaussianBlur": SvgTag;
    "feImage": SvgTag;
    "feMerge": SvgTag;
    "feMergeNode": SvgTag;
    "feMorphology": SvgTag;
    "feOffset": SvgTag;
    "fePointLight": SvgTag;
    "feSpecularLighting": SvgTag;
    "feSpotLight": SvgTag;
    "feTile": SvgTag;
    "feTurbulence": SvgTag;
    "filter": SvgTag;
    "foreignObject": SvgTag;
    "g": SvgTag;
    "image": SvgTag;
    "line": SvgTag;
    "linearGradient": SvgTag;
    "marker": SvgTag;
    "mask": SvgTag;
    "metadata": SvgTag;
    "mpath": SvgTag;
    "path": SvgTag;
    "pattern": SvgTag;
    "polygon": SvgTag;
    "polyline": SvgTag;
    "radialGradient": SvgTag;
    "rect": SvgTag;
    "script": SvgTag;
    "set": SvgTag;
    "stop": SvgTag;
    "style": SvgTag;
    "svg": SvgSvgTag;
    "switch": SvgTag;
    "symbol": SvgTag;
    "text": SvgTag;
    "textPath": SvgTag;
    "title": SvgTag;
    "tspan": SvgTag;
    "use": SvgTag;
    "view": SvgTag;
}



declare type AcceptedTagsMap = TagNameMap & SvgTagNameMap;
declare type AcceptedTagsSpec = HtmlTagMap & SvgTagMap;


declare type EventHandler<T> = (ev: T) => any;
declare interface Tag<Attrs, Events> {
    attrs: Attrs;
    events: Events;
}
declare type TagEvents = {
    [K : string]: EventHandler<HTMLElementEventMap[K]> | undefined;
};
declare interface TagAttrs {
    id: string;
    accesskey: string;
    autocapitalize: "off" | "none" | "on" | "sentences" | "words" | "characters";
    autofocus: "" | boolean;
    contenteditable: "true" | "false" | "" | boolean;
    dir: "ltr" | "rtl" | "auto";
    draggable: "true" | "false" | "" | boolean;
    enterkeyhint: "enter" | "done" | "go" | "next" | "previous" | "search" | "send";
    hidden: "until-found" | "hidden" | "" | boolean;
    inert: boolean;
    inputmode: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search";
    is: string;
    itemid: string;
    itemprop: string;
    itemref: string;
    itemscope: boolean;
    itemtype: string;
    lang: string;
    nonce: string;
    spellcheck: "true" | "false" | "" | boolean;
    tabindex: number;
    title: string;
    translate: "yes" | "no" | "" | boolean;
}
declare interface MediaTagAttrs extends TagAttrs {
    src: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    preload: "none" | "metadata" | "auto";
    autoplay: boolean;
    loop: boolean;
    muted: boolean;
    controls: boolean;
}
declare type MediaEvents = {
    [K : string]: EventHandler<HTMLMediaElementEventMap[K]> | undefined;
};
declare type VideoEvents = {
    [K : string]: EventHandler<HTMLVideoElementEventMap[K]> | undefined;
};
declare interface BaseAttrs extends TagAttrs {
    href: string;
    target: string;
}
declare interface LinkAttrs extends TagAttrs {
    href: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    rel: string;
    media: string;
    integrity: string;
    hreflang: string;
    type: string;
    referrerpolicy: string;
    sizes: string;
    imagesrcset: string;
    imagesizes: string;
    as: string;
    blocking: boolean;
    color: string;
}
declare interface MetaAttrs extends TagAttrs {
    name: string;
    'http-equiv': string;
    content: string;
    charset: string;
    media: string;
}
declare interface StyleAttrs extends TagAttrs {
    media: string;
    blocking: string;
}
declare type BodyEvents = {
    [K : string]: EventHandler<HTMLBodyElementEventMap[K]> | undefined;
};
declare interface BlockQuoteAttrs extends TagAttrs {
    cite: string;
}
declare interface OlAttrs extends TagAttrs {
    reversed: boolean;
    start: number;
    type: "1" | "a" | "A" | "i" | "I";
}
declare interface AAttrs extends TagAttrs {
    href: string;
    target: string;
    download: string;
    ping: string;
    hreflang: string;
    type: string;
    referrerpolicy: string;
}
declare interface QAttrs extends TagAttrs {
    cite: string;
}
declare interface DataAttr extends TagAttrs {
    value: string;
}
declare interface BdoAttrs extends TagAttrs {
    dir: "ltr" | "rtl";
}
declare interface SourceAttrs extends TagAttrs {
    type: string;
    src: string;
    srcset: string;
    sizes: string;
    media: string;
    width: number;
    height: number;
}
declare interface ImgAttrs extends TagAttrs {
    alt: string;
    src: string;
    srcset: string;
    sizes: string;
    crossorigin: "anonymous" | "use-credentials" | "" | boolean;
    usemap: string;
    ismap: string;
    width: number;
    height: number;
    referrerpolicy: string;
    decoding: string;
    loading: string;
}
declare interface IframeAttrs extends TagAttrs {
    src: string;
    srcdoc: string;
    name: string;
    sandbox: string;
    allow: string;
    allowfullscreen: string;
    width: number;
    height: number;
    referrerpolicy: string;
    loading: string;
}
declare interface EmbedAttrs extends TagAttrs {
    src: string;
    type: string;
    width: number;
    height: number;
}
declare interface ObjectAttrs extends TagAttrs {
    data: string;
    type: string;
    name: string;
    form: string;
    width: number;
    height: number;
}
declare interface ParamAttrs extends TagAttrs {
    name: string;
    value: string;
}
declare interface VideoAttrs extends MediaTagAttrs {
    poster: string;
    playsinline: boolean;
    width: number;
    height: number;
}
declare interface TrackAttrs extends TagAttrs {
    kind: string;
    src: string;
    srclang: string;
    label: string;
    defautl: boolean;
}
declare interface MapAttrs extends TagAttrs {
    name: string;
}
declare interface AreaAttrs extends TagAttrs {
    alt: string;
    coords: string;
    shape: string;
    href: string;
    target: string;
    download: string;
    ping: string;
    rel: string;
    referrerpolicy: string;
}
declare interface ColAttrs extends TagAttrs {
    span: number;
}
declare interface TdAttrs extends TagAttrs {
    colspan: number;
    rowspan: number;
    headers: string;
}
declare interface ThAttrs extends TdAttrs {
    scope: string;
    abbr: string;
}
declare interface FormAttrs extends TagAttrs {
    'accept-charset': string;
    action: string;
    autocomplete: string;
    enctype: string;
    method: string;
    name: string;
    novalidate: string;
    target: string;
    rel: string;
}
declare interface LabelAttrs extends TagAttrs {
    for: string;
}
declare interface InputAttrs extends TagAttrs {
    accept: string;
    alt: string;
    autocomplete: boolean;
    checked: boolean;
    dirname: string;
    disabled: boolean;
    form: string;
    formaction: string;
    formenctype: string;
    formmethod: string;
    formnovalidate: string;
    formtarget: string;
    height: number;
    list: string;
    max: number;
    maxlength: number;
    min: number;
    minlength: number;
    multiple: boolean;
    name: string;
    pattern: string;
    placeholder: string;
    readonly: string;
    required: string;
    size: number;
    src: string;
    step: string;
    type: string;
    width: number;
}
declare interface ButtonAttrs extends TagAttrs {
    disabled: boolean;
    form: string;
    formaction: string;
    formenctype: string;
    formmethod: string;
    formnovalidate: string;
    formtarget: string;
    name: string;
    type: string;
    value: string;
}
declare interface SelectAttrs extends TagAttrs {
    autocomplete: boolean;
    disabled: boolean;
    form: string;
    multiple: boolean;
    name: string;
    required: boolean;
    size: number;
}
declare interface OptgroupAttrs extends TagAttrs {
    disabled: boolean;
    label: string;
}
declare interface OptionAttrs extends TagAttrs {
    disabled: boolean;
    label: string;
    selected: boolean;
    value: string;
}
declare interface TextareaAttrs extends TagAttrs {
    autocomplete: boolean;
    cols: number;
    dirname: string;
    disabled: boolean;
    form: string;
    maxlength: number;
    minlength: number;
    name: string;
    placeholder: string;
    readonly: boolean;
    required: boolean;
    rows: number;
    wrap: string;
}
declare interface OutputAttrs extends TagAttrs {
    for: string;
    form: string;
    name: string;
}
declare interface ProgressAttrs extends TagAttrs {
    value: number;
    max: number;
}
declare interface MeterAttrs extends TagAttrs {
    value: number;
    min: number;
    max: number;
    low: number;
    high: number;
    optimum: number;
}
declare interface FieldsetAttrs extends TagAttrs {
    disabled: boolean;
    form: string;
    name: string;
}
declare interface DetailsAttrs extends TagAttrs {
    open: boolean;
}
declare interface HtmlTagMap {
    "a": Tag<AAttrs, TagEvents>;
    "abbr": Tag<TagAttrs, TagEvents>;
    "address": Tag<TagAttrs, TagEvents>;
    "area": Tag<AreaAttrs, TagEvents>;
    "article": Tag<TagAttrs, TagEvents>;
    "aside": Tag<TagAttrs, TagEvents>;
    "audio": Tag<MediaTagAttrs, MediaEvents>;
    "b": Tag<TagAttrs, TagEvents>;
    "base": Tag<BaseAttrs, TagEvents>;
    "bdi": Tag<TagAttrs, TagEvents>;
    "bdo": Tag<BdoAttrs, TagEvents>;
    "blockquote": Tag<BlockQuoteAttrs, TagEvents>;
    "body": Tag<TagAttrs, BodyEvents>;
    "br": Tag<TagAttrs, TagEvents>;
    "button": Tag<ButtonAttrs, TagEvents>;
    "canvas": Tag<TagAttrs, TagEvents>;
    "caption": Tag<TagAttrs, TagEvents>;
    "cite": Tag<TagAttrs, TagEvents>;
    "code": Tag<TagAttrs, TagEvents>;
    "col": Tag<ColAttrs, TagEvents>;
    "colgroup": Tag<ColAttrs, TagEvents>;
    "data": Tag<DataAttr, TagEvents>;
    "datalist": Tag<TagAttrs, TagEvents>;
    "dd": Tag<TagAttrs, TagEvents>;
    "del": Tag<TagAttrs, TagEvents>;
    "details": Tag<DetailsAttrs, TagEvents>;
    "dfn": Tag<TagAttrs, TagEvents>;
    "dialog": Tag<TagAttrs, TagEvents>;
    "dir": Tag<TagAttrs, TagEvents>;
    "div": Tag<TagAttrs, TagEvents>;
    "dl": Tag<TagAttrs, TagEvents>;
    "dt": Tag<TagAttrs, TagEvents>;
    "em": Tag<TagAttrs, TagEvents>;
    "embed": Tag<EmbedAttrs, TagEvents>;
    "fieldset": Tag<FieldsetAttrs, TagEvents>;
    "figcaption": Tag<TagAttrs, TagEvents>;
    "figure": Tag<TagAttrs, TagEvents>;
    "font": Tag<TagAttrs, TagEvents>;
    "footer": Tag<TagAttrs, TagEvents>;
    "form": Tag<FormAttrs, TagEvents>;
    "frame": Tag<TagAttrs, TagEvents>;
    "frameset": Tag<TagAttrs, TagEvents>;
    "h1": Tag<TagAttrs, TagEvents>;
    "h2": Tag<TagAttrs, TagEvents>;
    "h3": Tag<TagAttrs, TagEvents>;
    "h4": Tag<TagAttrs, TagEvents>;
    "h5": Tag<TagAttrs, TagEvents>;
    "h6": Tag<TagAttrs, TagEvents>;
    "head": Tag<TagAttrs, TagEvents>;
    "header": Tag<TagAttrs, TagEvents>;
    "hgroup": Tag<TagAttrs, TagEvents>;
    "hr": Tag<TagAttrs, TagEvents>;
    "html": Tag<TagAttrs, TagEvents>;
    "i": Tag<TagAttrs, TagEvents>;
    "iframe": Tag<IframeAttrs, TagEvents>;
    "img": Tag<ImgAttrs, TagEvents>;
    "input": Tag<InputAttrs, TagEvents>;
    "ins": Tag<TagAttrs, TagEvents>;
    "kbd": Tag<TagAttrs, TagEvents>;
    "label": Tag<LabelAttrs, TagEvents>;
    "legend": Tag<TagAttrs, TagEvents>;
    "li": Tag<TagAttrs, TagEvents>;
    "link": Tag<LinkAttrs, TagEvents>;
    "main": Tag<TagAttrs, TagEvents>;
    "map": Tag<MapAttrs, TagEvents>;
    "mark": Tag<TagAttrs, TagEvents>;
    "marquee": Tag<TagAttrs, TagEvents>;
    "menu": Tag<TagAttrs, TagEvents>;
    "meta": Tag<MetaAttrs, TagEvents>;
    "meter": Tag<MeterAttrs, TagEvents>;
    "nav": Tag<TagAttrs, TagEvents>;
    "noscript": Tag<TagAttrs, TagEvents>;
    "object": Tag<ObjectAttrs, TagEvents>;
    "ol": Tag<OlAttrs, TagEvents>;
    "optgroup": Tag<OptgroupAttrs, TagEvents>;
    "option": Tag<OptionAttrs, TagEvents>;
    "output": Tag<OutputAttrs, TagEvents>;
    "p": Tag<TagAttrs, TagEvents>;
    "param": Tag<ParamAttrs, TagEvents>;
    "picture": Tag<TagAttrs, TagEvents>;
    "pre": Tag<TagAttrs, TagEvents>;
    "progress": Tag<ProgressAttrs, TagEvents>;
    "q": Tag<QAttrs, TagEvents>;
    "rp": Tag<TagAttrs, TagEvents>;
    "rt": Tag<TagAttrs, TagEvents>;
    "ruby": Tag<TagAttrs, TagEvents>;
    "s": Tag<TagAttrs, TagEvents>;
    "samp": Tag<TagAttrs, TagEvents>;
    "script": Tag<TagAttrs, TagEvents>;
    "section": Tag<TagAttrs, TagEvents>;
    "select": Tag<SelectAttrs, TagEvents>;
    "slot": Tag<TagAttrs, TagEvents>;
    "small": Tag<TagAttrs, TagEvents>;
    "source": Tag<SourceAttrs, TagEvents>;
    "span": Tag<TagAttrs, TagEvents>;
    "strong": Tag<TagAttrs, TagEvents>;
    "style": Tag<StyleAttrs, TagEvents>;
    "sub": Tag<TagAttrs, TagEvents>;
    "summary": Tag<TagAttrs, TagEvents>;
    "sup": Tag<TagAttrs, TagEvents>;
    "table": Tag<TagAttrs, TagEvents>;
    "tbody": Tag<TagAttrs, TagEvents>;
    "td": Tag<TdAttrs, TagEvents>;
    "template": Tag<TagAttrs, TagEvents>;
    "textarea": Tag<TextareaAttrs, TagEvents>;
    "tfoot": Tag<TagAttrs, TagEvents>;
    "th": Tag<ThAttrs, TagEvents>;
    "thead": Tag<TagAttrs, TagEvents>;
    "time": Tag<TagAttrs, TagEvents>;
    "title": Tag<TagAttrs, TagEvents>;
    "tr": Tag<TagAttrs, TagEvents>;
    "track": Tag<TrackAttrs, TagEvents>;
    "u": Tag<TagAttrs, TagEvents>;
    "ul": Tag<TagAttrs, TagEvents>;
    "var": Tag<TagAttrs, TagEvents>;
    "video": Tag<VideoAttrs, VideoEvents>;
    "wbr": Tag<TagAttrs, TagEvents>;
    [K: string]: Tag<TagAttrs, TagEvents>;
}
declare type HtmlOrSvgTag = HTMLElement | SVGElement;
declare interface HtmlAndSvgEvents {
    onabort?: ((this: HtmlOrSvgTag, ev: UIEvent) => any) | null;
    onanimationcancel?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationend?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationiteration?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onanimationstart?: ((this: HtmlOrSvgTag, ev: AnimationEvent) => any) | null;
    onauxclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onblur?: ((this: HtmlOrSvgTag, ev: FocusEvent) => any) | null;
    oncanplay?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oncanplaythrough?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onclose?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oncontextmenu?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    oncopy?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    oncut?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    oncuechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ondblclick?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    ondrag?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragend?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragenter?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragleave?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragover?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondragstart?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondrop?: ((this: HtmlOrSvgTag, ev: DragEvent) => any) | null;
    ondurationchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onemptied?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onended?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onerror?: ((event: Event | string, source?: string, lineno?: number, colno?: number, error?: Error) => any) | null;
    onfocus?: ((this: HtmlOrSvgTag, ev: FocusEvent) => any) | null;
    onformdata?: ((this: HtmlOrSvgTag, ev: FormDataEvent) => any) | null;
    onfullscreenchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onfullscreenerror?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ongotpointercapture?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    oninput?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    oninvalid?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onkeydown?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onkeypress?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onkeyup?: ((this: HtmlOrSvgTag, ev: KeyboardEvent) => any) | null;
    onload?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadeddata?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadedmetadata?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onloadstart?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onlostpointercapture?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onmousedown?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseenter?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseleave?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmousemove?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseout?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseover?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onmouseup?: ((this: HtmlOrSvgTag, ev: MouseEvent) => any) | null;
    onpaste?: ((this: HtmlOrSvgTag, ev: ClipboardEvent) => any) | null;
    onpause?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onplay?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onplaying?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onpointercancel?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerdown?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerenter?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerleave?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointermove?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerout?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerover?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onpointerup?: ((this: HtmlOrSvgTag, ev: PointerEvent) => any) | null;
    onprogress?: ((this: HtmlOrSvgTag, ev: ProgressEvent) => any) | null;
    onratechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onreset?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onresize?: ((this: HtmlOrSvgTag, ev: UIEvent) => any) | null;
    onscroll?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onseeked?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onseeking?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselect?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselectionchange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onselectstart?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onstalled?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onsubmit?: ((this: HtmlOrSvgTag, ev: SubmitEvent) => any) | null;
    onsuspend?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontimeupdate?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontoggle?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    ontouchcancel?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchend?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchmove?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontouchstart?: ((this: HtmlOrSvgTag, ev: TouchEvent) => any) | null | undefined;
    ontransitioncancel?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionend?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionrun?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    ontransitionstart?: ((this: HtmlOrSvgTag, ev: TransitionEvent) => any) | null;
    onvolumechange?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onwaiting?: ((this: HtmlOrSvgTag, ev: Event) => any) | null;
    onwheel?: ((this: HtmlOrSvgTag, ev: WheelEvent) => any) | null;
}
declare interface HtmlTag extends HtmlAndSvgEvents {
    autofocus?: boolean;
    className?: string;
    nonce?: string | undefined;
    tabIndex?: number;
    accessKey?: string;
    autocapitalize?: string;
    dir?: string;
    draggable?: boolean;
    hidden?: boolean;
    innerText?: string;
    lang?: string;
    outerText?: string;
    spellcheck?: boolean;
    title?: string;
    translate?: boolean;
}
declare interface AnchorTag extends HtmlTag {
    download: string;
    hreflang: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    target: string;
    text: string;
    type: string;
}
declare interface AreaTag extends HtmlTag {
    alt: string;
    coords: string;
    download: string;
    ping: string;
    referrerPolicy: string;
    rel: string;
    shape: string;
    target: string;
}
declare interface MediaTag extends HtmlTag {
    autoplay?: boolean;
    controls?: boolean;
    crossOrigin?: string | null;
    currentTime?: number;
    defaultMuted?: boolean;
    defaultPlaybackRate?: number;
    disableRemotePlayback?: boolean;
    loop?: boolean;
    muted?: boolean;
    onencrypted?: ((this: HTMLMediaElement, ev: MediaEncryptedEvent) => any) | null;
    onwaitingforkey?: ((this: HTMLMediaElement, ev: Event) => any) | null;
    playbackRate?: number;
    preload?: "none" | "metadata" | "auto" | "";
    src?: string;
    srcObject?: MediaProvider | null;
    volume?: number;
}
declare interface BaseTag extends HtmlTag {
    href: string;
    target: string;
}
declare interface QuoteTag extends HtmlTag {
    cite: string;
}
declare interface ButtonTag extends HtmlTag {
    disabled: boolean;
    formAction: string;
    formEnctype: string;
    formMethod: string;
    formNoValidate: boolean;
    formTarget: string;
    name: string;
    type: string;
    value: string;
}
declare interface CanvasTag extends HtmlTag {
    height: number;
    width: number;
}
declare interface TableColTag extends HtmlTag {
    span: number;
}
declare interface DataTag extends HtmlTag {
    value: string;
}
declare interface ModTag extends HtmlTag {
    cite: string;
    dateTime: string;
}
declare interface DetailsTag extends HtmlTag {
    open: boolean;
}
declare interface EmbedTag extends HtmlTag {
    height: string;
    src: string;
    type: string;
    width: string;
}
declare interface FieldSetTag extends HtmlTag {
    disabled: boolean;
    name: string;
}
declare interface FormTag extends HtmlTag {
    acceptCharset: string;
    action: string;
    autocomplete: string;
    encoding: string;
    enctype: string;
    method: string;
    name: string;
    noValidate: boolean;
    target: string;
}
declare interface IFrameTag extends HtmlTag {
    allow: string;
    allowFullscreen: boolean;
    height: string;
    name: string;
    referrerPolicy: ReferrerPolicy;
    src: string;
    srcdoc: string;
    width: string;
}
declare interface ImageTag extends HtmlTag {
    alt: string;
    crossOrigin: string | null;
    decoding: "async" | "sync" | "auto";
    height: number;
    isMap: boolean;
    loading: string;
    referrerPolicy: string;
    sizes: string;
    src: string;
    srcset: string;
    useMap: string;
    width: number;
}
declare interface InputTag extends HtmlTag {
    accept: string;
    alt: string;
    autocomplete: string;
    capture: string;
    checked: boolean;
    defaultChecked: boolean;
    defaultValue: string;
    dirName: string;
    disabled: boolean;
    files: FileList | null;
    formAction: string;
    formEnctype: string;
    formMethod: string;
    formNoValidate: boolean;
    formTarget: string;
    height: number;
    indeterminate: boolean;
    max: string;
    maxLength: number;
    min: string;
    minLength: number;
    multiple: boolean;
    name: string;
    pattern: string;
    placeholder: string;
    readOnly: boolean;
    required: boolean;
    selectionDirection: "forward" | "backward" | "none" | null;
    selectionEnd: number | null;
    selectionStart: number | null;
    size: number;
    src: string;
    step: string;
    type: string;
    value: string;
    valueAsDate: Date | null;
    valueAsNumber: number;
    webkitdirectory: boolean;
    width: number;
}
declare interface LabelTag extends HtmlTag {
    htmlFor: string;
}
declare interface LITag extends HtmlTag {
    value: number;
}
declare interface LinkTag extends HtmlTag {
    as: string;
    crossOrigin: string | null;
    disabled: boolean;
    href: string;
    hreflang: string;
    imageSizes: string;
    imageSrcset: string;
    integrity: string;
    media: string;
    referrerPolicy: string;
    rel: string;
    type: string;
}
declare interface MapTag extends HtmlTag {
    name: string;
}
declare interface MeterTag extends HtmlTag {
    high: number;
    low: number;
    max: number;
    min: number;
    optimum: number;
    value: number;
}
declare interface ObjectTag extends HtmlTag {
    data: string;
    height: string;
    name: string;
    type: string;
    useMap: string;
    width: string;
}
declare interface OListTag extends HtmlTag {
    reversed: boolean;
    start: number;
    type: string;
}
declare interface OptGroupTag extends HtmlTag {
    disabled: boolean;
    label: string;
}
declare interface OptionTag extends HtmlTag {
    defaultSelected: boolean;
    disabled: boolean;
    label: string;
    selected: boolean;
    text: string;
    value: string;
}
declare interface OutputTag extends HtmlTag {
    defaultValue: string;
    name: string;
    value: string;
}
declare interface ParamTag extends HtmlTag {
    name: string;
    value: string;
}
declare interface ProgressTag extends HtmlTag {
    max: number;
    value: number;
}
declare interface ScriptTag extends HtmlTag {
    async: boolean;
    crossOrigin: string | null;
    defer: boolean;
    integrity: string;
    noModule: boolean;
    referrerPolicy: string;
    src: string;
    text: string;
    type: string;
}
declare interface SelectTag extends HtmlTag {
    autocomplete: string;
    disabled: boolean;
    length: number;
    multiple: boolean;
    name: string;
    required: boolean;
    selectedIndex: number;
    size: number;
    value: string;
}
declare interface SlotTag extends HtmlTag {
    name: string;
}
declare interface SourceTag extends HtmlTag {
    media: string;
    sizes: string;
    src: string;
    srcset: string;
    type: string;
}
declare interface StyleTag extends HtmlTag {
    media: string;
}
declare interface TableTag extends HtmlTag {
    caption: HTMLTableCaptionElement | null;
    tFoot: HTMLTableSectionElement | null;
    tHead: HTMLTableSectionElement | null;
}
declare interface TableCellTag extends HtmlTag {
    abbr: string;
    colSpan: number;
    headers: string;
    rowSpan: number;
    scope: string;
}
declare interface TextAreaTag extends HtmlTag {
    autocomplete: string;
    cols: number;
    defaultValue: string;
    dirName: string;
    disabled: boolean;
    maxLength: number;
    minLength: number;
    name: string;
    placeholder: string;
    readOnly: boolean;
    required: boolean;
    rows: number;
    selectionDirection: "forward" | "backward" | "none";
    selectionEnd: number;
    selectionStart: number;
    value: string;
    wrap: string;
}
declare interface TimeTag extends HtmlTag {
    dateTime: string;
}
declare interface TitleTag extends HtmlTag {
    text: string;
}
declare interface TrackTag extends HtmlTag {
    default: boolean;
    kind: string;
    label: string;
    src: string;
    srclang: string;
}
declare interface VideoTag extends MediaTag {
    disablePictureInPicture?: boolean;
    height?: number;
    onenterpictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    onleavepictureinpicture?: ((this: HTMLVideoElement, ev: Event) => any) | null;
    playsInline?: boolean;
    poster?: string;
    width?: number;
}
declare interface TagNameMap {
    "a": AnchorTag;
    "abbr": HtmlTag;
    "address": HtmlTag;
    "area": AreaTag;
    "article": HtmlTag;
    "aside": HtmlTag;
    "audio": MediaTag;
    "b": HtmlTag;
    "base": BaseTag;
    "bdi": HtmlTag;
    "bdo": HtmlTag;
    "blockquote": QuoteTag;
    "body": HtmlTag;
    "br": HtmlTag;
    "button": ButtonTag;
    "canvas": CanvasTag;
    "caption": HtmlTag;
    "cite": HtmlTag;
    "code": HtmlTag;
    "col": TableColTag;
    "colgroup": TableColTag;
    "data": DataTag;
    "datalist": HtmlTag;
    "dd": HtmlTag;
    "del": ModTag;
    "details": DetailsTag;
    "dfn": HtmlTag;
    "dialog": HtmlTag;
    "div": HtmlTag;
    "dl": HtmlTag;
    "dt": HtmlTag;
    "em": HtmlTag;
    "embed": EmbedTag;
    "fieldset": FieldSetTag;
    "figcaption": HtmlTag;
    "figure": HtmlTag;
    "footer": HtmlTag;
    "form": FormTag;
    "h1": HtmlTag;
    "h2": HtmlTag;
    "h3": HtmlTag;
    "h4": HtmlTag;
    "h5": HtmlTag;
    "h6": HtmlTag;
    "head": HtmlTag;
    "header": HtmlTag;
    "hgroup": HtmlTag;
    "hr": HtmlTag;
    "html": HtmlTag;
    "i": HtmlTag;
    "iframe": IFrameTag;
    "img": ImageTag;
    "input": InputTag;
    "ins": ModTag;
    "kbd": HtmlTag;
    "label": LabelTag;
    "legend": HtmlTag;
    "li": LITag;
    "link": LinkTag;
    "main": HtmlTag;
    "map": MapTag;
    "mark": HtmlTag;
    "menu": HtmlTag;
    "meta": HtmlTag;
    "meter": MeterTag;
    "nav": HtmlTag;
    "noscript": HtmlTag;
    "object": ObjectTag;
    "ol": OListTag;
    "optgroup": OptGroupTag;
    "option": OptionTag;
    "output": OutputTag;
    "p": HtmlTag;
    "param": ParamTag;
    "picture": HtmlTag;
    "pre": HtmlTag;
    "progress": ProgressTag;
    "q": QuoteTag;
    "rp": HtmlTag;
    "rt": HtmlTag;
    "ruby": HtmlTag;
    "s": HtmlTag;
    "samp": HtmlTag;
    "script": ScriptTag;
    "section": HtmlTag;
    "select": SelectTag;
    "slot": SlotTag;
    "small": HtmlTag;
    "source": SourceTag;
    "span": HtmlTag;
    "strong": HtmlTag;
    "style": StyleTag;
    "sub": HtmlTag;
    "summary": HtmlTag;
    "sup": HtmlTag;
    "table": TableTag;
    "tbody": HtmlTag;
    "td": TableCellTag;
    "template": HtmlTag;
    "textarea": TextAreaTag;
    "tfoot": HtmlTag;
    "th": TableCellTag;
    "thead": HtmlTag;
    "time": TimeTag;
    "title": TitleTag;
    "tr": HtmlTag;
    "track": TrackTag;
    "u": HtmlTag;
    "ul": HtmlTag;
    "var": HtmlTag;
    "video": VideoTag;
    "wbr": HtmlTag;
}



}
