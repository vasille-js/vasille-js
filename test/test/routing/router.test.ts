import { routerApp } from "vasille-web";
import { Router } from "vasille-router/web-router";
import { UserScreen, FailScreen, IndexScreen, ErrorView, FallbackView } from "../../src/routing/router";
import { page } from "../page";

it("routing test", function (done) {
  const body = page.window.document.body;

  const app = routerApp(
    {
      fallbackScreen: FallbackView,
      errorScreen: ErrorView,
      routes: {
        "/index": { screen: IndexScreen },
        "/user/:id": { screen: UserScreen },
        "/fail": { screen: FailScreen },
      },
    },
    body,
  );
  const router = (app.runner as any).router as Router<string>;

  setTimeout(function () {
    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("fallback");
    router.navigate("/index", {}, "silent");

    setTimeout(function () {
      expect(body.children.length).toBe(1);
      expect(body.children[0].innerHTML).toBe("index");
      router.navigate("/user/:id", { id: "1" }, "silent");

      setTimeout(function () {
        expect(body.children.length).toBe(1);
        expect(body.children[0].innerHTML).toBe("user:1");
        router.navigate("/fail", {}, "silent");

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
