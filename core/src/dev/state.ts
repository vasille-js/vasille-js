import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import { Reference } from "../value/reference.js";
import {
    Dependency,
    Inspectable,
    InspectableReference,
    Inspector,
    Position,
    provideId,
    toDevValue,
} from "./inspectable.js";

export type KindOfDevIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]> | DevIValue<T[K]> | undefined;
};

export abstract class DevIValue<T> extends IValue<T> {
    public abstract update(value: T, position: Position): void;
}

export class BaseDevReference<T> extends DevIValue<T> {

    protected state: T;
    protected readonly onChange: Set<(value: T, position: Position) => void>;

    public constructor(value: T) {
        super();
        this.state = value;
        this.onChange = new Set();
    }

    public get V(): T {
        return this.state;
    }

    public set V(v: T) {
        void v;
        throw new Error("Production API access detected");
    }

    public update(value: T, position: Position) {
        if (this.state !== value) {
            this.state = value;

            this.shareUpdate(position);
            this.onChange.forEach(handler => {
                try {
                    handler(value, position);
                } catch (e) {
                    this.shareError(e, handler, position);
                    reportError(e);
                }
            });
        }
    }

    public on(handler: (value: T, position: Position) => void): void {
        this.onChange.add(handler);
    }

    public off(handler: (value: T, position: Position) => void): void {
        this.onChange.delete(handler);
    }

    protected shareUpdate(position: Position) {
        void position;
    }

    protected shareError(error: unknown, handler: unknown, position: Position) {
        void error;
        void handler;
        void position;
    }
}

export class DevReference<T> extends BaseDevReference<T> implements InspectableReference<T>, Destroyable {
    public readonly id: number;
    public readonly inspector: Inspector;

    public constructor(value: T, declaration: Position, inspector: Inspector) {
        super(value);

        this.id = provideId();
        this.inspector = inspector;

        inspector.newReference({
            id: this.id,
            declaration: declaration,
            value: this.state,
        });
    }

    public destroy(): void {
        this.shareDestroy();
    }

    protected shareCreated() {
    }

    protected shareUpdate(position: Position) {
        this.inspector.updateReference({
            id: this.id,
            position: position,
            value: this.state
        });
    }

    protected shareError(error: unknown, handler: unknown, position: Position) {
        this.inspector.reportReferenceError({
            handler: toDevValue(handler),
            id: this.id,
            error: error,
            position: position,
        });
    }

    protected shareDestroy() {
        this.inspector.destroy(this.id);
    }
}

export class ExpressionDevReference<T> extends BaseDevReference<T> implements InspectableReference<T> {
    public readonly id: number;
    public readonly inspector: Inspector;

    public constructor(id: number, value: T, inspector: Inspector) {
        super(value);

        this.id = id;
        this.inspector = inspector;
    }

    protected shareError(error: unknown, handler: unknown, position: Position) {
        this.inspector.reportReferenceError({
            handler: toDevValue(handler),
            id: this.id,
            error: error,
            position: position,
        });
    }
}

export class DevExpression<T, Args extends unknown[]> extends IValue<T> implements Destroyable, InspectableReference<T> {
    public readonly id: number;
    public readonly declaration: Position;
    public readonly inspector: Inspector;

    private values: KindOfDevIValue<Args>;
    private readonly valuesCache: Args;
    private linkedFunc: Array<() => void> = [];
    private sync: ExpressionDevReference<T>;

    public constructor(
        func: (...args: Args) => T,
        values: KindOfDevIValue<Args>,
        ctx: Reactive | undefined,
        depsCode: string[],
        declaration: Position,
        inspector: Inspector,
        isWatch: boolean,
    ) {
        super();

        const id = provideId();
        const handler = (i: number, value: unknown, position: Position) => {
            try {
                this.valuesCache[i] = value;

                const newValue = func.apply(this, this.valuesCache);

                if (this.sync.V !== newValue || isWatch) {
                    this.sync.update(newValue, position);
                    inspector.updateExpression({
                        id: id,
                        position: position,
                        value: newValue,
                        deps: this.valuesCache.map(toDevValue),
                    });
                }
            } catch (e) {
                inspector.reportExpressionCalculationError({
                    id: id,
                    error: e,
                    handler: toDevValue(func),
                    position: position,
                    deps: this.valuesCache.map(toDevValue), 
                });
                reportError(e);
            }
        };

        this.valuesCache = values.map(item => item?.V) as Args;

        this.sync = new ExpressionDevReference(id, func.apply(this, this.valuesCache), inspector);
        this.id = id;
        this.declaration = declaration;
        this.inspector = inspector;

        let i = 0;
        values.forEach(value => {
            const updater = handler.bind(this, Number(i++));

            this.linkedFunc.push(updater);
            value?.on(updater);
        });

        this.values = values;
        ctx?.bind(this);

        inspector.newExpression({
            id: this.id,
            declaration: this.declaration,
            isWatch: isWatch,
            value: this.sync.V,
            deps: values.map((dep, index) => {
                if (dep instanceof DevReference || dep instanceof DevExpression) {
                    return {
                        code: depsCode[index],
                        id: dep.id,
                        value: toDevValue(dep.V),
                    } satisfies Dependency;
                }

                return depsCode[index];
            })
        })
    }

    public update(value: T, position: Position): void {
        this.sync.update(value, position);
    }

    public get V(): T {
        return this.sync.V;
    }

    public set V(v: T) {
        void v;
        throw new Error("Production API access detected");
    }

    public on(handler: (value: T, position: Position) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: T, position: Position) => void): void {
        this.sync.off(handler);
    }

    public destroy(): void {
        this.inspector.destroy(this.id);
        for (let i = 0; i < this.values.length; i++) {
            this.values[i]?.off(this.linkedFunc[i]);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
    }
}
