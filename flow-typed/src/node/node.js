// @flow
import { Reactive, ReactivePrivate } from "../core/core";
import { IValue } from "../core/ivalue";
import type { AppNode } from "./app";



declare export class FragmentPrivate extends ReactivePrivate {

    app : AppNode;
    parent : Fragment;
    next : ?Fragment;
    prev : ?Fragment;

    constructor () : void;
    preinit (app : AppNode, parent: Fragment) : void;
}

/**
 * This class is symbolic
 * @extends Reactive
 */
declare export class Fragment extends Reactive {
    $ : FragmentPrivate;
    $children : Array<Fragment>;

    constructor ($ : ?FragmentPrivate) : void;

    $preinit (app: AppNode, parent : Fragment, data ?: any) : void;
    $init () : this;
    $created () : void;
    $mounted () : void;
    $ready () : void;
    $createSignals () : void;
    $createWatchers () : void;
    $compose () : void;
    $$pushNode (node : Fragment) : void;
    $$findFirstChild () : ?Node;
    $$appendNode (node : Node) : void ;
    $$insertAdjacent (node : Node) : void
    $text (
        text : string | IValue<string>,
        cb : ?(text : TextNode) => void
    ) : this;
    $debug(text : IValue<string>) : this;
    $tag<T = Element> (
        tagName : string,
        cb : ?(node : Tag, element : T) => void
    ) : this;
    $create<T> (
        node : T,
        callback : ($ : T) => void
    ) : this;
    $if (
        cond : IValue<boolean>,
        cb : (node : Fragment) => void
    ) : this ;
    $if_else (
        ifCond : IValue<boolean>,
        ifCb : (node : Fragment) => void,
        elseCb : (node : Fragment) => void
    ) : this;
    $switch (
        ...cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>
    ) : this;
    $case (cond : IValue<boolean>, cb : (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void};
    $default (cb: (node : Fragment) => void)
        : {cond : IValue<boolean>, cb : (node : Fragment) => void};
}

declare export class TextNodePrivate extends FragmentPrivate {
    node : Text;

    constructor () : void;
    preinitText (app : AppNode, parent: Fragment, text : IValue<string>) : void;
}

declare export class TextNode extends Fragment {
    $ : TextNodePrivate;
    constructor () : void;

    $preinit (app : AppNode, parent : Fragment, text : ?IValue<string>) : void;
}

declare export class INodePrivate extends FragmentPrivate {

    unmounted : boolean;
    node : Element;

    constructor () : void;
}

declare export class INode extends Fragment {
    $ : INodePrivate;

