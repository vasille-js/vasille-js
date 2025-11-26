import { component } from "steel-frame";

const C = component(() => {
  <div>
    <span>text</span>
  </div>;
});

const C2 = component(() => {
  <C />;
});
