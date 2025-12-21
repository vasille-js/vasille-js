import { Delay, page, styleSheet } from "vasille-web";
import { Panel } from "./../components/Panel.js";
import { HeroView } from "../views/HeroView.js";
import { DescriptionView } from "../views/DescriptionView.js";
import { GetStartedView } from "../views/GetStartedView.js";

export default page(async () => {
  <div class={styles.page}>
    <HeroView />
    <div class={styles.bigScreen}>
      {/*<div class={styles.bg} />*/}
      <Delay time={10}>
        <div class={styles.content}>
          <DescriptionView />
          <GetStartedView />
        </div>
      </Delay>
      {/*<div class={styles.bg} />*/}
    </div>
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
  bigScreen: {
    display: "flex",
    "align-items": "stretch",
  },
  bg: {
    flex: "1",
  },
  content: {
    flex: "9999",
    // "max-width": 1025,
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
  },
});
