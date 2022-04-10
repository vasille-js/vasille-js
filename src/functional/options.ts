import {IValue} from "../core/ivalue";

export interface Options {
    on ?: void
    is ?: void
    slot ?: (...args: any[]) => void
}

export interface TagOptions extends Options {
    attr ?: Record<string, string | IValue<string>>
    class ?: (string | IValue<string> | Record<string, IValue<boolean>>)[]
    style ?: Record<string, string | IValue<string> | [number | string | IValue<number | string>, string]>
    events ?: {
        contextmenu ?: (ev : MouseEvent) => void,
        mousedown ?: (ev : MouseEvent) => void,
        mouseenter ?: (ev : MouseEvent) => void,
        mouseleave ?: (ev : MouseEvent) => void,
        mousemove ?: (ev : MouseEvent) => void,
        mouseout ?: (ev : MouseEvent) => void,
        mouseover ?: (ev : MouseEvent) => void,
        mouseup ?: (ev : MouseEvent) => void,
        click ?: (ev : MouseEvent) => void,
        dblclick ?: (ev : MouseEvent) => void,
        blur ?: (ev : FocusEvent) => void,
        focus ?: (ev : FocusEvent) => void,
        focusin ?: (ev : FocusEvent) => void,
        focusout ?: (ev : FocusEvent) => void,
        keydown ?: (ev : KeyboardEvent) => void,
        keyup ?: (ev : KeyboardEvent) => void,
        keypress ?: (ev : KeyboardEvent) => void,
        touchstart ?: (ev : TouchEvent) => void,
        touchmove ?: (ev : TouchEvent) => void,
        touchend ?: (ev : TouchEvent) => void,
        touchcancel ?: (ev : TouchEvent) => void,
        wheel ?: (ev : WheelEvent) => void,
        abort ?: (ev : ProgressEvent) => void,
        error ?: (ev : ProgressEvent) => void,
        load ?: (ev : ProgressEvent) => void,
        loaded ?: (ev : ProgressEvent) => void,
        loadstart ?: (ev : ProgressEvent) => void,
        progress ?: (ev : ProgressEvent) => void,
        timeout ?: (ev : ProgressEvent) => void,
        drag ?: (ev : DragEvent) => void,
        dragend ?: (ev : DragEvent) => void,
        dragenter ?: (ev : DragEvent) => void,
        dragexit ?: (ev : DragEvent) => void,
        dragleave ?: (ev : DragEvent) => void,
        dragover ?: (ev : DragEvent) => void,
        dragstart ?: (ev : DragEvent) => void,
        drop ?: (ev : DragEvent) => void,
        pointerover ?: (ev : PointerEvent) => void,
        pointerenter ?: (ev : PointerEvent) => void,
        pointerdown ?: (ev : PointerEvent) => void,
        pointermove ?: (ev : PointerEvent) => void,
        pointerup ?: (ev : PointerEvent) => void,
        pointercancel ?: (ev : PointerEvent) => void,
        pointerout ?: (ev : PointerEvent) => void,
        pointerleave ?: (ev : PointerEvent) => void,
        gotpointercapture ?: (ev : PointerEvent) => void,
        lostpointercapture ?: (ev : PointerEvent) => void,
        animationstart ?: (ev : AnimationEvent) => void,
        animationend ?: (ev : AnimationEvent) => void,
        animationiteration ?: (ev : AnimationEvent) => void,
        clipboardchange ?: (ev : ClipboardEvent) => void,
        cut ?: (ev : ClipboardEvent) => void,
        copy ?: (ev : ClipboardEvent) => void,
        paste ?: (ev : ClipboardEvent) => void

    }
    bind ?: {
        html ?: IValue<string>,
        value ?: IValue<string>,
        checked ?: IValue<boolean>
    }
    set ?: Record<string, any | IValue<any>>
}

