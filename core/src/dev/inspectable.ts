import { DevExpression, DevReference } from "./state.js";

export type StaticPosition = [string, number, number, number, number];
export type ExecutionPosition = number;

let positionId: number = 1;

export function executionPosition(pathLineAndChar: StaticPosition, error: Error): ExecutionPosition {
    const id = positionId++;

    inspector.registerExecutionPosition({
        id: id,
        position: pathLineAndChar,
        stack: error.stack ?? "",
    });

    return id;
}

export function errorToString(e: unknown) {
    return e instanceof Error
        ? `${e.name}:${e.message}\n${e.stack}`
        : `${e && typeof e === "object" ? e.constructor.name : typeof e}:${e}`;
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
    events?: { [k: string]: DevValue };
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
    usage: StaticPosition;
    time: number;
}

export interface ProtocolModelItem {
    model: number;
    key?: DevValue;
    value: DevValue;
}

export interface ProtocolModelUpdate {
    id: number;
    method: string;
    args: DevValue[];
    return: DevValue;
}

export interface ProtocolStore extends ProtocolPosition {
    name: string;
    time: number;
}

export interface ProtocolCustomModel extends ProtocolPosition {
    time: number;
    usage: StaticPosition;
    name: string;
    props: { [k: string]: number | DevValue };
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
    stack: string;
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
    target: number;
    eventName: string;
    time: number;
    position?: StaticPosition;
    result?: {
        value?: DevValue;
        error?: string;
    };
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

export interface ProtocolObject {
    id: number;
    constructor: string;
    position?: StaticPosition;
    time: number;
}

export interface ProtocolObjectProperty {
    id: number;
    name: string;
    value: DevValue;
    time: number;
}

export interface ProtocolObjectUpdate {
    id: number;
    time: number;
}

export interface DestroyData {
    id: number;
    time: number;
}

export interface EraseData {
    position: StaticPosition;
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
    createModelItem(item: ProtocolModelItem): void;
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

    // objects
    newObject(obj: ProtocolObject): void;
    updateObject(update: ProtocolObjectUpdate): void;
    objectProperty(prop: ProtocolObjectProperty): void;

    // any
    destroy(data: DestroyData): void;
    erase(data: EraseData): void;
}

export abstract class AbstractInspector implements Inspector {
    createModelItem(item: ProtocolModelItem): void {
        this.send(this.createModelItem.name, item);
    }
    newObject(obj: ProtocolObject): void {
        this.send(this.newObject.name, obj);
    }
    updateObject(update: ProtocolObjectUpdate): void {
        this.send(this.updateObject.name, update);
    }
    objectProperty(prop: ProtocolObjectProperty): void {
        this.send(this.objectProperty.name, prop);
    }
    public addContextState(state: ProtocolState): void {
        this.send(this.addContextState.name, state);
    }

    public composeTime(time: ProtocolComposeTime): void {
        this.send(this.composeTime.name, time);
    }

    public createComponent(comp: ProtocolComponent): void {
        this.send(this.createComponent.name, comp);
    }

    public createCustomModel(model: ProtocolCustomModel): void {
        this.send(this.createCustomModel.name, model);
    }

    public createModel(model: ProtocolModel): void {
        this.send(this.createModel.name, model);
    }

    public createNode(node: ProtocolNode): void {
        this.send(this.createNode.name, node);
    }

    public createStore(store: ProtocolStore): void {
        this.send(this.createStore.name, store);
    }

    public createTag(tag: ProtocolTag): void {
        this.send(this.createTag.name, tag);
    }

    public destroy(data: DestroyData): void {
        this.send(this.destroy.name, data);
    }

    public erase(data: EraseData) {
        this.send(this.erase.name, data);
    }

    public eventTrigger(call: ProtocolEventTrigger) {
        this.send(this.eventTrigger.name, call);
    }

    public functionCall(call: ProtocolFunctionCall): void {
        this.send(this.functionCall.name, call);
    }

    public functionReturn(result: ProtocolFunctionResult): void {
        this.send(this.functionReturn.name, result);
    }

    public functionThrows(error: ProtocolFunctionError): void {
        this.send(this.functionThrows.name, error);
    }

    public newExpression(expr: ProtocolExpression): void {
        this.send(this.newExpression.name, expr);
    }

    public newReference(ref: ProtocolReference): void {
        this.send(this.newReference.name, ref);
    }

    public registerExecutionPosition(pos: ProtocolExecutionPosition): void {
        this.send(this.registerExecutionPosition.name, pos);
    }

    public registeredRoutes(routes: ProtocolRoutes): void {
        this.send(this.registeredRoutes.name, routes);
    }

    public reportComponentError(error: ProtocolError): void {
        this.send(this.reportComponentError.name, error);
    }

    public reportComponentSlotError(error: ProtocolSlotError): void {
        this.send(this.reportComponentSlotError.name, error);
    }

    public reportError(err: ProtocolError) {
        this.send(this.reportError.name, err);
    }

