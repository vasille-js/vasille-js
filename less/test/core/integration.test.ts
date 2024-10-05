import {Component, TagOptions} from "vasille";
import {app, v} from "../../src";
import {page} from "../page";

interface Options extends TagOptions<'button'> {
    color: string;
}

class Button extends Component<Options> {
    protected compose(input: Options): Options["return"] {
        this.tag("button", {style: {'background-color': input.color}});
        return {};
    }
}

const myMapp = app(() => {
    v.create(new Button({color: 'red'}));
    return {};
});


it('Integration', function () {
    myMapp(page.window.document.body, {});
    expect(page.window.document.body.children[0].tagName).toBe('BUTTON');
});
