import { compose } from "vasille-dx";

export const C1 = compose(() => {
  <div />;
});

export const C2 = compose(() => {
  <div>
    <C1 />
  </div>;
  <C1 />;
});
