import { compose } from "vasille-dx";

export const C = compose(() => {
  let a = "auto";

  <div
    style={{
      ...{ margin: "1px" },
      width: "100px",
      height: 50,
      padding: [1, 2, 3, 4],
      "margin-left": a,
    }}
  />;
  <div style="margin: 20px;" />;
  <div style={"margin: 20px;"} />;
  <div style={`margin: ${a}`} />;
});
