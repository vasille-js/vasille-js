import { type } from "node:os";

export interface Position {
    name: string;
    path: string;
    line: number;
    char: number;
}

export interface Inspectable {
    id: number;
}

export interface InspectableReactive extends Inspectable {
    declaration: Position;
    usage: Position;
    props: { [k in string]: Position };
}

export interface InspectableReference<T> extends Inspectable {
    declaration?: Position;
    inspector: Inspector;
    update(value: T, position: Position): void;
}

export interface Dependency extends Inspectable {
    code: string;
    value: DevValue;
}

export interface Inspector {
    newReference(id: number, value: unknown, declaration: Position): void;
    updateReference(id: number, value: unknown, position: Position): void;
    raportReferenceError(id: number, error: unknown, handler: DevValue, position: Position): void;
    deleteReference(id: number): void;
    newExpression(id: number, value: unknown, deps: (Dependency | string)[], declaration: Position): void;
    updateExpression(id: number, value: unknown, deps: DevValue[], position: Position): void;
    manualUpdateExpression(id: number, value: unknown, position: Position): void;
    raportExpressionSyncError(id: number, error: unknown, handler: DevValue, position: Position): void;
    raportExpressionCalculationError(id: number, deps: DevValue[], error: unknown, handler: DevValue, position: Position): void;
    deleteExpression(id: number): void;
    linkDependency(dependant: number, dependency: number): void;
    unlinkDependency(dependant: number, dependency: number): void;
}

let id = 0;

export function provideId() {
    return id++;
}

export interface DevValue {
    type: string;
    value?: string | undefined;
    position?: Position;
}

interface DevValueInternal {
    id: number;
    declaration: Position;
}

const DevValueInternalKey = Symbol("DevValueInternal");
const primitiveTypes: string[] = ["number", "string", "boolean"] as const;

export const devValues = new Map<number, object>();

export function registerDevValue(value: object, declaration: Position) {
    if (!(DevValueInternalKey in value)) {
        const id = provideId();

        Object.defineProperty(value, DevValueInternalKey, {
            value: { id, declaration } satisfies DevValueInternal,
            writable: false,
        });
        devValues.set(id, value);
    }
}

export function toDevValue(value: unknown) {
    const type = typeof value;
    const data =
        value && (typeof value === "object" || typeof value === "function") && DevValueInternalKey in value
            ? (value[DevValueInternalKey] as DevValueInternal)
            : null;

    return {
        type: type,
        value: primitiveTypes.includes(type) || value === null ? JSON.stringify(value) : undefined,
        position: data?.declaration,
    } satisfies DevValue;
}
