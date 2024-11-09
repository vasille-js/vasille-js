import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "auto";

  <div
    style={{
      width: "100px",
      height: 50,
      padding: [1, 2, 3, 4],
      "margin-left": a,
    }}
  />;
});
