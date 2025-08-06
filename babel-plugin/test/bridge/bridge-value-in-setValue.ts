import { bridge } from "vasille-web";

const a = bridge.ref(2);
const b = bridge.ref(3);

bridge.watch(() => {
  bridge.setValue(b, 2 + bridge.value(a));
});
