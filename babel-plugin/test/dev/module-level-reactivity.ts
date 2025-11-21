import { arrayModel, bind, mapModel, ref, setModel } from "vasille-web";

let $a = ref(2);
let $sum = bind($a + 1);

const array = arrayModel();
const set = setModel();
const map = mapModel();
