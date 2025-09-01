import { compose } from "vasille-web";

const C = compose(() => {
  let $a = "auto";
  const b = "auto";

  <div
    style={{
      ...{ margin: "1px" },
      width: "100px",
      height: 50,
      padding: [1, 2, 3, 4],
      "margin-left": $a,
    }}
  />;
  <div style="margin: 20px;" />;
  <div style={"margin: 20px;"} />;
  <div style={`margin: ${$a}`} />;
  <div style={`margin: ${b}`} />;
});
