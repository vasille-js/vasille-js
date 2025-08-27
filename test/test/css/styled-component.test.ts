import { mount } from "vasille-web";
import { StyledComponent } from "../../src/css/StyledComponent";
import { page } from "../page";

it("styled component", function () {
  const body = page.window.document.body;

  mount(body, StyledComponent, {});

  expect(body.children.length).toBe(8);

  // common
  expect(page.window.getComputedStyle(body.children[0]).margin).toBe("5px");
  expect(page.window.getComputedStyle(body.children[0]).padding).toBe("10px 5px");

  // dark
  expect(page.window.getComputedStyle(body.children[1]).background).toBe("rgb(255, 255, 255)");
  body.className = "dark";
  expect(page.window.getComputedStyle(body.children[1]).background).toBe("rgb(0, 0, 0)");

  // theme
  expect(page.window.getComputedStyle(body.children[2]).background).toBe("rgb(255, 255, 255)");
  body.className = "red";
  expect(page.window.getComputedStyle(body.children[2]).background).toBe("rgb(255, 0, 0)");
  body.className = "green";
  expect(page.window.getComputedStyle(body.children[2]).background).toBe("rgb(0, 128, 0)");

  // @media queries are ignored by jsdom, we cannot improve the next tests

  // prefers light
  expect(page.window.getComputedStyle(body.children[3]).background).toBe("rgb(255, 255, 255)");

  // prefers dark
  expect(page.window.getComputedStyle(body.children[4]).background).toBe("rgb(0, 0, 0)");

  // mobile
  expect(page.window.getComputedStyle(body.children[5]).margin).toBe("10px");

  // tablet
  expect(page.window.getComputedStyle(body.children[6]).margin).toBe("10px");

  // laptop
  expect(page.window.getComputedStyle(body.children[7]).margin).toBe("10px");
});
