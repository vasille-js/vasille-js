import { setErrorHandler } from "vasille";
import { routerApp } from "vasille-web";
import { page } from "../page";

it("empty routing test", function (done) {
  const body = page.window.document.body;
  let count = 0;

  setErrorHandler(error => {
    expect(`${error}`).toBe("Error: No fallback screen");
    count++;
  });
  routerApp({ routes: {} }, body);

  setTimeout(function () {
    expect(body.children.length).toBe(0);
    expect(count).toBe(1);
    done();
  });
});
