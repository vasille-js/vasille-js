import { App, Fragment, Reference } from "vasille";
import { match, ref, set } from "vasille-jsx";
import { Runner, TagOptions } from "vasille/web-runner";

const any = 0;
const string = 1;
const number = 2;
const boolean = 3;

interface PropsDeclaration {
    [key: string]: typeof string | typeof number | typeof boolean | typeof any;
}

class ShadowFragment extends Fragment<Node, Element, TagOptions> {
    protected shadowApp: App<Node, Element, TagOptions>;

    public constructor(shadowApp: App<Node, Element, TagOptions>, parent?: Fragment<Node, Element, TagOptions>) {
        const parentNode = parent ?? shadowApp;

        super(parentNode.runner);
        this.shadowApp = shadowApp;
        this.parent = parentNode;
    }

    public appendNode(node: Node) {
        this.shadowApp.appendNode(node);
    }
}

function toKebabCase(propName: string) {
    let index = propName[0] === "$" ? 1 : 0;
    let name = propName[index].toLowerCase();

    for (index++; index < propName.length; index++) {
        const curr = propName[index];

        if (curr === curr.toUpperCase()) {
            name += "-";
        }

        name += curr.toLowerCase();
    }

    return name;
}

function readRef(ref: unknown) {
    if (ref instanceof Reference) {
        return ref.V;
    }

    return ref;
}

function matchAndSet(o: object, key: string, value: unknown) {
    if (key[0] === "$") {
        if (value instanceof Reference) {
            o[key] = value;
        } else {
            o[key].V = value;
        }
    } else {
        o[key] = readRef(value);
    }
}

export function shadow(
    renderer: (node: Fragment<Node, Element, TagOptions>, input: object) => void,
    name: string,
    props: PropsDeclaration,
): void {
    const observableAttributes: string[] = [];
    const attributesNamesMap = new Map<string, string>();

    for (const key in props) {
        if (props[key]) {
            const attributeName = toKebabCase(key);
            observableAttributes.push(attributeName);
            attributesNamesMap.set(attributeName, key);
        }
    }

    customElements.define(
        name,
        class extends HTMLElement {
            static observedAttributes = observableAttributes;

            protected props: { [k: string]: unknown };
            protected events: { [k: string]: unknown };
            protected root: App<Node, Element, TagOptions>;
            protected $vasille?: Fragment<Node, Element, TagOptions>;

            public constructor() {
                super();

                const entityProps = (this.props = {});
                const entityEvents = (this.events = {});

                for (const key in props) {
                    const isEvent = key.startsWith("on");
                    const isReactive = key[0] === "$";
                    const container = isEvent ? entityEvents : entityProps;

                    Object.defineProperty(this, isReactive ? key.slice(1) : key, {
                        get: () => readRef(container[key]),
                        set: (value: unknown) => matchAndSet(container, key, value),
                    });

                    if (isReactive) {
                        entityProps[key] = ref(void 0);
                    }
                    if (isEvent) {
                        const kebab = toKebabCase(key);
                        const eventName = kebab[2] === "-" ? kebab.slice(3) : kebab.slice(2);

                        entityProps[key] = (...args: unknown[]) => {
                            this.dispatchEvent(new CustomEvent(eventName, { detail: args[0] }));
                            return entityEvents[key]?.(...args);
                        };
                    }
                }

                this.root = new App<Node, Element, TagOptions>(
                    this.attachShadow({ mode: "open" }) as unknown as Element,
                    new Runner(document),
                );
            }

            public connectedCallback() {
                renderer(new ShadowFragment(this.root, this.$vasille), this.props);
            }

            public disconnectedCallback() {
                this.root.destroy();
            }

            public attributeChangedCallback(name: string, oldValue: string, newValue: string | null) {
                const propName = attributesNamesMap.get(name);
                /* istanbul ignore else */
                if (propName) {
                    const type = props[propName];

                    switch (type) {
                        case string: {
                            matchAndSet(this.props, propName, newValue);
                            break;
                        }
                        case number: {
                            matchAndSet(this.props, propName, newValue ? parseFloat(newValue) : 0);
                            break;
                        }
                        case boolean: {
                            matchAndSet(this.props, propName, newValue !== null);
                            break;
                        }
                    }
                }
            }
        },
    );
}
