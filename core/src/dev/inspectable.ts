import { IRunner } from "../node/runner.js";
import { DevExpression, DevReference } from "./state.js";

export type StaticPosition = [string, number, number, number, number];
export type ExecutionPosition = number;

let positionId: number = 1;

function getErrorStack(error: Error) {
    return (
        error.stack
            ?.split("\n")
            .slice(1)
            .map(line => line.trim()) ?? []
    );
}

export function executionPosition(
    inspector: Inspector,
    pathLineAndChar: StaticPosition,
    error: Error,
): ExecutionPosition {
    const id = positionId++;

    inspector.registerExecutionPosition({
        id: id,
        position: pathLineAndChar,
        stack: getErrorStack(error),
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
    time: number;
}

export interface ProtocolReferenceUpdate {
    id: number;
    time: number;
    value: DevValue;
    position?: ExecutionPosition;
}

export interface ProtocolError {
    targetId: number;
    time: number;
    error: string;
}

export interface ProtocolReferenceError extends ProtocolError {
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
    time: number;
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
    time: number;
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
    time: number;
    text: number | DevValue;
    position: StaticPosition;
}

export interface ProtocolSlotError extends ProtocolError {
    usage: StaticPosition;
}

export interface ProtocolComposeTime {
    id: number;
    time: number;
}

export interface ProtocolModel {
    id: number;
    type: "array" | "set" | "map";
    values: [number | DevValue, number | DevValue][];
    usage: StaticPosition;
}

export interface ProtocolModelUpdate {
    id: number;
    method: string;
    args: (number | DevValue)[];
    return: number | DevValue;
}

export interface ProtocolStore extends ProtocolPosition {
    name: string;
    time: number;
}

export interface ProtocolCustomModel extends ProtocolPosition {
    time: number;
    usage: StaticPosition;
    name: string;
}

export interface ProtocolRouterTargetResult {
    time: number;
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
    time: number;
    paths: string[];
}

export interface ProtocolRouterStateChange {
    time: number;
    name: string;
    value: string | null | undefined;
}

export interface ProtocolRouterActionCall {
    time: number;
    name: string;
    path: string;
}

export interface ProtocolFunctionCall {
    position: StaticPosition;
    id: number;
    args: DevValue[];
    time: number;
}

export interface ProtocolEventTrigger {
    tagId: number;
    eventName: string;
    time: number;
}

export interface ProtocolFunctionResult {
    id: number;
    result: DevValue;
    async: boolean;
    time: number;
}

export interface ProtocolFunctionError extends ProtocolError {
    async: boolean;
}

export interface Inspector {
    registerExecutionPosition(pos: ProtocolExecutionPosition): void;
    reportError(err: ProtocolError): void;

    // Reference
    newReference(ref: ProtocolReference): void;
    updateReference(update: ProtocolReferenceUpdate): void;
    reportReferenceError(error: ProtocolReferenceError): void;

    // Expression
    newExpression(expr: ProtocolExpression): void;
    updateExpression(update: ProtocolExpressionUpdate): void;
    reportExpressionCalculationError(error: ProtocolExpressionError): void;

    // Components
    createComponent(comp: ProtocolComponent): void;
    createTag(tag: ProtocolTag): void;
    createNode(node: ProtocolNode): void;
    addContextState(state: ProtocolState): void;
    setElementParent(parent: ProtocolParent): void;
    reportComponentError(error: ProtocolError): void;
    reportComponentSlotError(error: ProtocolSlotError): void;
    composeTime(time: ProtocolComposeTime): void;

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

    // function
    functionCall(call: ProtocolFunctionCall): void;
    functionReturn(result: ProtocolFunctionResult): void;
    functionThrows(error: ProtocolFunctionError): void;
    eventTrigger(call: ProtocolEventTrigger): void;

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

const primitiveTypes: string[] = ["number", "string", "boolean"] as const;

export function registerReference<T>(
    value: DevReference<T>,
    declaration: StaticPosition,
    inspector: Inspector,
): DevReference<T> {
    inspector.newReference({
        id: value.id,
        value: toDevValue(value.V),
        declaration: declaration,
        time: Date.now(),
    });

    return value;
}

let executionId = 0;

export function wrapFn<Args extends unknown[], Result extends object>(
    fn: (...args: Args) => Result,
    declaration: StaticPosition,
    inspector: Inspector,
): (...args: Args) => Result {
    return (...args: Args) => {
        return runFn(fn, args, declaration, inspector);
    };
}

export function runFn<Args extends unknown[], Result extends object>(
    fn: (...args: Args) => Result,
    args: Args,
    declaration: StaticPosition,
    inspector: Inspector,
): Result {
    const id = ++executionId;

    inspector.functionCall({
        id: id,
        position: declaration,
        args: args.map(toDevValue),
        time: Date.now(),
    });

    try {
        let result: Result = fn(...args);

        if (result instanceof Promise) {
            return new Promise<Awaited<Result>>((resolve, reject) => {
                result.then(result => {
                    inspector.functionReturn({
                        id: id,
                        result: toDevValue(result),
                        async: true,
                        time: Date.now(),
                    });
                    resolve(result);
                });
                result.catch(e => {
                    inspector.functionThrows({
                        targetId: id,
                        error: e instanceof Error ? (e.stack ?? e.message) : `${e}`,
                        async: false,
                        time: Date.now(),
                    });
                    reject(e);
                });
            }) as unknown as Result;
        } else {
            inspector.functionReturn({
                id: id,
                result: toDevValue(result),
                async: false,
                time: Date.now(),
            });

            return result;
        }
    } catch (e) {
        inspector.functionThrows({
            targetId: id,
            error: e instanceof Error ? (e.stack ?? e.message) : `${e}`,
            async: false,
            time: Date.now(),
        });
        throw e;
    }
}

export function toDevValue(value: unknown) {
    const type = typeof value;

    return {
        type: type,
        value: primitiveTypes.includes(type) || value === null ? JSON.stringify(value) : undefined,
    } satisfies DevValue;
}

export function toDevId(value: unknown): number | undefined {
    if (value instanceof DevReference || value instanceof DevExpression) {
        return value.id;
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
