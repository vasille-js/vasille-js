import { insertRule } from "./lib.js";

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "./lib.js";

let index = 1;

export class CssStyleInjector {
    protected className: string | null = null;
    protected styles: (string | [number, string])[];

    public constructor(styles: (string | [number, string])[]) {
        this.styles = styles;
    }

    public inject(): string {
        if (this.className) {
            return this.className;
        }

        const className = this.generateClassName();

        for (const item of this.styles) {
            if (item instanceof Array) {
                const [target, rule] = item;

                insertRule(target, rule.replace("{}", className));
            } else {
                insertRule(0, item.replace("{}", className));
            }
        }

        this.styles.splice(0);

        return (this.className = className);
    }

    protected generateClassName(): string {
        return `vasille-${++index}`;
    }
}

/**
 * Inserts stylesheet to document
 * @param styles CSS styles based on classes
 */
export function styleSheet<T extends { [k: string]: (string | [number, string])[] }>(
    styles: T,
): { [K in keyof T]: CssStyleInjector } {
    const result: { [k: string]: CssStyleInjector } = {};

    for (const key in styles) {
        result[key] = new CssStyleInjector(styles[key]);
    }

    return result as { [K in keyof T]: CssStyleInjector };
}
