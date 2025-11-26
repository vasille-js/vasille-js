import { insertRule } from "./lib.js";

export { setMobileMaxWidth, setTabletMaxWidth, setLaptopMaxWidth } from "./lib.js";

let index = 1;

/**
 * Inserts stylesheet to document
 * @param styles CSS styles based on classes
 */
export function styleSheet<T extends { [k: string]: (string | [number, string])[] }>(
    styles: T,
): { [K in keyof T]: string } {
    const result: { [k: string]: string } = {};

    for (const key in styles) {
        Object.defineProperty(result, key, {
            get() {
                const className = `vasille-${++index}`;

                for (const item of styles[key]) {
                    if (item instanceof Array) {
                        const [target, rule] = item;

                        insertRule(target, rule.replace("{}", className));
                    } else {
                        insertRule(0, item.replace("{}", className));
                    }
                }

                styles[key].splice(0);
                Object.defineProperty(result, key, { value: className });

                return className;
            },
            configurable: true,
        });
    }

    return result as { [K in keyof T]: string };
}
