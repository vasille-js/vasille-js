import { ArrayModel, Listener, MapModel, ObjectModel, SetModel } from "../../src";

it("listener", function () {
    const listener = new Listener<number, number>();
    let addCounter = 0,
        removeCounter = 0;
    const addHandler = (i: number, v: number) => {
        addCounter = i + v;
    };
    const removeHandler = (i: number, v: number) => {
        removeCounter = i + v;
    };

    listener.onAdd(addHandler);
    listener.onRemove(removeHandler);

    listener.emitAdded(1, 1);
    expect(addCounter).toBe(2);

    listener.emitRemoved(2, 3);
    expect(removeCounter).toBe(5);

    listener.disableReactivity();

    listener.emitAdded(4, 1);
    expect(addCounter).toBe(2);

    listener.emitRemoved(9, 3);
    expect(removeCounter).toBe(5);

    listener.emitAdded(4, 2);
    listener.emitRemoved(9, 4);

    listener.enableReactivity();
    expect(addCounter).toBe(6);
    expect(removeCounter).toBe(13);

    listener.offAdd(addHandler);
    listener.offRemove(removeHandler);

    listener.emitAdded(1, 1);
    listener.emitRemoved(1, 1);

    expect(addCounter).toBe(6);
    expect(removeCounter).toBe(13);
});

it("array model", function () {
    const array = new ArrayModel<number>([1, 2, 3]);
    const empty = new ArrayModel<number>();

    expect(array.last).toBe(3);
    expect(empty.last).toBe(null);

    array.fill(0);
    expect(array).toEqual([0, 0, 0]);

    expect(array.pop()).toBe(0);
    expect(array).toEqual([0, 0]);

    expect(array.push(1, 2, 3)).toBe(5);
    expect(array).toEqual([0, 0, 1, 2, 3]);

    expect(array.shift()).toBe(0);
    expect(array).toEqual([0, 1, 2, 3]);

    expect(array.splice(1, 2, 2, 1)).toEqual([1, 2]);
    expect(array).toEqual([0, 2, 1, 3]);
    expect(array.splice(3)).toEqual([3]);
    expect(array).toEqual([0, 2, 1]);

    expect(array.unshift(3)).toBe(4);
    expect(array).toEqual([3, 0, 2, 1]);

    array.append(4);
    expect(array).toEqual([3, 0, 2, 1, 4]);

    array.insert(1, -1);
    expect(array).toEqual([3, -1, 0, 2, 1, 4]);

    array.prepend(-4);
    expect(array).toEqual([-4, 3, -1, 0, 2, 1, 4]);

    array.removeFirst();
    expect(array).toEqual([3, -1, 0, 2, 1, 4]);

    array.removeLast();
    expect(array).toEqual([3, -1, 0, 2, 1]);

    array.removeAt(2);
    expect(array).toEqual([3, -1, 2, 1]);

    array.removeOne(-1);
    expect(array).toEqual([3, 2, 1]);

    array.replace(1, 4);
    expect(array).toEqual([3, 4, 1]);

    array.clear();
    expect(array).toEqual([]);
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

it("object model", function () {
    const obj = new ObjectModel<number>({ 0: 1, 1: 2, 2: 3 });

    obj.delete("2");
    expect(obj.get("2")).toBeUndefined();

    obj.set("1", 4);
    expect(obj.get("1")).toBe(4);

    obj.set("3", 3);
    expect(obj.get("3")).toBe(3);
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
