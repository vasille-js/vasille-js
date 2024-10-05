// import {app,point, ref, expr } from "../src/index";

import {ref, value, VApp, VReactive, watch} from "vasille-magic";
import {MagicApp} from "./components/magic-app";
import {CoreApp} from "./components/core-app";
import {LessApp} from "./components/less-app";

const Test : VApp = () => {

    let [x, setX] = ref(0);
    let y = "were";
    let div = value<HTMLDivElement|undefined>(undefined);
    const [bool] = ref(true);

    watch(() => {
        const y = bool;
    });

    <>
        <CoreApp inp-ut={""} return={({y: x, s: y})}>Test</CoreApp>
        <LessApp inp-ut={""} return={({y: x, x: y})}>Test</LessApp>
        <MagicApp inp-ut={""} returns:y={x}>Test</MagicApp>
        <div returns:node={div}>
            <span onclick={() => setX(3)}>
                String ${`sd${x}`}
            </span>
            <div dir={'ltr'}>
                <h1 class={'23 21'} class:2323>
                    Header {y}
                </h1>
            </div>
        </div>

        <v-if model={bool}>
            0.1
        </v-if>
        <v-else>
            0.2
        </v-else>

        <v-if model={bool}>
            1.1
        </v-if>
        <v-else model={bool}>
            1.2
        </v-else>
        <v-else>
            1.3
        </v-else>
    </>

    console.log('div', div);

    return {};
}

const Test1 : VReactive = () => {
    return {};
}

Test(document.body, {});
