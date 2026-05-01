import {
  afterMount,
  awaited,
  dark,
  Delay,
  Else,
  ElseIf,
  If,
  mobile,
  page,
  styleSheet,
  Watch,
} from "steel-frame";
import { Panel } from "./../components/Panel.js";
import { HeroView } from "../views/HeroView.js";
import { DescriptionView } from "../views/DescriptionView.js";
import { GetStartedView } from "../views/GetStartedView.js";
import { GameChangerView } from "../views/GameChangerView.js";
import { ErrorsStopHereView } from "../views/ErrorsStopHereView.js";
import { GreatForView } from "../views/GreatForView.js";
import { VisibilityTracker } from "../components/code-block/VisibilityTracker.js";
import { ExperienceView } from "../views/ExperienceView.js";
import { ReadyView } from "../views/ReadyView.js";
import { Button } from "../components/Button.js";

export default page(async () => {
  const [$err, $next, retry] = awaited(() => import("./../views/AllView.js"));
  const $AllView = $next?.AllView;

  <div class={styles.page}>
    <VisibilityTracker>
      <HeroView />
    </VisibilityTracker>
    <main role="main" class={styles.bigScreen}>
      <If
        $condition={$AllView}
        slot={(AllView) => {
          <AllView />;
        }}
      />
      <ElseIf $condition={$err}>
        <div style={{ "align-self": "center", display: "flex" }}>
          <Button text={"Retry"} action={retry} />
        </div>
      </ElseIf>
      <Else>
        <div
          style={{
            display: "flex",
            "justify-content": "center",
            width: "100%",
          }}
        >
          <div
            class="loader"
            style={{ margin: [40, 0], "align-self": "center" }}
          ></div>
        </div>
      </Else>
    </main>
    <Delay time={1}>
      <Panel />
    </Delay>
  </div>;
});

const styles = styleSheet({
  page: {
    display: "flex",
    "align-items": "stretch",
    "flex-direction": "column",
    "padding-left": [97, mobile(0)],
  },
  bigScreen: {
    display: "flex",
    "align-items": "stretch",
    "flex-direction": "column",
  },
  bg: {
    flex: "1",
  },
});
