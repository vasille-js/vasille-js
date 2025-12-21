import { component, dark, Delay, For, styleSheet } from "vasille-web";

interface TabItem {
  label: string;
  class: string;
  content: () => (o: object) => void;
}

interface Props {
  tabs: TabItem[];
}

export const CodeTabs = component<Props>(({ tabs }) => {
  let $currentTab = tabs[0].class;

  <div class={[styles.container]}>
    <div class={styles.tabs}>
      <For
        of={tabs}
        slot={(item) => {
          <div
            class={[styles.tab, item.class === $currentTab && styles.activeTab]}
            onclick={() => ($currentTab = item.class)}
          >
            {item.label}
          </div>;
        }}
      />
    </div>
    <Delay time={100}>
      <div class={styles.code}>
        <For
          of={tabs}
          slot={(item) => {
            const Content = item.content();

            <Delay time={100}>
              <div
                class={[
                  styles.snippet,
                  item.class === $currentTab && styles.active,
                ]}
              >
                <Content />
              </div>
            </Delay>;
          }}
        />
      </div>
    </Delay>
  </div>;
});

const styles = styleSheet({
  container: {
    display: "flex",
    "border-radius": 16,
    background: ["#F9F9F9", dark("#2A2A2A")],
    transition: "background 0.2s ease-in-out",
    padding: 16,
    width: "100%",
    "max-width": 1025,
    "content-visibility": "auto",
    "contain-intrinsic-size": "300px",
    "box-sizing": "border-box",
  },
  tabs: {
    display: "flex",
    "flex-direction": "column",
    flex: "1",
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
  },
  activeTab: {
    background: ["#fff", dark("#191919")],
    ":hover": {
      background: ["#fcfcfc", dark("#232323")],
    },
    color: ["#b20000", dark("#ff946a")],
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
    opacity: "0",
    transition: "opacity 0.2s ease-in-out",
    "margin-right": 16,
    "z-index": "0",
  },
  active: {
    opacity: "1",
    "z-index": "1",
  },
});
