import {v} from "../../src";
import {page} from "../page";

it("merge test", function () {

    v.app(() => {
        const c4 = v.ref('c4');
        const target = {
            class: [{
                c1: false,
                c2: true
            }, c4, 'c6']
        };

        v.merge(
            target,
            {
                class: [{
                    c1: true,
                    c3: false
                }]
            },
            {
                class: {
                    $: [],
                    c3: true,
                    c5: true
                }
            }
        )

        expect(target).toEqual({
            class: {
                $: [c4],
                c1: false,
                c2: true,
                c3: false,
                c5: true,
                c6: true
            }
        })

        return {};
    })(page.window.document.body, {});
})
