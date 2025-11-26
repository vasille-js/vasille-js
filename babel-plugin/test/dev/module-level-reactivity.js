const VasilleFilePath = "babel-plugin-vasille/test/dev/module-level-reactivity.ts";
import { arrayModel, bind, mapModel, ref, setModel, earlyInspector as VasilleInspector } from "steel-frame";
let $a = ref(2, [VasilleFilePath, 3, 4, 3, 15], VasilleInspector);
let $sum = bind(null, Vasille_0 => Vasille_0 + 1, [$a], ["$a"], [VasilleFilePath, 4, 4, 4, 23], VasilleInspector);
const array = arrayModel(VasilleInspector, null, void 0);
const set = setModel(VasilleInspector, null, void 0);
const map = mapModel(VasilleInspector, null, void 0);