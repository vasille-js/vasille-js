// import {app,point, ref, expr } from "../src/index";
import { ref, value, watch, v } from "vasille-less";
import { MagicApp } from "./components/magic-app";
import { CoreApp } from "./components/core-app";
import { LessApp } from "./components/less-app";
const Test = v.app(() => {
    let [x, setX] = ref(0);
    let y = "were";
    let div = value(undefined);
    const [bool] = ref(true);
    watch($bool => {
        const y = $bool;
    }, bool);
    (() => {
        (function () {
            const vasille_magic_internal_$$$ = v.create(new CoreApp({ "inp-ut": "" }), () => {
                v.text("Test");
            });
            v.sv(x, vasille_magic_internal_$$$.y);
            y = vasille_magic_internal_$$$.s;
        })();
        (function () {
            const vasille_magic_internal_$$$ = LessApp({ "inp-ut": "" }, () => {
                v.text("Test");
            });
            v.sv(x, vasille_magic_internal_$$$.y);
            y = vasille_magic_internal_$$$.x;
        })();
        v.sv(x, MagicApp({ "inp-ut": "" }, () => {
            v.text("Test");
        }).y);
        v.sv(div, v.tag("div", {}, () => {
            v.tag("span", { "v:events": { click: () => setX(3) } }, () => {
                v.text("String $");
                v.text(v.expr($x => `sd${$x}`, x));
            });
            v.tag("div", { "v:attr": { dir: 'ltr' } }, () => {
                v.tag("h1", { class: ["23", "21", "2323"] }, () => {
                    v.text("Header ");
                    v.text(y);
                });
            });
        }).node);
        v.if(bool, () => {
            v.text("0.1\n");
        });
        v.else(() => {
            v.text("0.2\n");
        });
        v.if(bool, () => {
            v.text("1.1\n");
        });
        v.elif(bool, () => {
            v.text("1.2\n");
        });
        v.else(() => {
            v.text("1.3\n");
        });
    })()
    console.log('div', div);
    return {};
});
const Test1 = v.reactive(() => {
    return {};
});
Test(document.body, {});
