import {Destroyable} from "../../src";


class DestroyableTest extends Destroyable {
    public test1 : number;
    public test2 : number;
    public test3 : number;

    constructor() {
        super();

        this.test3 = 23;

        Object.defineProperty(this, 'test1', {
            value: 0,
            writable: true,
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(this, 'test2', {
            get: () => this.test1,
            set: vv => this.test1 = vv,
            enumerable: true,
            configurable: true
        });

        // eslint-disable-next-line no-self-assign
        this.test2 = this.test2;
        
        this.$seal();
    }
}

const destroyableTest = new DestroyableTest;

it('make field non-configurable', function () {
    expect(Object.getOwnPropertyDescriptors(destroyableTest).test1.configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptors(destroyableTest).test2.configurable).toBe(false);
    expect(Object.getOwnPropertyDescriptors(destroyableTest).test3.configurable).toBe(false);

    destroyableTest.$destroy();
});
