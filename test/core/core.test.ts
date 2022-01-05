import {Expression, IValue, Pointer, Reactive, Reference} from "../../src";

const alive : IValue<boolean> = new Reference(true);

class CoreTest extends Reactive {

    ref : IValue<number>;
    mirror : IValue<number>;
    point : Pointer<number>;
    ro_point : IValue<number>;

    predefined_point : IValue<number>;

    watch_test = 0;
    handler_test = 0;
    handler_ref : IValue<number>;
    bind : IValue<number>;
    bind_unlinked : IValue<number>;

    freeze_test : IValue<boolean>;


    constructor() {
        super();

        this.ref = this.$ref(1);
        this.mirror = this.$mirror(this.ref);
        this.point = this.$point(this.mirror);
        this.ro_point = this.$point(this.point, true);
        this.predefined_point = this.$point(23);

        this.$watch((v) => {
            this.watch_test = v;
        }, this.ref);

        this.bind = this.$bind((x, y) => {
            return x + y;
        }, this.ref, this.mirror);

        this.bind_unlinked = new Expression((x, y) => {
            return x + y;
        }, false, this.ref, this.mirror);

        this.freeze_test = this.$ref(false);
        this.handler_ref = this.$ref(23);

        this.handler_ref.on((n) => {
            this.handler_test = n;
        });
    }
}

const coreTest = new CoreTest();

it("Reactive", function () {

    expect(() => coreTest.$bindAlive(coreTest.freeze_test)).toThrow("wrong-binding");
    coreTest.$bindAlive(alive);
    expect(() => coreTest.$bindAlive(alive)).toThrow("wrong-binding");

    expect(coreTest.ref.$).toBe(1);
    expect(coreTest.mirror.$).toBe(1);
    expect(coreTest.point.$).toBe(1);
    expect(coreTest.ro_point.$).toBe(1);
    expect(coreTest.predefined_point.$).toBe(23);
    expect(coreTest.bind.$).toBe(2);
    expect(coreTest.bind_unlinked.$).toBe(2);

    coreTest.handler_ref.$ = 12;
    expect(coreTest.handler_test).toBe(12);

    coreTest.ro_point.$ = 2;
    expect(coreTest.ro_point.$).toBe(2);
    expect(coreTest.point.$).toBe(1);

    coreTest.point.$ = 3;
    expect(coreTest.ref.$).toBe(3);
    expect(coreTest.mirror.$).toBe(3);
    expect(coreTest.point.$).toBe(3);
    expect(coreTest.ro_point.$).toBe(3);
    expect(coreTest.watch_test).toBe(3);
    expect(coreTest.bind.$).toBe(6);
    expect(coreTest.bind_unlinked.$).toBe(2);

    coreTest.point.disable();
    coreTest.mirror.$ = 4;
    expect(coreTest.ref.$).toBe(4);
    expect(coreTest.mirror.$).toBe(4);
    expect(coreTest.point.$).toBe(3);
    expect(coreTest.ro_point.$).toBe(3);

    coreTest.mirror.disable();
    coreTest.ref.$ = 5;
    expect(coreTest.ref.$).toBe(5);
    expect(coreTest.mirror.$).toBe(4);
    expect(coreTest.point.$).toBe(3);

    alive.$ = false;
    coreTest.ref.$ = 2;
    expect(coreTest.bind.$).toBe(9);

    alive.$ = true;
    expect(coreTest.ref.$).toBe(2);
    expect(coreTest.mirror.$).toBe(2);
    expect(coreTest.point.$).toBe(2);
    expect(coreTest.ro_point.$).toBe(2);
    expect(coreTest.watch_test).toBe(2);
    expect(coreTest.bind.$).toBe(4);

    coreTest.point.point(coreTest.bind);
    expect(coreTest.point.$).toBe(4);
    expect(coreTest.ro_point.$).toBe(4);

    coreTest.$destroy();
});

