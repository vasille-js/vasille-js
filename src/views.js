import {AppNode, BaseNode, ElementNode, ShadowNode, TextNode} from "./node.js";
import {IValue} from "./interfaces/ivalue";



type TextNodeCB = ?(text: TextNode) => void;
type ElementNodeCB = ?(text: ElementNode) => void;

export class RepeatNode extends ShadowNode {
    constructor(
        app: AppNode,
        rt: ?BaseNode,
        ts: ?BaseNode,
        cName: string,
        props: Object
    ) {
        super(app, rt, ts, cName);
    }

    defText(text: string | IValue, cbOrSlot: string | TextNodeCB, cb2: TextNodeCB): BaseNode {

    }
}

export class Repeater extends ShadowNode {

}

export class ArrayView extends ShadowNode {

}

export class ObjectView extends ShadowNode {

}

export class MapView extends ShadowNode {

}

export class SetView extends ShadowNode {

}
