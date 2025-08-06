import { view, watch } from "vasille-web";

export let control: { setValue(value: string): void; } | undefined = undefined;

export const Watch = view(() => {
  let name = "Vasille";
  let external = "test";

  control = {
    setValue(value: string) {
      external = value;
    }
  };

  watch(() => {
    name = '+' + external;
  });

  <div>
    Hello {name}!
  </div>;
});
