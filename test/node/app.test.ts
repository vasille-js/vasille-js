import {page} from "../page";
import {App, Executor} from "../../src";
import {instantExecutor, timeoutExecutor} from "../../src/core/executor";

class Test extends Executor {

}

const test = new Test();

it("App", function () {
    const body = page.window.document.body;
    const _default = new App(body);
    const instant = new App(body, { freezeUi: true });
    const timeout = new App(body, { freezeUi: false });
    const custom = new App(body, { executor: test });

    expect(_default.$run).toBe(instantExecutor);
    expect(instant.$run).toBe(instantExecutor);
    expect(timeout.$run).toBe(timeoutExecutor);
    expect(custom.$run).toBe(test);
})
