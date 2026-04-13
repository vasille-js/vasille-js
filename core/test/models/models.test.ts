import { ArrayModel, Listener, MapModel, SetModel } from "../../src/index.js";

it("listener", function () {
    const listener = new Listener<[number, number]>();
    let addCounter = 0;
    const addHandler = (i: number, v: number) => {
        addCounter = i + v;
    };

    listener.on(addHandler);

    listener.emit(1, 1);
    expect(addCounter).toBe(2);

    listener.off(addHandler);
    listener.emit(1, 2);

    expect(addCounter).toBe(2);
});

it("array model", function () {
    const array = new ArrayModel<number>([1, 2, 3]);

    array.fill(0);
    expect(array.join()).toEqual([0, 0, 0].join());

    expect(array.pop()).toBe(0);
    expect(array.join()).toEqual([0, 0].join());

    expect(array.push(1, 2, 3)).toBe(5);
    expect(array.join()).toEqual([0, 0, 1, 2, 3].join());

    expect(array.shift()).toBe(0);
    expect(array.join()).toEqual([0, 1, 2, 3].join());

    expect(array.splice(1, 2, 2, 1).join()).toEqual([1, 2].join());
    expect(array.join()).toEqual([0, 2, 1, 3].join());
    expect(array.splice(3).join()).toEqual([3].join());
    expect(array.join()).toEqual([0, 2, 1].join());

    expect(array.unshift(3)).toBe(4);
    expect(array.join()).toEqual([3, 0, 2, 1].join());

    array.push(4);
    expect(array.join()).toEqual([3, 0, 2, 1, 4].join());

    array.splice(1, 0, -1);
    expect(array.join()).toEqual([3, -1, 0, 2, 1, 4].join());

    array.unshift(-4);
    expect(array.join()).toEqual([-4, 3, -1, 0, 2, 1, 4].join());

    array.splice(0, 1);
    expect(array.join()).toEqual([3, -1, 0, 2, 1, 4].join());

    array.splice(array.length - 1, 1);
    expect(array.join()).toEqual([3, -1, 0, 2, 1].join());

    array.splice(2, 1);
    expect(array.join()).toEqual([3, -1, 2, 1].join());

    array.splice(array.indexOf(-1), 1);
    expect(array.join()).toEqual([3, 2, 1].join());

    array.replace(1, 4);
    expect(array.join()).toEqual([3, 4, 1].join());

    array.splice(0);
    expect(array.join()).toEqual([].join());
});

it("map model", function () {
    const map = new MapModel<number, number>([
        [1, 2],
        [2, 3],
        [3, 4],
    ]);

    expect(map.get(1)).toBe(2);

    map.delete(3);
    expect(Array.from(map)).toEqual([
        [1, 2],
        [2, 3],
    ]);

    map.set(2, 4);
    expect(Array.from(map)).toEqual([
        [1, 2],
        [2, 4],
    ]);

    map.clear();
    expect(Array.from(map)).toEqual([]);
});

it("set model", function () {
    const set = new SetModel<number>([1, 2, 3]);

    set.add(4);
    expect(Array.from(set)).toEqual([1, 2, 3, 4]);

    set.delete(4);
    expect(Array.from(set)).toEqual([1, 2, 3]);

    set.delete(2);
    expect(Array.from(set)).toEqual([1, 3]);

    set.clear();
    expect(Array.from(set)).toEqual([]);
});
