import { page, styleSheet } from "vasille-web";
import { Panel } from "../components/Panel.js";

export default page(async () => {
  <Panel />;
});

const styles = styleSheet({
  styled: {
    position: "fixed",
    inset: 0,
    background: "linear-gradient(45deg, #c94743, #8914a1, #41a3ff)",
    color: "white",
    display: "flex",
    "justify-content": "center",
    "align-items": "center",
    "font-size": "64px",
    "font-family": '"Noto Sans", Helvetica, sans-serif',
  },
});
