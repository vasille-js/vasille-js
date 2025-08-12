import { Expression, Forward, IValue, Reactive, Reference } from "../../src/index.js";

class CoreTest extends Reactive {
    ref0: IValue<number>;
    forward0: IValue<number>;

    watch_test = 0;
    handler_test = 0;
    handler_ref: IValue<number>;
    bind0: IValue<number>;

    freeze_test: IValue<boolean>;

    constructor() {
        super();

        this.ref0 = new Reference(1);
        this.forward0 = new Forward(this.ref0);

        new Expression(
            v => {
                this.watch_test = v;
            },
            [this.ref0],
        );

        this.bind0 = new Expression(
            (x, y) => {
                return x + y;
            },
            [this.ref0, this.forward0],
        );

        this.freeze_test = new Reference(false);
        this.handler_ref = new Reference(23);

        this.handler_ref.on(n => {
            this.handler_test = n;
        });
    }
}

const coreTest = new CoreTest();

it("Reactive", function () {
    expect(coreTest.ref0.V).toBe(1);
    expect(coreTest.forward0.V).toBe(1);
    expect(coreTest.bind0.V).toBe(2);

    coreTest.handler_ref.V = 12;
    expect(coreTest.handler_test).toBe(12);

    coreTest.ref0.V = 2;
    expect(coreTest.ref0.V).toBe(2);
    expect(coreTest.watch_test).toBe(2);
    expect(coreTest.bind0.V).toBe(4);

    let test1 = false,
        test2 = false;
    const destroyable1 = new Reactive(),
        destroyable2 = new Reactive();

    destroyable1.runOnDestroy(() => (test1 = true));
    destroyable2.runOnDestroy(() => (test1 = true));
    // here we test override
    destroyable2.runOnDestroy(() => (test2 = true));

    coreTest.bind(destroyable1);

    coreTest.destroy();

    expect(test1).toBe(true);
    expect(test2).toBe(false);

    destroyable2.destroy();

    expect(test2).toBe(true);
});
