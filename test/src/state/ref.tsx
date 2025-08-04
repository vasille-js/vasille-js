import { compose, ref } from "vasille-web";

export let control: { setValue(value: string): void; } | undefined = undefined;

export const Component = compose(() => {
  let r = ref("test");

  control = {
    setValue(value: string) {
      r = value;
    }
  };

  <div>
    Hello {r}!
  </div>;
});
