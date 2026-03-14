import { shadow } from "../../src/lib.js";
import { expr, Switch } from "vasille-jsx";
import { IValue } from "vasille";
import { watch } from "vasille-web";

interface Props {
    $idNumber: IValue<number>;
    $name: string;
    $visible: IValue<boolean>;
    $prop: IValue<number>;
    onHide: () => void;
    onvisible: () => void;
}

export function register() {
    shadow(
        (node, input: Props) => {
            watch(
                node,
                visible => {
                    if (!visible) {
                        input.onHide();
                    } else {
                        input.onvisible();
                    }
                },
                [input.$visible],
            );

            node.tag("div", {}, div => {
                div.text(expr(div, (n1, n2) => `${n1}+${n2}`, [input.$idNumber, input.$prop]));
            });
            node.tag("div", {}, div => {
                div.text(input.$name);
            });
            Switch(
                {
                    cases: [
                        {
                            $case: input.$visible,
                            slot: ctx => {
                                ctx.tag("div", {});
                            },
                        },
                    ],
                },
                node,
            );
        },
        "shadow-node",
        {
            $idNumber: 2,
            $prop: 2,
            $name: 1,
            $visible: 3,
            onHide: 0,
            onvisible: 0,
        },
    );
}
