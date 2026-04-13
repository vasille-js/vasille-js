import { afterMount, Delay, mobile, styleSheet, view } from "steel-frame";
import { VisibilityTracker } from "../components/code-block/VisibilityTracker.js";
import { DescriptionView } from "./DescriptionView.js";
import { GetStartedView } from "./GetStartedView.js";
import { GameChangerView } from "./GameChangerView.js";
import { ErrorsStopHereView } from "./ErrorsStopHereView.js";
import { GreatForView } from "./GreatForView.js";
import { ExperienceView } from "./ExperienceView.js";
import { ReadyView } from "./ReadyView.js";

export const AllView = view(() => {
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
  </div>;
});

const styles = styleSheet({
  content: {
    flex: "9999",
    // "max-width": 1025,
    "max-width": ["calc(100dvw - 97px)", mobile("100%")],
    display: "flex",
    "flex-direction": "column",
    "align-items": "center",
  },
});
