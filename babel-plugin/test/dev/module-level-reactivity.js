const VasilleFilePath = "babel-plugin-vasille/test/dev/module-level-reactivity.ts";
import { arrayModel, bind, mapModel, ref, setModel } from "steel-frame";
let $a = ref(2, null, [VasilleFilePath, 3, 4, 3, 15]);
let $sum = bind(null, Vasille_0 => Vasille_0 + 1, [$a], ["$a"], [VasilleFilePath, 4, 4, 4, 23]);
const array = arrayModel([VasilleFilePath, 6, 14, 6, 26], null, void 0);
const set = setModel([VasilleFilePath, 7, 12, 7, 22], null, void 0);
const map = mapModel([VasilleFilePath, 8, 12, 8, 22], null, void 0);