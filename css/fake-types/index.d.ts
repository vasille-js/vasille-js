import type { PropertiesHyphenFallback } from "csstype";

export declare function setMobileMaxWidth(value: number): void;
export declare function setTabletMaxWidth(value: number): void;
export declare function setLaptopMaxWidth(value: number): void;

type PropsSet = PropertiesHyphenFallback<number | number[], string> & {
    [k: `--${string}`]: string;
};
type PseudoSet = PropsSet & {
    [k: `:${string}`]: PropsSet;
};
type MediaSet = PseudoSet & {
    [k: `@${string}`]: PseudoSet;
};
export declare function webStyleSheet<T extends {
    [k: string]: MediaSet;
}>(styles: T): {
    [K in keyof T]: string;
};

// fake functions
export declare function theme<T>(name: string, value: T): T;
export declare function dark<T>($: T): T;
// rules with target
export declare function mobile<T>($: T): T;
export declare function tablet<T>($: T): T;
export declare function laptop<T>($: T): T;
export declare function prefersDark<T>($: T): T;
export declare function prefersLight<T>($: T): T;

export {};
