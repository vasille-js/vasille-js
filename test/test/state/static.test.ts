import {mount} from "vasille-web";
import { Static } from "../../src/state/static";
import { page } from "../page";

it("static component", function() {
    const body = page.window.document.body;

    mount(body, Static, {});

    expect(body.children.length).toBe(1);
    expect(body.children[0].innerHTML).toBe("Hello world!");
})
