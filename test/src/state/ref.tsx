import { view, ref } from "vasille-web";

export let control: { setValue(value: string): void } | undefined = undefined;

export const Component = view(() => {
  let r = ref("test");

  control = {
    setValue(value: string) {
      r = value;
    },
  };

  <div>Hello {r}!</div>;
});
