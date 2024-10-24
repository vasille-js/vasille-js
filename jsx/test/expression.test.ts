import { Reference } from "vasille";
import { PartialExpression } from "../src/expression";

function sum(a: number, b: number) {
    return a + b;
}

it("recursive expression", function () {
    const value = 4;
    const ref = new Reference(5);
    const expr1 = new PartialExpression(sum, [value, ref]);
    const expr2 = new PartialExpression(sum, [ref, expr1]);
    const expr3 = new PartialExpression(sum, [expr1, expr2]);

    expect(expr1.$).toBe(9);
    expect(expr2.$).toBe(14);
    expect(expr3.$).toBe(23);

    ref.$ = 0;
    expect(expr1.$).toBe(4);
    expect(expr2.$).toBe(4);
    expect(expr3.$).toBe(8);
});

it("expression on/off", function () {
    const ref = new Reference(2);
    const expression = new PartialExpression(sum, [ref, ref]);
    let test = expression.$;
    const tracker = (v: number) => (test = v);

    expression.on(tracker);
    expect(test).toBe(4);
    ref.$ = 3;
    expect(test).toBe(6);

    expression.off(tracker);
    ref.$ = 2;
    expect(test).toBe(6);
});