    public reportExpressionCalculationError(error: ProtocolExpressionError): void {
        this.send(this.reportExpressionCalculationError.name, error);
    }

    public reportReferenceError(error: ProtocolReferenceError): void {
        this.send(this.reportReferenceError.name, error);
    }

    public routerActionCall(call: ProtocolRouterActionCall): void {
        this.send(this.routerActionCall.name, call);
    }

    public routerStateChange(change: ProtocolRouterStateChange): void {
        this.send(this.routerStateChange.name, change);
    }

    public routerTargetResult(data: ProtocolRouterTargetResult): void {
        this.send(this.routerTargetResult.name, data);
    }

    public setElementParent(parent: ProtocolParent): void {
        this.send(this.setElementParent.name, parent);
    }

    public updateExpression(update: ProtocolExpressionUpdate): void {
        this.send(this.updateExpression.name, update);
    }

    public updateModel(update: ProtocolModelUpdate): void {
        this.send(this.updateModel.name, update);
    }

    public updateReference(update: ProtocolReferenceUpdate): void {
        this.send(this.updateReference.name, update);
    }

    protected abstract send(name: string, data: object): void;
}

export class EarlyInspector extends AbstractInspector {
    protected inspector: Inspector | undefined;
    protected queue: [string, object][] = [];

    public connect(inspector: Inspector) {
        this.inspector = inspector;

        for (const item of this.queue) {
            inspector[item[0]](item[1]);
        }
        this.queue = [];
    }

    protected send(name: string, data: object) {
        if (this.inspector) {
            this.inspector[name](data);
        } else {
            this.queue.push([name, data]);
        }
    }
}

export const inspector = new EarlyInspector();

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

export function registerReference<T>(value: DevReference<T>, declaration: StaticPosition): DevReference<T> {
    inspector.newReference({
        id: value.id,
        value: toDevValue(value.V),
        declaration: declaration,
        time: Date.now(),
    });

    return value;
}

const positionKey = Symbol("vasille-position");
const objectKey = Symbol("vasille-object");
let executionId = 0;

export function setupPosition<T extends object>(obj: T, declaration: StaticPosition): T {
    Object.defineProperty(obj, positionKey, {
        value: declaration,
        enumerable: false,
        configurable: false,
        writable: false,
    });
    return obj;
}

export function getPosition(obj: object): StaticPosition | undefined {
    return obj[positionKey] as StaticPosition | undefined;
}

export function wrapFn<Args extends unknown[], Result extends object>(
    fn: (...args: Args) => Result,
    declaration: StaticPosition,
): (...args: Args) => Result {
    return setupPosition((...args: Args) => {
        return runFn(fn, args, declaration);
    }, declaration);
}

export function runFn<Args extends unknown[], Result extends object>(
    fn: (...args: Args) => Result,
    args: Args,
    declaration: StaticPosition,
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
                        error: errorToString(e),
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
            error: errorToString(e),
            async: false,
            time: Date.now(),
        });
        throw e;
    }
}

interface ObjectMetaData {
    id: number;
    fields: { [k: string]: unknown };
}

let objectId = 0;

export function processObject(obj: object, pos?: StaticPosition): number {
    const time = Date.now();

    if (objectKey in obj) {
        const changes: [key: string, value: DevValue][] = [];
        const meta = obj[objectKey] as ObjectMetaData;
        const fields = meta.fields;

        for (const [key, value] of Object.entries(obj)) {
            if (obj[key] !== fields[key]) {
                changes.push([key, toDevValue(value)]);
            }
        }

        if (changes.length > 0) {
            inspector.updateObject({
                id: meta.id,
                time: time,
            });
            changes.forEach(change => {
                inspector.objectProperty({
                    id: meta.id,
                    name: change[0],
                    value: change[1],
                    time: time,
                });
            });
        }
        return meta.id;
    } else {
        const id = ++objectId;
        const fields: { [k: string]: unknown } = {};

        inspector.newObject({
            id: id,
            constructor: obj.constructor.name,
            time: time,
            position: pos,
        });

        for (const [key, value] of Object.entries(obj)) {
            fields[key] = value;
            inspector.objectProperty({
                id: id,
                name: key,
                value: toDevValue(value),
                time: time,
            });
        }

        Object.defineProperty(obj, objectKey, {
            value: {
                id: id,
                fields: fields,
            },
            enumerable: false,
            configurable: false,
            writable: false,
        });

        return id;
    }
}

export function wrapObject<T extends object>(v: T, declaration: StaticPosition): T {
    processObject(v, declaration);
    return v;
}

export function toDevValue(value: unknown) {
    const type = typeof value;

    return {
        type: type,
        value:
            primitiveTypes.includes(type) || value === null
                ? JSON.stringify(value)
                : type === "object"
                  ? `${processObject(value as object)}`
                  : type === "function"
                    ? JSON.stringify(getPosition(value as Function))
                    : undefined,
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
