import { Expression, IValue, Pointer, Reactive, Reference } from "../../src";

const alive: IValue<boolean> = new Reference(true);

class CoreTest extends Reactive {
    ref0: IValue<number>;
    mirror0: IValue<number>;
    forward0: IValue<number>;
    point0: Pointer<number>;
    ro_point: IValue<number>;

    predefined_point: IValue<number>;

    watch_test = 0;
    handler_test = 0;
    handler_ref: IValue<number>;
    bind0: IValue<number>;
    bind_unlinked: IValue<number>;

    freeze_test: IValue<boolean>;

    constructor() {
        super({});

        this.ref0 = super.ref(1);
        this.mirror0 = super.mirror(this.ref0);
        this.forward0 = super.forward(this.ref0);
        this.point0 = super.point(this.mirror0);
        this.ro_point = super.point(this.point0, true);
        this.predefined_point = super.point(this.ref(23));

        super.watch(v => {
            this.watch_test = v;
        }, this.ref0);

        this.bind0 = super.expr(
            (x, y) => {
                return x + y;
            },
            this.ref0,
            this.mirror0,
        );

        this.bind_unlinked = new Expression(
            (x, y) => {
                return x + y;
            },
            false,
            this.ref0,
            this.mirror0,
        );

        this.freeze_test = super.ref(false);
        this.handler_ref = super.ref(23);

        this.handler_ref.$on(n => {
            this.handler_test = n;
        });
    }
}

const coreTest = new CoreTest();

it("Reactive", function () {
    expect(() => coreTest.bindAlive(coreTest.freeze_test)).toThrow("wrong-binding");
    coreTest.bindAlive(alive);
    expect(() => coreTest.bindAlive(alive)).toThrow("wrong-binding");

    expect(coreTest.ref0.$).toBe(1);
    expect(coreTest.mirror0.$).toBe(1);
    expect(coreTest.forward0.$).toBe(1);
    expect(coreTest.point0.$).toBe(1);
    expect(coreTest.ro_point.$).toBe(1);
    expect(coreTest.predefined_point.$).toBe(23);
    expect(coreTest.bind0.$).toBe(2);
    expect(coreTest.bind_unlinked.$).toBe(2);

    coreTest.handler_ref.$ = 12;
    expect(coreTest.handler_test).toBe(12);

    coreTest.ro_point.$ = 2;
    expect(coreTest.ro_point.$).toBe(2);
    expect(coreTest.point0.$).toBe(1);

    coreTest.point0.$ = 3;
    expect(coreTest.ref0.$).toBe(3);
    expect(coreTest.mirror0.$).toBe(3);
    expect(coreTest.forward0.$).toBe(3);
    expect(coreTest.point0.$).toBe(3);
    expect(coreTest.ro_point.$).toBe(3);
    expect(coreTest.watch_test).toBe(3);
    expect(coreTest.bind0.$).toBe(6);
    expect(coreTest.bind_unlinked.$).toBe(2);

    coreTest.point0.$disable();
    coreTest.mirror0.$ = 4;
    expect(coreTest.ref0.$).toBe(4);
    expect(coreTest.mirror0.$).toBe(4);
    expect(coreTest.point0.$).toBe(3);
    expect(coreTest.ro_point.$).toBe(3);

    coreTest.mirror0.$disable();
    coreTest.ref0.$ = 5;
    expect(coreTest.ref0.$).toBe(5);
    expect(coreTest.mirror0.$).toBe(4);
    expect(coreTest.point0.$).toBe(3);

    alive.$ = false;
    coreTest.ref0.$ = 2;
    expect(coreTest.bind0.$).toBe(9);

    alive.$ = true;
    expect(coreTest.ref0.$).toBe(2);
    expect(coreTest.mirror0.$).toBe(2);
    expect(coreTest.point0.$).toBe(2);
    expect(coreTest.ro_point.$).toBe(2);
    expect(coreTest.watch_test).toBe(2);
    expect(coreTest.bind0.$).toBe(4);

    coreTest.point0.$$ = coreTest.bind0;
    expect(coreTest.point0.$).toBe(4);
    expect(coreTest.ro_point.$).toBe(4);

    expect(() => new Reactive({}).init()).toThrow("not-overwritten");

    coreTest.$destroy();
});
