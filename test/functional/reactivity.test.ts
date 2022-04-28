import {expr, forward, mirror, point, ref, watch, v, setValue, valueOf} from "../../src/v";
import {page} from "../page";

it("Reactivity test", function () {
    v.app(() => {
        const [r] = ref(2);
        const m = mirror(r);
        const f = forward(r);
        const p = point(m);

        let watch_test = 0;

        watch(v => watch_test = v, r);

        const b = v.expr((x, y) => x + y, p, m);

        expect(v.of(b)).toBe(4);
        r.$ = 4;
        expect(v.of(b)).toBe(8);
        m.$ = 2;
        expect(v.of(b)).toBe(4);
        f.$ = 3;
        expect(v.of(b)).toBe(4);
        p.$ = 4;
        expect(v.of(b)).toBe(8);
        expect(watch_test).toBe(4);
        v.sv(f, 2);
        v.sv(p, f);
        expect(v.of(b)).toBe(6);
        setValue(f, m);
        expect(valueOf(b)).toBe(8);
    })(page.window.document.body, {});
})
