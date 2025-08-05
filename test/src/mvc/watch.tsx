import { bridge, compose } from "vasille-web";

const name = bridge.ref("Vasille");
const external = bridge.ref("test");

export let control: { setValue(value: string): void; } | undefined = {
  setValue(value: string) {
    bridge.setValue(external, value);
  }
};

bridge.watch(() => {
  bridge.setValue(name, '+' + bridge.value(external));
})

export const Watch = compose(() => {
  <div>
    Hello {name}!
  </div>;
});
