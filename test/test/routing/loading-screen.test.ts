import { routerApp } from "vasille-web";
import { Router } from "vasille-router/web-router";
import {
  Component1,
  Component2,
  rvComponent1,
  rvComponent2,
  LoadingScreen,
  LoadingOverlay,
  Component3,
  rvComponent3,
} from "../../src/routing/router";
import { page } from "../page";

it("loading screen/overlay test", function (done) {
  const body = page.window.document.body;

  const app = routerApp(
    {
      loadingScreen: LoadingScreen,
      loadingOverlay: LoadingOverlay,
      routes: {
        "/": { screen: Component1 },
        "/page2": { screen: Component2 },
        "/page3": { screen: Component3 },
      },
    },
    body,
  );
  const router = (app.runner as any).router as Router<string>;

  setTimeout(function () {
    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("loading");
    rvComponent1?.(1);

    setTimeout(function () {
      expect(body.children.length).toBe(1);
      expect(body.children[0].innerHTML).toBe("component 1");
      router.navigate("/page2", {}, "loading-screen");

      setTimeout(function () {
        expect(body.children.length).toBe(1);
        expect(body.children[0].innerHTML).toBe("loading");
        rvComponent2?.(2);

        setTimeout(function () {
          expect(body.children.length).toBe(1);
          expect(body.children[0].innerHTML).toBe("component 2");
          router.navigate("/page3", {}, "loading-overlay");

          setTimeout(function () {
            expect(body.children.length).toBe(2);
            expect(body.children[0].innerHTML).toBe("component 2");
            expect(body.children[1].innerHTML).toBe("loading overlay");
            rvComponent3?.(3);

            setTimeout(function () {
              expect(body.children.length).toBe(1);
              expect(body.children[0].innerHTML).toBe("component 3");
              done();
            });
          });
        });
      });
    });
  });
});
