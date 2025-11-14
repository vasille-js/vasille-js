import { DevExpression, BaseDevReference, DevReference } from "./state.js";

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

export interface InspectableReactive {
    id: number;
    inspector: Inspector;
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

export interface ProtocolPosition {
    id: number;
    declaration: Position;
}

export interface ProtocolReference extends ProtocolPosition {
    value: DevValue;
}

export interface ProtocolReferenceUpdate {
    id: number;
    value: DevValue;
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
    name: string;
    props: { [k: string]: number | DevValue };
    declaration?: Position | null;
    usage?: Position | null;
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
    attr?: { [k: string]: number | DevValue };
    class?: (number | string | { [k: string]: number | DevValue })[];
    style?: { [k: string]: number | string };
    events?: { [k: string]: number | DevValue };
    bind?: { [k: string]: number | DevValue };
    callback?: number | DevValue;
}

export interface ProtocolNode {
    id: number;
    text: number | DevValue;
}

export interface ProtocolComponentError {
    id: number;
    name: string;
    error: unknown;
}

export interface ProtocolSlotError {
    componentId: number;
    error: unknown;
    usage: Position;
}

export interface ProtocolModel {
    id: number;
    type: "array" | "set" | "map";
    values: [number | DevValue, number | DevValue][];
}

export interface ProtocolModelUpdate {
    id: number;
    method: string;
    args: (number | DevValue)[];
    return: number | DevValue;
}

export interface ProtocolStore extends ProtocolPosition {
    name: string;
}

export interface ProtocolCustomModel extends ProtocolPosition {
    usage: Position;
    name: string;
}

export interface Inspector {
    idToPosition(pos: ProtocolPosition): void;

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
    reportComponentError(error: ProtocolComponentError): void;
    reportComponentSlotError(error: ProtocolSlotError): void;

    // Models
    createModel(model: ProtocolModel): void;
    updateModel(update: ProtocolModelUpdate): void;
    createStore(store: ProtocolStore): void;
    createCustomModel(model: ProtocolCustomModel): void;

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
    internal?: DevValueInternal;
}

interface DevValueInternal {
    id: number;
    declaration: Position;
}

const DevValueInternalKey = Symbol("DevValueInternal");
const primitiveTypes: string[] = ["number", "string", "boolean"] as const;

export const devValues = new Map<number, object>();

export function registerDevValue(value: object, declaration: Position, inspector: Inspector) {
    if (!(DevValueInternalKey in value)) {
        const id = provideId();

        Object.defineProperty(value, DevValueInternalKey, {
            value: { id, declaration } satisfies DevValueInternal,
            writable: false,
        });
        inspector.reportReferenceError;
        devValues.set(id, value);
    }
}

export function toDevValue(value: unknown) {
    const type = typeof value;
    const data =
        value && (typeof value === "object" || typeof value === "function") && DevValueInternalKey in value
            ? (value[DevValueInternalKey] as DevValueInternal)
            : undefined;

    return {
        type: type,
        value: primitiveTypes.includes(type) || value === null ? JSON.stringify(value) : undefined,
        internal: data,
    } satisfies DevValue;
}

export function toDevId(value: unknown): number | undefined {
    if (value instanceof DevReference || value instanceof DevExpression) {
        return value.id;
    }

    const data =
        value && (typeof value === "object" || typeof value === "function") && DevValueInternalKey in value
            ? (value[DevValueInternalKey] as DevValueInternal)
            : null;

    if (data) {
        return data.id;
    }

    return undefined;
}

export function toDevIdOrValue(value: unknown): number | DevValue {
    return toDevId(value) ?? toDevValue(value);
}

export function toDevObject(value: object): { [k: string]: number | DevValue } {
    return Object.entries(value).reduce(
        (obj, [prop, value]) => {
            return {
                ...obj,
                [prop]: toDevIdOrValue(value),
            };
        },
        {} as { [k: string]: number | DevValue },
    );
}
