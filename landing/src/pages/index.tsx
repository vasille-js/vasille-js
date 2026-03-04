import { afterMount, dark, Delay, page, styleSheet } from "steel-frame";
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

export default page(async () => {
  function trackScroll() {
    const key = "scroll";
    const scrollTop = localStorage.getItem(key);
    const scrolling = document.documentElement;

    window.onscroll = () => {
      localStorage.setItem(key, scrolling.scrollTop.toString());
    };

    if (scrollTop) {
      scrolling.scroll({
        top: parseInt(scrollTop),
        behavior: "instant",
      });
    }
  }

  <div class={styles.page}>
    <VisibilityTracker>
      <HeroView />
    </VisibilityTracker>
    <div class={styles.bigScreen}>
      {/*<div class={styles.bg} />*/}
      <Delay time={50}>
        <div class={styles.content}>
          <VisibilityTracker>
            <DescriptionView />
          </VisibilityTracker>
          <Delay time={50}>
            <VisibilityTracker>
              <GetStartedView />
            </VisibilityTracker>
            <Delay time={50}>
              <VisibilityTracker>
                <GameChangerView />
              </VisibilityTracker>
              <Delay time={50}>
                <VisibilityTracker>
                  <ErrorsStopHereView />
                </VisibilityTracker>
                <Delay time={50}>
                  <VisibilityTracker>
                    <GreatForView />
                  </VisibilityTracker>
                  <Delay time={50}>
                    <VisibilityTracker>
                      <ExperienceView />
                    </VisibilityTracker>
                    <Delay
                      time={50}
                      slot={() => {
                        <VisibilityTracker>
                          <ReadyView />
                        </VisibilityTracker>;
                        afterMount(() => {
                          trackScroll();
                        });
                      }}
                    />
                  </Delay>
                </Delay>
              </Delay>
            </Delay>
          </Delay>
        </div>
      </Delay>
      {/*<div class={styles.bg} />*/}
    </div>
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
