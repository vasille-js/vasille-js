import {
  component,
  dark,
  Delay,
  For,
  mobile,
  styleSheet,
  tablet,
  watch,
} from "steel-frame";
import { MAX_WIDTH } from "./lib/limits.js";
import { VisibilityTracker } from "./VisibilityTracker.js";

interface TabItem {
  label: string;
  class: string;
  content: () => (o: object) => void;
}

interface Props {
  tabs: TabItem[];
  storageKey: string;
}

export const CodeTabs = component<Props>(({ tabs, storageKey }) => {
  let $currentTab = localStorage.getItem(storageKey) ?? tabs[0].class;
  let $minHeight = 0;

  watch(() => {
    localStorage.setItem(storageKey, $currentTab);
  });

  <div class={styles.padding}>
    <div class={[styles.container]} style={{ "max-width": MAX_WIDTH }}>
      <div class={styles.tabsContainer}>
        <div class={styles.tabs}>
          <For
            of={tabs}
            slot={(item) => {
              <div
                class={[
                  styles.tab,
                  item.class === $currentTab && styles.activeTab,
                ]}
                onclick={() => ($currentTab = item.class)}
                onkeydown={(ev) => {
                  if (ev.key === "Enter" || ev.key === " ") {
                    $currentTab = item.class;
                  }
                }}
                tabindex={$currentTab === item.class ? "-1" : "0"}
              >
                {item.label}
              </div>;
            }}
          />
        </div>
      </div>
      <Delay time={100}>
        <div
          class={styles.code}
          style={{ "min-height": $minHeight > 0 ? $minHeight : 304 }}
        >
          <For
            of={tabs}
            slot={(item) => {
              const Content = item.content();
              const $visible = item.class === $currentTab;
              let $display = "flex";
              let $opacity = "1";

              watch(() => {
                if ($visible) {
                  $display = "flex";
                  requestAnimationFrame(() => {
                    $opacity = "1";
                  });
                } else {
                  $opacity = "0";
                }
              });

              <Delay time={1000}>
                <div
                  class={[styles.snippet, $visible && styles.active]}
                  ontransitionend={() => {
                    if (!$visible) {
                      $display = "none";
                    }
                  }}
                  style={{ display: $display, opacity: $opacity }}
                >
                  <VisibilityTracker>
                    <div
                      style={{
                        "flex-direction": "column",
                        "align-self": "stretch",
                      }}
                      callback={(div) => {
                        $minHeight = Math.max(div.offsetHeight, $minHeight);
                        $display = $visible ? "flex" : "none";
                      }}
                    >
                      <Content />
                    </div>
                  </VisibilityTracker>
                </div>
              </Delay>;
            }}
          />
        </div>
      </Delay>
    </div>
  </div>;
});

const styles = styleSheet({
  container: {
    display: "flex",
    "border-radius": 16,
    background: ["#F9F9F9", dark("#2A2A2A")],
    transition: "background 0.2s ease-in-out",
    padding: 16,
    width: ["calc(100dvw - 157px)", mobile("calc(100dvw - 40px)")],
    "box-sizing": "border-box",
    "flex-direction": ["row", tablet(mobile("column"))],
    margin: "0 auto",
  },
  padding: {
    padding: [[0, 20], mobile([0, 10])],
    "align-self": "stretch",
    "max-width": ["calc(100dvw - 97px)", mobile("100%")],
    "box-sizing": "border-box",
  },
  tabsContainer: {
    overflow: "auto",
  },
  tabs: {
    display: "flex",
    "flex-direction": ["column", tablet(mobile("row"))],
    flex: "1",
    width: "max-content",
    overflow: "auto",
  },
  tab: {
    "font-size": 18,
    padding: [10, 20],
    "border-radius": 10,
    color: ["#191919", dark("#fff")],
    cursor: "pointer",
    margin: [4, 10, 4, 0],
    background: ["#19191900", dark("#ffffff00")],
    ":hover": {
      background: ["#19191910", dark("#ffffff10")],
    },
    transition: "background 0.2s ease-in-out, color 0.2s ease-in-out",
    ":focus-visible": {
      "outline-offset": "-4px",
    },
  },
  activeTab: {
    background: ["#fff", dark("#191919")],
    ":hover": {
      background: ["#fcfcfc", dark("#232323")],
    },
    color: ["#e10000", dark("#ff946a")],
  },
  code: {
    position: "relative",
    flex: "2",
    background: ["#FFF", dark("#191919")],
    "border-radius": 16,
    transition: "background 0.2s ease-in-out",
  },
  snippet: {
    position: "absolute",
    inset: 0,
    padding: 10,
    overflow: "auto",
    transition: "opacity 0.2s ease-in-out",
    "z-index": "0",
  },
  active: {
    "z-index": "1",
  },
});
