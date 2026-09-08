import { CssStyleInjector } from "./index.js";

export class DevCssStyleInjector extends CssStyleInjector {
    protected key: string;

    public constructor(key: string, styles: (string | [number, string])[]) {
        super(styles);
        this.key = key;
    }

    protected generateClassName(): string {
        return `${super.generateClassName()}-${this.key}`;
    }
}

export function devStyleSheet<T extends { [k: string]: (string | [number, string])[] }>(
    styles: T,
): { [K in keyof T]: DevCssStyleInjector } {
    const result: { [k: string]: DevCssStyleInjector } = {};

    for (const key in styles) {
        result[key] = new DevCssStyleInjector(key, styles[key]);
    }

    return result as { [K in keyof T]: DevCssStyleInjector };
}
