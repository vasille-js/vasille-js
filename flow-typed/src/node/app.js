// @flow
import { Executor } from "../core/executor";
import { INode } from "./node";

declare type AppOptions = ?{
    freezeUi : boolean,
    executor : Executor
};

declare export class AppNode extends INode {
    $run : Executor;

    constructor (options : AppOptions) : void;
}

declare export class App extends AppNode {
    constructor (node : HTMLElement, options : AppOptions) : void;
}
