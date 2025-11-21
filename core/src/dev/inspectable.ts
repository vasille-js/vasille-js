import { IRunner } from "../node/runner.js";
import { DevExpression, DevReference } from "./state.js";

export type StaticPosition = [string, number, number, number, number];
export type ExecutionPosition = number;

let positionId: number = 1;

export function executionPosition(
    runner: IDevRunner<unknown, unknown, object>,
    pathLineAndChar: StaticPosition,
    error: Error,
): ExecutionPosition {
    const id = positionId++;

    runner.inspector.registerExecutionPosition({
        id: id,
        position: pathLineAndChar,
        stack:
            error.stack
                ?.split("\n")
                .slice(1)
                .map(line => line.trim()) ?? [],
    });

    return id;
}

export interface Inspectable {
    id: number;
}

export interface InspectableReactive {
    id: number;
}

export interface InspectableReference<T> extends Inspectable {
    declaration?: StaticPosition;
    update(value: T, position?: ExecutionPosition): void;
}

export interface Dependency extends Inspectable {
    code: string;
    value: DevValue;
}

export interface ProtocolPosition {
    id: number;
    declaration: StaticPosition;
}

export interface ProtocolReference extends ProtocolPosition {
    value: DevValue;
}

export interface ProtocolReferenceUpdate {
    id: number;
    value: DevValue;
    position?: ExecutionPosition;
}

export interface ProtocolReferenceError {
    id: number;
    error: unknown;
    handler: DevValue;
    position?: ExecutionPosition;
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
    declaration?: StaticPosition | null;
    usage?: StaticPosition | null;
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
    usage: StaticPosition | undefined;
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
    usage: StaticPosition;
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
    usage: StaticPosition;
    name: string;
}

export interface ProtocolRouterTargetResult {
    url: string;
    path: string;
    query: { [k: string]: string[] };
    hash: string;
    targetFound: boolean;
    params: object;
}

export interface ProtocolExecutionPosition {
    id: number;
    position: StaticPosition;
    stack: string[];
}

export interface ProtocolDevValue {
    id: number;
    pos: StaticPosition;
}

export interface ProtocolRoutes {
    paths: string[];
}

export interface ProtocolRouterStateChange {
    name: string;
    value: string | null | undefined;
}

export interface ProtocolRouterActionCall {
    name: string;
    path: string;
}

export interface Inspector {
    registerExecutionPosition(pos: ProtocolExecutionPosition): void;
    registerDevValue(value: ProtocolDevValue): void;
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

    // routes
    registeredRoutes(routes: ProtocolRoutes): void;
    routerStateChange(change: ProtocolRouterStateChange): void;
    routerActionCall(call: ProtocolRouterActionCall): void;
    routerTargetResult(data: ProtocolRouterTargetResult): void;

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
    id?: number;
}

interface DevValueInternal {
    id: number;
}

const DevValueInternalKey = Symbol("DevValueInternal");
const primitiveTypes: string[] = ["number", "string", "boolean"] as const;

export const devValues = new Map<number, object>();

export function registerReference<T>(
    value: DevReference<T>,
    declaration: StaticPosition,
    inspector: Inspector,
): DevReference<T> {
    inspector.newReference({
        id: value.id,
        value: toDevValue(value.V),
        declaration: declaration,
    });

    return value;
}

export function registerDevValue<T extends object>(value: T, declaration: StaticPosition, inspector: Inspector): T {
    if (!(DevValueInternalKey in value)) {
        const id = provideId();

        Object.defineProperty(value, DevValueInternalKey, {
            value: { id } satisfies DevValueInternal,
            writable: false,
        });
        inspector.registerDevValue({ id, pos: declaration });
        devValues.set(id, value);
    }

    return value;
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
        id: data?.id,
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

export interface IDevRunner<Node, Element, TagOptions extends object> extends IRunner<Node, Element, TagOptions> {
    inspector: Inspector;
}
