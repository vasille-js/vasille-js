let common: CSSStyleSheet | undefined;
let mobile: CSSStyleSheet | undefined;
let tablet: CSSStyleSheet | undefined;
let desktop: CSSStyleSheet | undefined;
let dark: CSSStyleSheet | undefined;
let light: CSSStyleSheet | undefined;
let mobileMaxWidth = 440;
let tabletMaxWidth = 880;
let laptopMaxWidth = 1320;
let index = Math.floor(Math.random() * 10);

export function setMobileMaxWidth(value: number) {
    mobileMaxWidth = value;
}

export function setTabletMaxWidth(value: number) {
    tabletMaxWidth = value;
}

export function setLaptopMaxWidth(value: number) {
    laptopMaxWidth = value;
}

export function setIndex(value: number) {
    index = value;
}

function createStyleSheet(media: string): CSSStyleSheet {
    const style = document.createElement("style");

    style.media = media;
    document.head.append(style);

    return style.sheet as CSSStyleSheet;
}

function insertRule(target: number, rule: string) {
    let sheet: CSSStyleSheet | undefined;

    switch (target) {
        case 1:
            /* istanbul ignore else */
            if (!mobile) {
                mobile = createStyleSheet(`(max-width:${mobileMaxWidth}px)`);
            }
            sheet = mobile;
            break;

        case 2:
            /* istanbul ignore else */
            if (!tablet) {
                tablet = createStyleSheet(`(min-width:${mobileMaxWidth}px) and (max-width:${tabletMaxWidth}px)`);
            }
            sheet = tablet;
            break;

        case 3:
            /* istanbul ignore else */
            if (!desktop) {
                desktop = createStyleSheet(`(min-width:${tabletMaxWidth}px) and (max-width:${laptopMaxWidth}px)`);
            }
            sheet = desktop;
            break;

        case 4:
            /* istanbul ignore else */
            if (!dark) {
                dark = createStyleSheet("(prefers-color-scheme:dark)");
            }
            sheet = dark;
            break;

        case 5:
            /* istanbul ignore else */
            if (!light) {
                light = createStyleSheet("(prefers-color-scheme:light)");
            }
            sheet = light;
            break;
    }

    /* istanbul ignore else */
    if (sheet) {
        sheet.insertRule(rule, sheet.cssRules.length);
    }
}

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
                        /* istanbul ignore else */
                        if (!common) {
                            common = createStyleSheet("");
                        }
                        common.insertRule(item.replace("{}", className), common.cssRules.length);
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
