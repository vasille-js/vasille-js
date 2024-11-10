import { ContextArray, ContextMap, ContextSet } from "../src/models";

it("context array", function () {
    const arr = new ContextArray([{ x: 1 }]);
    const arr2 = new ContextArray<{ x: number }>();

    expect(arr[0].x).toBe(1);

    arr.fill({ x: 2 });
    expect(arr[0].x).toBe(2);

    arr.push({ x: 3 });
    expect(arr[1].x).toBe(3);
    arr2.push(arr[1]);
    expect(arr2[0].x).toBe(arr[1].x);

    arr.pop();
    expect(arr.length).toBe(1);

    arr.unshift({ x: 0 });
    expect(arr[0].x).toBe(0);

    arr.shift();
    expect(arr.length).toBe(1);

    arr.replace(0, { x: 5 });
    expect(arr[0].x).toBe(5);

    arr.splice(0, 1, { x: 7 });
    expect(arr[0].x).toBe(7);

    arr.destroy();
});

it("context map", function () {
    const map = new ContextMap([[1, { x: 1 }]]);

    expect(map.get(1)?.x).toBe(1);

    map.set(2, { x: 2 });
    expect(map.get(2)?.x).toBe(2);

    map.delete(1);
    expect(map.size).toBe(1);

    map.clear();
    expect(map.size).toBe(0);

    map.destroy();
});

it("context set", function () {
    const obj = { x: 1 };
    const set = new ContextSet([obj]);

    expect(set.has(obj)).toBe(true);

    set.add({ x: 2 });
    expect(set.size).toBe(2);

    set.add(obj);
    expect(set.size).toBe(2);

    set.delete({ x: 1 });
    expect(set.size).toBe(2);

    set.delete(obj);
    expect(set.size).toBe(1);

    set.clear();
    expect(set.size).toBe(0);

    set.destroy();
});
