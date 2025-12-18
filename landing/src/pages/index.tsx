import { page, styleSheet } from "vasille-web";
import { Panel } from "./../components/Panel.js";
import { HeroView } from "../views/HeroView.js";

export default page(async () => {
  <div class={styles.page}>
    <HeroView />
    <Panel />
  </div>;
});

const styles = styleSheet({
  page: {
    display: "flex",
    "align-items": "stretch",
    "flex-direction": "column",
    "padding-left": 97,
  },
});
