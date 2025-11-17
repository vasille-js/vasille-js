import { component } from "vasille-web";

const C = component(() => {
  <div>
    <span>text</span>
  </div>;
});

const C2 = component(() => {
  <C />;
});
