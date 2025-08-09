import { setErrorHandler } from "vasille";
import { routeApp } from "../src/web/router.js";
import { page } from "./page.js";

it("empty router", function (done) {
    const window = page();
    const body = window.document.body;
    let counter = 0;

    setErrorHandler(error => {
        expect(`${error}`).toBe("Error: No fallback screen");
        counter++;
    });

    routeApp(body, window as unknown as Window, window.location, { routes: {} });

    setTimeout(() => {
        expect(counter).toBe(1);
        done();
    });
});
