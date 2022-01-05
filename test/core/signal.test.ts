import {Signal} from "../../src";

const signal = new Signal<number, string>();

let test = 0;

const handler = (x : number, str : string) => {
    if (str) {
        test = x;
    }
}

const throwHandler = (x : number, str : string) => {
    throw str + x;
}

it('Signal', function () {
    signal.subscribe(handler);
    signal.subscribe(throwHandler);
    expect(test).toBe(0);

    signal.emit(2, 'test');
    expect(test).toBe(2);

    signal.unsubscribe(handler);
    signal.emit(22, 'test');
    expect(test).toBe(2);
});
