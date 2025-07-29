export declare function setMobileMaxWidth(value: number): void;
export declare function setTabletMaxWidth(value: number): void;
export declare function setLaptopMaxWidth(value: number): void;

export declare function styleSheet<T extends {
    [className: string]: unknown;
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
