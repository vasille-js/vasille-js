import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import {
    Dependency,
    ExecutionPosition,
    InspectableReference,
    Inspector,
    provideId,
    StaticPosition,
    toDevValue,
} from "./inspectable.js";

export type KindOfDevIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]> | DevIValue<T[K]> | undefined;
};

export abstract class DevIValue<T> extends IValue<T> {
    public abstract update(value: T, position: ExecutionPosition): void;
}

export class BaseDevReference<T> extends DevIValue<T> {
    protected state: T;
    protected readonly onChange: Set<(value: T, position?: ExecutionPosition) => void>;

    public constructor(value: T) {
        super();
        this.state = value;
        this.onChange = new Set();
    }

    public get V(): T {
        return this.state;
    }

    public set V(value: T) {
        this.update(value);
    }

    public update(value: T, position?: ExecutionPosition) {
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

    public on(handler: (value: T, position: ExecutionPosition) => void): void {
        this.onChange.add(handler);
    }

    public off(handler: (value: T, position: ExecutionPosition) => void): void {
        this.onChange.delete(handler);
    }

    protected shareUpdate(position?: ExecutionPosition) {
        void position;
    }

    protected shareError(error: unknown, handler: unknown, position?: ExecutionPosition) {
        void error;
        void handler;
        void position;
    }
}

export class DevReference<T> extends BaseDevReference<T> implements InspectableReference<T>, Destroyable {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(value: T, declaration: StaticPosition, inspector?: Inspector) {
        super(value);

        this.id = provideId();
        this.inspector = inspector;

        inspector?.newReference({
            id: this.id,
            declaration: declaration,
            value: toDevValue(this.state),
            time: Date.now(),
        });
    }

    public destroy(): void {
        this.shareDestroy();
    }

    protected shareUpdate(position?: ExecutionPosition) {
        this.inspector?.updateReference({
            id: this.id,
            position: position,
            value: toDevValue(this.state),
        });
    }

    protected shareError(error: unknown, handler: unknown, position?: ExecutionPosition) {
        this.inspector?.reportReferenceError({
            handler: toDevValue(handler),
            id: this.id,
            error: error,
            position: position,
        });
    }

    protected shareDestroy() {
        this.inspector?.destroy(this.id);
    }
}

export class ExpressionDevReference<T> extends BaseDevReference<T> implements InspectableReference<T> {
    public readonly id: number;
    public readonly inspector: Inspector | undefined;

    public constructor(id: number, value: T, inspector: Inspector | undefined) {
        super(value);

        this.id = id;
        this.inspector = inspector;
    }

    protected shareError(error: unknown, handler: unknown, position: ExecutionPosition) {
        this.inspector?.reportReferenceError({
            handler: toDevValue(handler),
            id: this.id,
            error: error,
            position: position,
        });
    }
}

export class DevExpression<T, Args extends unknown[]>
    extends IValue<T>
    implements Destroyable, InspectableReference<T>
{
    public readonly id: number;
    public readonly declaration: StaticPosition;
    public readonly inspector: Inspector | undefined;

    private values: KindOfDevIValue<Args>;
    private readonly valuesCache: Args;
    private linkedFunc: Array<() => void> = [];
    private sync: ExpressionDevReference<T>;

    public constructor(
        func: (...args: Args) => T,
        values: KindOfDevIValue<Args>,
        ctx: Reactive | undefined,
        depsCode: string[],
        declaration: StaticPosition,
        inspector: Inspector | undefined,
        isWatch: boolean,
    ) {
        super();

        const id = provideId();
        const handler = (i: number, value: unknown, position: ExecutionPosition) => {
            try {
                this.valuesCache[i] = value;

                const newValue = func.apply(this, this.valuesCache);

                if (this.sync.V !== newValue || isWatch) {
                    this.sync.update(newValue, position);
                    inspector?.updateExpression({
                        id: id,
                        position: position,
                        value: newValue,
                        deps: this.valuesCache.map(toDevValue),
                    });
                }
            } catch (e) {
                inspector?.reportExpressionCalculationError({
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

        inspector?.newExpression({
            id: this.id,
            declaration: this.declaration,
            isWatch: isWatch,
            value: toDevValue(this.sync.V),
            deps: values.map((dep, index) => {
                if (dep instanceof DevReference || dep instanceof DevExpression) {
                    return {
                        code: depsCode[index],
                        id: dep.id,
                        value: toDevValue(dep.V),
                    } satisfies Dependency;
                }

                return depsCode[index];
            }),
            time: Date.now(),
        });
    }

    public update(value: T, position?: ExecutionPosition): void {
        this.sync.update(value, position);
    }

    public get V(): T {
        return this.sync.V;
    }

    public set V(v: T) {
        this.sync.V = v;
    }

    public on(handler: (value: T, position: ExecutionPosition) => void): void {
        this.sync.on(handler);
    }

    public off(handler: (value: T, position: ExecutionPosition) => void): void {
        this.sync.off(handler);
    }

    public destroy(): void {
        this.inspector?.destroy(this.id);
        for (let i = 0; i < this.values.length; i++) {
            this.values[i]?.off(this.linkedFunc[i]);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
    }
}
