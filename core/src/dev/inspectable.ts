import { DevExpression, BaseDevReference } from "./state.js";

export interface Position {
    pathLineAndChar: string;
    error?: Error;
}

export function declarationPosition(pathLineAndChar: string) {
    return { pathLineAndChar };
}

export function usagePosition(pathLineAndChar: string, error: Error): Position {
    return { error, pathLineAndChar };
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

export interface ProtocolReference {
    id: number;
    value: unknown;
    declaration: Position;
}

export interface ProtocolReferenceUpdate {
    id: number;
    value: unknown;
    position: Position;
}

export interface ProtocolReferenceError {
    id: number;
    error: unknown;
    handler: DevValue;
    position: Position;
}

export interface ProtocolExpression extends ProtocolReference {
    deps: (Dependency | string)[];
    isWatch: boolean;
}

export interface ProtocolExpressionUpdate extends ProtocolReferenceUpdate {
    deps: DevValue[];
}

export interface ProtocolExpressionError extends ProtocolReferenceError {
    deps: DevValue[];
}

export interface ProtocolDependency {
    dependant: number;
    dependency: number;
}

export interface ProtocolComponent {
    id: number;
    declaration: Position;
    name: string;
    usage: Position;
    props: { [k: string]: number|DevValue };
}

export interface ProtocolState {
    id: number;
    name: string;
    stateId: number;
}

export interface ProtocolParent {
    child: number;
    parent: number;
}

export interface ProtocolTag {
    id: number;
    position: Position;
    tagName: string;
    attr: { [k: string]: number | DevValue };
    class: (number | string | { [k: string]: number })[];
    style: { [k: string]: number | string };
    events: { [k: string]: number };
    bind: { [k: string]: number | DevValue };
    callback?: number;
}

export interface ProtocolNode {
    id: number;
    text: number | DevValue;
    type: "comment" | "text";
}

export interface Inspector {
    // Reference
    newReference(ref: ProtocolReference): void;
    updateReference(update: ProtocolReferenceUpdate): void;
    reportReferenceError(error: ProtocolReferenceError): void;

    // Expression
    newExpression(expr: ProtocolExpression): void;
    updateExpression(update: ProtocolExpressionUpdate): void;
    linkDependency(dep: ProtocolDependency): void;
    unlinkDependency(dep: ProtocolDependency): void;
    reportExpressionSyncError(error: ProtocolReferenceError): void;
    reportExpressionCalculationError(error: ProtocolExpressionError): void;

    // Components
    createComponent(comp: ProtocolComponent): void;
    createTag(tag: ProtocolTag): void;
    createNode(node: ProtocolNode): void;
    addContextState(state: ProtocolState): void;
    setElementParent(parent: ProtocolParent): void;

    // any
    destroy(id: number): void;
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
