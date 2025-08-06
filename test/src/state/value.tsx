import { view, value } from "vasille-web";

export let control: { setValue(value: string): void; } | undefined = undefined;

export const Component = view(() => {
  let r = "test";
  const text = value(r);

  control = {
    setValue(value: string) {
      r = value;
    }
  };

  <div>
    Hello {text}!
  </div>;
});

