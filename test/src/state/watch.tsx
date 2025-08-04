import { compose, watch } from "vasille-web";
import { Reference } from "vasille";

export let control: { setValue(value: string): void; } | undefined = undefined;

export const Watch = compose(() => {
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
