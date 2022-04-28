import { IValue } from "../core/ivalue";
export declare function text(text: string | IValue<string>): void;
export declare function debug(text: IValue<string>): void;
export declare function predefine<T extends (...args: any) => any>(slot: T | null | undefined, predefined: T): T;
