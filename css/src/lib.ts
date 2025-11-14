let common: CSSStyleSheet | undefined;
let mobile: CSSStyleSheet | undefined;
let tablet: CSSStyleSheet | undefined;
let desktop: CSSStyleSheet | undefined;
let dark: CSSStyleSheet | undefined;
let light: CSSStyleSheet | undefined;
let mobileMaxWidth = 440;
let tabletMaxWidth = 880;
let laptopMaxWidth = 1320;

export function setMobileMaxWidth(value: number) {
    mobileMaxWidth = value;
}

export function setTabletMaxWidth(value: number) {
    tabletMaxWidth = value;
}

export function setLaptopMaxWidth(value: number) {
    laptopMaxWidth = value;
}

function createStyleSheet(media: string): CSSStyleSheet {
    const style = document.createElement("style");

    style.media = media;
    document.head.append(style);

    return style.sheet as CSSStyleSheet;
}

export function insertRule(target: number, rule: string) {
    let sheet: CSSStyleSheet | undefined;

    switch (target) {
        case 0:
            /* istanbul ignore else */
            if (!common) {
                common = createStyleSheet("");
            }
            sheet = common;
            break;

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
