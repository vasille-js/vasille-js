import { Expression, Extension, IValue, Pointer, Reactive, Reference } from "../../src";
import { OwningPointer } from "../../src/value/pointer";

const alive: IValue<boolean> = new Reference(true);

class CoreTest extends Reactive {
    ref0: IValue<number>;
    forward0: IValue<number>;
    point0: Pointer<number>;

    watch_test = 0;
    handler_test = 0;
    handler_ref: IValue<number>;
    bind0: IValue<number>;

    freeze_test: IValue<boolean>;

    constructor() {
        super({});

        this.ref0 = super.ref(1);
        this.forward0 = super.forward(this.ref0);
        this.point0 = super.own(this.forward(this.forward0));

        super.watch(v => {
            this.watch_test = v;
        }, this.ref0);

        this.bind0 = super.expr(
            (x, y) => {
                return x + y;
            },
            this.ref0,
            this.forward0,
        );

        this.freeze_test = super.ref(false);
        this.handler_ref = super.ref(23);

        this.handler_ref.on(n => {
            this.handler_test = n;
        });
    }
}

const coreTest = new CoreTest();

it("Reactive", function () {
    expect(coreTest.ref0.$).toBe(1);
    expect(coreTest.forward0.$).toBe(1);
    expect(coreTest.point0.$).toBe(1);
    expect(coreTest.bind0.$).toBe(2);

    coreTest.handler_ref.$ = 12;
    expect(coreTest.handler_test).toBe(12);

    expect(coreTest.point0.$).toBe(1);

    coreTest.ref0.$ = 2;
    expect(coreTest.ref0.$).toBe(2);
    expect(coreTest.point0.$).toBe(2);
    expect(coreTest.watch_test).toBe(2);
    expect(coreTest.bind0.$).toBe(4);

    coreTest.point0.$$ = coreTest.bind0;
    expect(coreTest.point0.$).toBe(4);

    let test1 = false,
        test2 = false;
    const destroyable1 = new Reactive({}),
        destroyable2 = new Reactive({});

    destroyable1.runOnDestroy(() => (test1 = true));
    destroyable2.runOnDestroy(() => (test1 = true));
    // here we test override
    destroyable2.runOnDestroy(() => (test2 = true));

    coreTest.register(destroyable1);
    coreTest.register(destroyable2);
    coreTest.release(destroyable2);

    coreTest.destroy();

    expect(test1).toBe(true);
    expect(test2).toBe(false);

    destroyable2.destroy();

    expect(test2).toBe(true);

    const p1 = new Pointer(new Reference(2));
    const p2 = new Pointer(new Reference(3));
    const p3 = new OwningPointer(p1);
    const p4 = new OwningPointer(p2);

    expect(p1.$$).toBe(2);
    expect(p2.$$).toBe(3);
    expect(p3.$$).toBe(2);
    expect(p4.$$).toBe(3);

    p1.$$ = p2;
    p2.$$ = 4;

    expect(p1.$$).toBe(4);
    expect(p2.$$).toBe(4);
    expect(p3.$$).toBe(4);
    expect(p4.$$).toBe(4);

    const bind1 = new Expression((a, b) => a+b, p1, p2);
    const bind2 = new Expression((a, b) => a+b, p3, p4);

    expect(bind1.$).toBe(8);
    expect(bind2.$).toBe(8);

    p4.$$ = 4;
    p3.$$ = 3;
    p2.$$ = 2;
    p1.$$ = 1;

    expect(bind1.$).toBe(8);
    expect(bind2.$).toBe(7);

    p3.$$ = 0;
    p4.$$ = 1;

    expect(bind1.$).toBe(8);
    expect(bind2.$).toBe(1);

    p3.destroy();
    p4.destroy();

    bind1.$ = 2;
    p4.$$ = 999;

    expect(bind1.$).toBe(2);
    expect(bind2.$).toBe(1);
});
