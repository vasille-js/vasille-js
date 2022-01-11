// @flow



declare export class Executor {
    addClass (el : Element, cl : string) : void;
    removeClass (el : Element, cl : string) : void;
    setAttribute (el : Element, name : string, value : string) : void;
    removeAttribute (el : Element, name : string) : void;
    setStyle (el : HTMLElement, prop : string, value : string) : void;
    insertBefore (target : Node, child : Node) : void;
    appendChild (el : Element, child : Node) : void;
    callCallback (cb : () => void) : void;
}

declare export class InstantExecutor extends Executor {
}

declare export class TimeoutExecutor extends InstantExecutor {
}

export const instantExecutor : InstantExecutor = new InstantExecutor();
export const timeoutExecutor : TimeoutExecutor = new TimeoutExecutor();
