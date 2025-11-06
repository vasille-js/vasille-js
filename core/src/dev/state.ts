import { Reactive } from "../core/core.js";
import { Destroyable } from "../core/destroyable.js";
import { IValue } from "../core/ivalue.js";
import { Dependency, Inspectable, InspectableReference, Inspector, Position, provideId, toDevValue } from "./inspectable.js";

export type KindOfDevIValue<T extends unknown[]> = {
    [K in keyof T]: IValue<T[K]> | DevIValue<T[K]> | undefined;
};

export abstract class DevIValue<T> extends IValue<T> {
    public abstract update(value: T, position: Position): void;
}

export class DevReference<T> extends IValue<T> implements InspectableReference<T>, Destroyable {
    public readonly id: number;
    public readonly declaration: Position;
    public readonly inspector: Inspector;

    protected state: T;
    protected readonly onChange: Set<(value: T, position: Position) => void>;

    public constructor(value: T, declaration: Position, inspector: Inspector) {
        super();
        this.state = value;
        this.onChange = new Set();

        this.id = provideId();
        this.declaration = declaration;
        this.inspector = inspector;

        this.shareCreated();
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

    public destroy(): void {
        this.shareDestroy();
    }

    protected shareCreated() {
        this.inspector.newReference(this.id, this.state, this.declaration);
    }

    protected shareUpdate(position: Position) {
        this.inspector.updateReference(this.id, this.state, position);
    }

    protected shareError(error: unknown, handler: unknown, position: Position) {
        this.inspector.raportReferenceError(this.id, error, toDevValue(handler), position);
    }

    protected shareDestroy() {
        this.inspector.deleteReference(this.id);
    }
}

class DevExpressionReference<T> extends DevReference<T> {
    private cache: unknown[];
    private deps?: (IValue<unknown>|DevIValue<unknown>|undefined)[];
    private depsCode?: string[];

    public constructor(value: T, declaration: Position, inspector: Inspector, deps: (IValue<unknown>|DevIValue<unknown>|undefined)[], depsCode: string[], cache: unknown[]) {
        super(value, declaration, inspector)
        this.deps = deps;
        this.depsCode = depsCode;
        this.cache = cache;
        this.shareCreated();
    }

    protected shareCreated(): void {
        const {deps,depsCode} = this;

        if (deps && depsCode) {
            this.inspector.newExpression(this.id, this.state, deps.map((dep, index) => {
                if (dep instanceof DevReference || dep instanceof DevExpression) {
                    return {
                        code: depsCode[index],
                        id: dep.id,
                        value: toDevValue(dep.V),
                    } satisfies Dependency;
                }

                return depsCode[index];
            }), this.declaration);
        }
        this.deps = undefined;
        this.depsCode = undefined;
    }

    protected shareUpdate(position: Position): void {
        this.inspector.updateExpression(this.id, this.state, this.cache.map(toDevValue), position);
    }

    protected shareError(error: unknown, handler: unknown, position: Position): void {
        this.inspector.raportExpressionSyncError(this.id, error, toDevValue(handler), position);
    }

    protected shareDestroy(): void {
        this.inspector.deleteExpression(this.id);
    }
}

export class DevExpression<T, Args extends unknown[]>
    extends IValue<T>
    implements Destroyable, Inspectable
{
    public readonly id: number;

    private values: KindOfDevIValue<Args>;
    private readonly valuesCache: Args;
    private linkedFunc: Array<() => void> = [];
    private sync: DevReference<T>;

    public constructor(
        func: (...args: Args) => T,
        values: KindOfDevIValue<Args>,
        ctx: Reactive | undefined,
        depsCode: string[],
        declaration: Position,
        inspector: Inspector,
    ) {
        super();

        const handler = (i: number, value: unknown, position: Position) => {
                try {
                    this.valuesCache[i] = value;
                this.sync.update(func.apply(this, this.valuesCache), position);
                }
                catch (e) {
                    this.sync.inspector.raportExpressionCalculationError(this.sync.id, this.valuesCache.map(toDevValue), e, toDevValue(func), position);
                    reportError(e);
                }
        };

        this.valuesCache = values.map(item => item?.V) as Args;

        this.sync = new DevExpressionReference(func.apply(this, this.valuesCache), declaration, inspector, values, depsCode, this.valuesCache);

        let i = 0;
        values.forEach(value => {
            const updater = handler.bind(this, Number(i++));

            this.linkedFunc.push(updater);
            value?.on(updater);
        });

        this.values = values;
        ctx?.bind(this);
    }

    update(value: T, position: Position): void {
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
        this.sync.destroy();
        for (let i = 0; i < this.values.length; i++) {
            this.values[i]?.off(this.linkedFunc[i]);
        }
        this.values.splice(0);
        this.valuesCache.splice(0);
        this.linkedFunc.splice(0);
    }
}

export class DevBackward<T> extends DevReference<T> {
    protected target: DevIValue<T> & Inspectable;

    public constructor(value: DevIValue<T> & Inspectable, declaration: Position, inspector: Inspector) {
        super(value.V, declaration, inspector);
        this.target = value;
        this.inspector.unlinkDependency(this.target.id, this.id);
    }

    public override get V(): T {
        return super.V;
    }

    public override set V(value: T) {
        void value;
        throw new Error("Production API usage detected");
    }

    public update(value: T, position: Position): void {
        this.update(value, position);
        this.target.update(value, position);
    }

    public destroy(): void {
        this.inspector.unlinkDependency(this.target.id, this.id);
        super.destroy();
    }
}
