import { component, ref, view, watch } from "vasille-web";

let $name = ref("Vasille");
let $external = ref("test");

export let control: { setValue(value: string): void } | undefined = {
  setValue(value: string) {
    $external = value;
  },
};

watch(() => {
  $name = "+" + $external;
});

export const WatchTest = component(() => {
  <div>Hello {$name}!</div>;
});
