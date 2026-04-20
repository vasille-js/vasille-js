import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import { reportError } from "../functional/safety.js";
import { DevReactive } from "./core.js";
import {
    Dependency,
    errorToString,
    ExecutionPosition,
    InspectableReference,
    inspector,
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

    public constructor(value: T, ctx?: Reactive) {
        super(ctx?.sDeep ?? 0);
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
                    this.shareError(e, position);
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

    protected shareError(error: unknown, position?: ExecutionPosition) {
        void error;
        void position;
    }
}

export class DevReference<T> extends BaseDevReference<T> implements InspectableReference<T>, Destroyable {
    public readonly id: number;

    public constructor(value: T, ctx: Reactive | undefined, declaration: StaticPosition, name?: string) {
        super(value, ctx);

        this.id = provideId();
        this.rDeep = ctx?.sDeep ?? 0;

        inspector.newReference({
            id: this.id,
            declaration: declaration,
            value: toDevValue(this.state),
            time: Date.now(),
        });
        if (ctx instanceof DevReactive && name) {
            inspector.addContextState({
                id: ctx.id,
                name: name,
                stateId: this.id,
            });
        }
    }

    public destroy(): void {
        this.shareDestroy();
    }

    protected override shareUpdate(position?: ExecutionPosition) {
        inspector.updateReference({
            id: this.id,
            time: Date.now(),
            position: position,
            value: toDevValue(this.state),
        });
    }

    protected override shareError(error: unknown, position?: ExecutionPosition) {
        inspector.reportReferenceError({
            targetId: this.id,
            time: Date.now(),
            error: errorToString(error),
            position: position,
        });
    }

    protected shareDestroy() {
        inspector.destroy({ id: this.id, time: Date.now() });
    }
}

export class ExpressionDevReference<T> extends BaseDevReference<T> implements InspectableReference<T> {
    public readonly id: number;

    public constructor(id: number, value: T) {
        super(value);

        this.id = id;
    }

    protected override shareError(error: unknown, position: ExecutionPosition) {
        inspector.reportReferenceError({
            targetId: this.id,
            time: Date.now(),
            error: errorToString(error),
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

    private values: KindOfDevIValue<Args>;
    private readonly valuesCache: Args;
    private linkedFunc: Array<() => void> = [];
    private sync: ExpressionDevReference<T>;

    public constructor(
        func: (...args: Args) => T,
        values: KindOfDevIValue<Args>,
        ctx: Reactive | undefined,
        name: string | undefined,
        depsCode: string[],
        declaration: StaticPosition,
        isWatch: boolean,
    ) {
        super(ctx?.sDeep ?? 0);

        const id = provideId();
        const handler = (i: number, value: unknown, position: ExecutionPosition) => {
            try {
                this.valuesCache[i] = value;

                const newValue = func.apply(this, this.valuesCache);

                if (this.sync.V !== newValue || isWatch) {
                    this.sync.update(newValue, position);
                    inspector.updateExpression({
                        id: id,
                        time: Date.now(),
                        position: position,
                        value: newValue,
                        deps: this.valuesCache.map(toDevValue),
                    });
                }
            } catch (e) {
                inspector.reportExpressionCalculationError({
                    targetId: id,
                    time: Date.now(),
                    error: errorToString(e),
                    position: position,
                    deps: this.valuesCache.map(toDevValue),
                });
                reportError(e);
            }
        };

        this.valuesCache = values.map(item => item?.V) as Args;

        this.sync = new ExpressionDevReference(id, func.apply(this, this.valuesCache));
        this.id = id;
        this.declaration = declaration;

        let i = 0;
        values.forEach(value => {
            const updater = handler.bind(this, Number(i++));

            this.linkedFunc.push(updater);
            value?.on(updater);
        });

        this.values = values;
        this.rDeep = Math.min(...values.filter(Boolean).map(item => item!.sDeep));
        ctx?.bind(this);

        inspector.newExpression({
            id: this.id,
            declaration: this.declaration,
            isWatch: isWatch,
            value: toDevValue(this.sync.V),
            deps: values.map((dep, index) => {
                if (dep instanceof DevReference || dep instanceof DevExpression) {
                    return {
                        code: depsCode[index]!,
                        id: dep.id,
                        value: toDevValue(dep.V),
                    } satisfies Dependency;
                }

                return depsCode[index]!;
            }),
            time: Date.now(),
        });
        if (ctx instanceof DevReactive && name) {
            inspector.addContextState({
                id: ctx.id,
                name: name,
                stateId: id,
            });
        }
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
        inspector.destroy({ id: this.id, time: Date.now() });
        for (let i = 0; i < this.values.length; i++) {
            this.values[i]?.off(this.linkedFunc[i]!);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
    }
}
