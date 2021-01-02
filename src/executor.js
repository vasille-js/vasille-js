// @flow
export class Executor {
    constructor () {
    }

    addClass (el : HTMLElement, cl : string) {
        throw "Must be overwritten";
    }

    removeClass (el : HTMLElement, cl : string) {
        throw "Must be overwritten";
    }

    setAttribute (el : HTMLElement, name : string, value : string) {
        throw "Must be overwritten";
    }

    removeAttribute (el : HTMLElement, name : string) {
        throw "Must be overwritten";
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        throw "Must be overwritten";
    }

    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        throw "Must be overwritten";
    }

    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        throw "Must be overwritten";
    }

    callCallback (cb : Function) {
        throw "Must be overwritten";
    }
}

export class InstantExecutor extends Executor {
    addClass (el : HTMLElement, cl : string) {
        if (el) {
            el.classList.add(cl);
        }
    }

    removeClass (el : HTMLElement, cl : string) {
        if (el) {
            el.classList.remove(cl);
        }
    }

    setAttribute (el : HTMLElement, name : string, value : string) {
        el.setAttribute(name, value);
    }

    removeAttribute (el : HTMLElement, name : string) {
        el.removeAttribute(name);
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        el.style.setProperty(prop, value);
    }

    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        el.insertBefore(child, before);
    }

    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        el.appendChild(child);
    }

    callCallback (cb : Function) {
        cb();
    }
}

export class TimeoutExecutor extends Executor {
    addClass (el : HTMLElement, cl : string) {
        if (el) {
            setTimeout(() => {
                el.classList.add(cl);
            }, 0);
        }
    }

    removeClass (el : HTMLElement, cl : string) {
        if (el) {
            setTimeout(() => {
                el.classList.remove(cl);
            }, 0);
        }
    }

    setAttribute (el : HTMLElement, name : string, value : string) {
        setTimeout(() => {
            el.setAttribute(name, value);
        }, 0);
    }

    removeAttribute (el : HTMLElement, name : string) {
        setTimeout(() => {
            el.removeAttribute(name);
        }, 0);
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        setTimeout(() => {
            el.style.setProperty(prop, value);
        }, 0);
    }

    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        setTimeout(() => {
            el.insertBefore(child, before);
        }, 0);
    }

    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        setTimeout(() => {
            el.appendChild(child);
        }, 0);
    }

    callCallback (cb : Function) {
        setTimeout(cb, 0);
    }
}

export class NextFrameExecutor extends Executor {
    addClass (el : HTMLElement, cl : string) {
        if (el) {
            requestAnimationFrame(() => el.classList.add(cl));
        }
    }

    removeClass (el : HTMLElement, cl : string) {
        if (el) {
            requestAnimationFrame(() => el.classList.remove(cl));
        }
    }

    setAttribute (el : HTMLElement, name : string, value : string) {
        requestAnimationFrame(() => el.setAttribute(name, value));
    }

    removeAttribute (el : HTMLElement, name : string) {
        requestAnimationFrame(() => el.removeAttribute(name));
    }

    setStyle (el : HTMLElement, prop : string, value : string) {
        requestAnimationFrame(() => el.style.setProperty(prop, value));
    }

    insertBefore (el : HTMLElement, child : HTMLElement | Text | Comment, before : HTMLElement | Text | Comment) {
        requestAnimationFrame(() => {
            el.insertBefore(child, before);
        });
    }

    appendChild (el : HTMLElement, child : HTMLElement | Text | Comment) {
        requestAnimationFrame(() => {
            el.appendChild(child);
        });
    }

    callCallback (cb : Function) {
        requestAnimationFrame(cb);
    }
}

export class HybridExecutor extends InstantExecutor {
    setStyle (el : HTMLElement, prop : string, value : string) {
        requestAnimationFrame(() => el.style.setProperty(prop, value));
    }

    callCallback (cb : Function) {
        setTimeout(cb, 0);
    }
}
