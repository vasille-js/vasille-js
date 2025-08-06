import { view } from "vasille-web";

export let control: {
  setValue(value: number): void;
  updatePointer(): void;
} | undefined = undefined;

export const Component = view(() => {
  let r = 2;
  let point = r + 1;

  control = {
    setValue(value: number) {
      r = value;
    },
    updatePointer() {
      point = r + 3;
    }
  };

  <div>
    Hello {point}!
  </div>;
});

