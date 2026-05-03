import { Expression, IValue, Reactive, Reference } from "../../src/index.js";
import { TestExpression } from "../page.js";

class CoreTest extends Reactive {
    ref0: IValue<number>;

    watch_test = 0;
    handler_test = 0;
    handler_ref: IValue<number>;
    bind0: IValue<number>;

    freeze_test: IValue<boolean>;

    constructor() {
        super(1);

        this.ref0 = new Reference(1);

        new TestExpression(
            v => {
                this.watch_test = v;
            },
            [this.ref0],
        );

        this.bind0 = new TestExpression(
            x => {
                return x + 1;
            },
            [this.ref0],
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
    expect(coreTest.bind0.V).toBe(2);

    coreTest.handler_ref.V = 12;
    expect(coreTest.handler_test).toBe(12);

    coreTest.ref0.V = 2;
    expect(coreTest.ref0.V).toBe(2);
    expect(coreTest.watch_test).toBe(2);
    expect(coreTest.bind0.V).toBe(3);

    let test1 = false,
        test2 = false;
    const destroyable1 = new Reactive(0),
        destroyable2 = new Reactive(0);

    destroyable1.runOnDestroy(() => (test1 = true));
    destroyable2.runOnDestroy(() => (test1 = true));
    // here we test override
    destroyable2.runOnDestroy(() => (test2 = true));

    coreTest.bind(destroyable1);

    coreTest.destroy(Infinity);

    expect(test1).toBe(true);
    expect(test2).toBe(false);

    destroyable2.destroy(0);

    expect(test2).toBe(true);
});
