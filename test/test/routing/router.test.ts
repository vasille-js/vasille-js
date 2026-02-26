import { routerApp } from "steel-frame";
import { Router } from "vasille-router/web-router";
import { x } from "../../src/routing/router";
import { page } from "../page";

it("routing test", function (done) {
  const body = page.window.document.body;

  const app = routerApp(
    {
      fallbackScreen: x.FallbackView,
      errorScreen: x.ErrorView,
      routes: {
        "/index": { screen: x.IndexScreen },
        "/user/(id)": { screen: x.UserScreen },
        "/fail": { screen: x.FailScreen },
      },
    },
    body,
  );
  const router = (app.runner as any).router as Router<string>;

  setTimeout(function () {
    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("fallback");
    router.goTo("/index");

    setTimeout(function () {
      expect(body.children.length).toBe(1);
      expect(body.children[0].innerHTML).toBe("index");
      router.goTo("/user/1");

      setTimeout(function () {
        expect(body.children.length).toBe(1);
        expect(body.children[0].innerHTML).toBe("user:1");
        router.goTo("/fail");

        setTimeout(function () {
          expect(body.children.length).toBe(1);
          expect(body.children[0].className).toBe("error");
          expect(body.children[0].innerHTML).toBe("Error: Fail");
          done();
        });
      });
    });
  });
});
