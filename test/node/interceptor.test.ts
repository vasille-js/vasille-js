import {Interceptor, Signal} from "../../src";

let test = 0;

const interceptor = new Interceptor<number>();
const signal = new Signal<number>();
const handler = (n : number) => {
    test = n;
}

it("Interceptor", function () {
    interceptor.connect(handler);
    interceptor.connect(signal);
    interceptor.disconnect(handler);
    interceptor.connect(handler);

    expect(test).toBe(0);

    signal.emit(1);
    expect(test).toBe(1);

    interceptor.disconnect(handler);
    signal.emit(2);
    expect(test).toBe(1);

    interceptor.connect(handler);
    interceptor.$destroy();
})
