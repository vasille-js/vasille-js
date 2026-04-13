import { App, Fragment, Reactive, Runner, Tag, TextNode } from "vasille"
import {context, impute, receive, receiveOptional, share} from "../src/index.js";

class FakeRunner implements Runner<unknown, unknown, object> {
    insertBefore(node: unknown, before: unknown): void {
        throw new Error("Method not implemented.");
    }
    appendChild(node: unknown, child: unknown): void {
        throw new Error("Method not implemented.");
    }
    textNode(text: unknown): TextNode<unknown, unknown, object, Runner<unknown, unknown, object>> {
        throw new Error("Method not implemented.");
    }
    tag(tagName: string, input: object, cb?: ((ctx: Tag<unknown, unknown, object, Runner<unknown, unknown, object>>) => void) | undefined): Tag<unknown, unknown, object, Runner<unknown, unknown, object>> {
        throw new Error("Method not implemented.");
    }
}

abstract class ANumber {
    public abstract get(): number;
}

class Number1 extends ANumber {
    public get() {
        return 1;
    }
}

class Number2 extends ANumber {
    public get() {
        return 2;
    }
}

class Number3 extends ANumber {
    public get() {
        return 3;
    }
}

it("Main test", function () {
    const runner = new FakeRunner;
    const root = new App<unknown, unknown, object>({}, runner);
    const child1 = new Fragment<unknown, unknown, object>(runner);
    const child2 = new Fragment<unknown, unknown, object>(runner);
    const child3 = new Fragment<unknown, unknown, object>(runner);
    const ctx = context((n: number) => n);

    child1.parent = root;
    child2.parent = child1;
    child3.parent = child2;

    // testing ctx

    expect(receiveOptional(child3, ctx)).toBeUndefined();

    share(child1, ctx, 1);
    share(child3, ctx, 3);

    expect(receive(child1, ctx)).toBe(1);
    expect(receive(child2, ctx)).toBe(1);
    expect(receive(child3, ctx)).toBe(3);
    expect(receiveOptional(child3, ctx)).toBe(3);

    expect(impute(root, ctx, 2)).toBe(2);
    expect(impute(child2, ctx, 2)).toBe(1);

    expect(receive(root, ctx)).toBe(2);
    expect(receive(child1, ctx)).toBe(1);
    expect(receive(child2, ctx)).toBe(1);

    // testing deps

    share(child1, ANumber, new Number1);
    share(child3, ANumber, new Number3);

    expect(receive(child1, ANumber).get()).toBe(1);
    expect(receive(child2, ANumber).get()).toBe(1);
    expect(receive(child3, ANumber).get()).toBe(3);

    expect(impute(root, ANumber, () => new Number2).get()).toBe(2);
    expect(impute(child2, ANumber, () => new Number2).get()).toBe(1);

    expect(receive(root, ANumber).get()).toBe(2);
    expect(receive(child1, ANumber).get()).toBe(1);
    expect(receive(child2, ANumber).get()).toBe(1);

    // testing strings

    share(child1, "x", "1");
    share(child3, "x", "3");

    expect(receive(child1, "x")).toBe("1")
    expect(receive(child2, "x")).toBe("1");
    expect(receive(child3, "x")).toBe("3");

    expect(impute(root, "x", "2")).toBe("2");
    expect(impute(child2, "x", "2")).toBe("1");

    expect(receive(root, "x")).toBe("2");
    expect(receive(child1, "x")).toBe("1");
    expect(receive(child2, "x")).toBe("1");

    // throw test
    expect(() => receive(child1, "y")).toThrow("Missing value for key \"y\"");

    [child3, child2, child1, root].forEach(child => child.destroy());
});