    constructor ($ : ?INodePrivate) : void;
    $init () : this;
    $createAttrs () : void;
    $createStyle () : void;
    $attr (name : string, value : IValue<?string>) : this;
    $bindAttr<T1> (
        name : string,
        calculator : (a1 : T1) => string,
        v1 : IValue<T1>,
    ) : this;
    $bindAttr<T1, T2> (
        name : string,
        calculator : (a1 : T1, a2 : T2) => string,
        v1 : IValue<T1>, v2 : IValue<T2>,
    ) : this;
    $bindAttr<T1, T2, T3> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
    ) : this;
    $bindAttr<T1, T2, T3, T4> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>,
    ) : this;
    $bindAttr<T1, T2, T3, T4, T5> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>,
    ) : this;
    $bindAttr<T1, T2, T3, T4, T5, T6> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
    ) : this;
    $bindAttr<T1, T2, T3, T4, T5, T6, T7> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>,
    ) : this;
    $bindAttr<T1, T2, T3, T4, T5, T6, T7, T8> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>,
    ) : this;
    $bindAttr<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this;
    $setAttr (
        name : string,
        value : string
    ) : this;
    $addClass (cl : string) : this;
    $addClasses (...cl : Array<string>) : this;
    $bindClass (
        className : IValue<string>
    ) : this;
    $floatingClass (cond : IValue<boolean>, className : string) : this;
    $style (name : string, value : IValue<string>) : this;
    $bindStyle<T1> (
        name : string,
        calculator : (a1 : T1) => string,
        v1 : IValue<T1>,
    ) : this;
    $bindStyle<T1, T2> (
        name : string,
        calculator : (a1 : T1, a2 : T2) => string,
        v1 : IValue<T1>, v2 : IValue<T2>,
    ) : this;
    $bindStyle<T1, T2, T3> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
    ) : this;
    $bindStyle<T1, T2, T3, T4> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>,
    ) : this;
    $bindStyle<T1, T2, T3, T4, T5> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>,
    ) : this;
    $bindStyle<T1, T2, T3, T4, T5, T6> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
    ) : this;
    $bindStyle<T1, T2, T3, T4, T5, T6, T7> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>,
    ) : this;
    $bindStyle<T1, T2, T3, T4, T5, T6, T7, T8> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>,
    ) : this;
    $bindStyle<T1, T2, T3, T4, T5, T6, T7, T8, T9> (
        name : string,
        calculator : (a1 : T1, a2 : T2, a3 : T3, a4 : T4, a5 : T5, a6 : T6, a7 : T7, a8 : T8, a9 : T9) => string,
        v1 : IValue<T1>, v2 : IValue<T2>, v3 : IValue<T3>,
        v4 : IValue<T4>, v5 : IValue<T5>, v6 : IValue<T6>,
        v7 : IValue<T7>, v8 : IValue<T8>, v9 : IValue<T9>,
    ) : this;
    $setStyle (
        prop : string,
        value : string
    ) : this;
    $listen (name : string, handler : (ev : any) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $oncontextmenu (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmousedown (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmouseenter (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmouseleave (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmousemove (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmouseout (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmouseover (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onmouseup (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onclick (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondblclick (handler : (ev : MouseEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onblur (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onfocus (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onfocusin (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onfocusout (handler : (ev : FocusEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onkeydown (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onkeyup (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onkeypress (handler : (ev : KeyboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ontouchstart (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ontouchmove (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ontouchend (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ontouchcancel (handler : (ev : TouchEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onwheel (handler : (ev : WheelEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onabort (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onerror (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onload (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onloadend (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onloadstart (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onprogress (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ontimeout (handler : (ev : ProgressEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondrag (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragend (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragenter (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragexit (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragleave (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragover (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondragstart (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ondrop (handler : (ev : DragEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerover (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerenter (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerdown (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointermove (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerup (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointercancel (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerout (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpointerleave (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $ongotpointercapture (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onlostpointercapture (handler : (ev : PointerEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onanimationstart (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onanimationend (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onanimationiteraton (handler : (ev : AnimationEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onclipboardchange (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $oncut (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $oncopy (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $onpaste (handler : (ev : ClipboardEvent) => void, options : ?EventListenerOptionsOrUseCapture) : this;
    $$insertAdjacent (node : Node) : void;
    $bindShow (cond : IValue<boolean>) : this;
    $html (value : IValue<string>) : void;
}

declare export class Tag extends INode {

    constructor () : void;

    $preinit (app : AppNode, parent : Fragment, tagName : ?string) : void;
    $$appendNode(node: Node): void;
    $bindMount(cond: IValue<boolean>): this;
}

declare export class Extension extends INode {
    $preinit (app : AppNode, parent : Fragment) : void;

    constructor ($ : ?INodePrivate) : void;
}

declare export class Component extends Extension {
    constructor () : void;

    $mounted () : void;
}

declare export class SwitchedNodePrivate extends INodePrivate {
    index : number;
    extension : ?Extension;
    cases : { cond : IValue<boolean>, cb : (node : Fragment) => void }[];
    sync : () => void;

    constructor () : void;
}

declare class SwitchedNode extends Extension {
    constructor ($ : ?SwitchedNodePrivate) : void;
    setCases (cases : Array<{ cond : IValue<boolean>, cb : (node : Fragment) => void }>) : void;
    createChild (cb : (node : Fragment) => void) : void;
    $ready () : void;
}

declare export class DebugPrivate extends FragmentPrivate {
    node : Comment;

    constructor () : void;

    preinitComment (app : AppNode, parent: Fragment, text : IValue<string>) : void;
}

declare export class DebugNode extends Fragment {
    $ : DebugPrivate;

    constructor () : void;

    $preinit (app : AppNode, parent : Fragment, text : ?IValue<string>) : void;
}

