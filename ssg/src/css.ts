import { Element, RawContentNode } from "./runner.js";

let mobileMaxWidth = 440;
let tabletMaxWidth = 880;
let laptopMaxWidth = 1320;
let index = 0;

const styles: { rules: string[]; media(): string }[] & { length: 6 } = [
    { rules: [], media: () => "" },
    { rules: [], media: () => `(max-width:${mobileMaxWidth}px)` },
    { rules: [], media: () => `(min-width:${mobileMaxWidth}px) and (max-width:${tabletMaxWidth}px)` },
    { rules: [], media: () => `(min-width:${tabletMaxWidth}px) and (max-width:${laptopMaxWidth}px)` },
    { rules: [], media: () => "(prefers-color-scheme:dark)" },
    { rules: [], media: () => "(prefers-color-scheme:light)" },
];

export function setMobileMaxWidth(value: number) {
    mobileMaxWidth = value;
}

export function setTabletMaxWidth(value: number) {
    tabletMaxWidth = value;
}

export function setLaptopMaxWidth(value: number) {
    laptopMaxWidth = value;
}

function insertRule(target: number, rule: string) {
    styles[target].rules.push(rule);
}

const sheets: [{ [k: string]: (string | [number, string])[] }, { [k: string]: string }][] = [];

function initStyleSheet(styles: { [k: string]: (string | [number, string])[] }, result: { [k: string]: string }) {
    for (const key in styles) {
        Object.defineProperty(result, key, {
            get() {
                const className = `vasille-static-${++index}`;

                for (const item of styles[key]) {
                    if (item instanceof Array) {
                        insertRule(item[0], item[1].replace("{}", className));
                    } else {
                        insertRule(0, item.replace("{}", className));
                    }
                }

                Object.defineProperty(result, key, {
                    value: className,
                    configurable: true,
                });

                return className;
            },
            configurable: true,
        });
    }
}

export function styleSheet(styles: { [k: string]: (string | [number, string])[] }): { [k: string]: string } {
    const result: { [k: string]: string } = {};

    sheets.push([styles, result]);
    initStyleSheet(styles, result);

    return result;
}

export function mountStyles(head: Element) {
    for (const item of styles) {
        if (item.rules.length > 0) {
            const media = item.media();
            const style = new Element("style", { a: { media: media ? media : undefined } });

            console.log("mount", style);
            style.appendChild(new RawContentNode(item.rules));
            head.appendChild(style);
            item.rules = [];
        }
    }

    // Reset all global states

    index = 0;

    for (const args of sheets) {
        initStyleSheet(...args);
    }
}
