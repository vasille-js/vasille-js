import { compose } from "vasille-web";

export let control: { setValue(value: string): void; } | undefined = undefined;

export const Component = compose(() => {
  let text = "test";

  control = {
    setValue(value: string) {
      text = value;
    }
  };

  <div>
    Hello {text}!
  </div>;
});

