import {
  beforeDestroy,
  component,
  dark,
  For,
  styleSheet,
  watch,
} from "steel-frame";
import { Row } from "./code-block/lib/Row.js";
import { Button } from "./Button.js";
import itemSvg from "../assets/item.svg";
import devStepsSvg from "../assets/devSteps.svg";

interface GridProps {
  $active: boolean;
  maskPosX: number;
  maskPosY: number;
}

interface CellProps extends GridProps {
  row: number;
  col: number;
  ontransitionend(): void;
}

const Cell = component<CellProps>(
  ({ row, col, $active, maskPosX, maskPosY, ontransitionend }) => {
    const inactiveClass =
      col % 2 === 0 ? styles.blockInactiveEven : styles.blockInactiveOdd;
    let $class = $active ? "active" : inactiveClass;

    watch(() => {
      $class = $active ? "active" : inactiveClass;
    });

    <div
      class={styles.cell}
      style={{
        top: `${(row / 4) * 100}%`,
        left: `${(col / 4) * 100}%`,
      }}
    >
      <div
        class={[styles.block, $class]}
        style={{
          "transition-delay": `${0.2 + row * 0.25}s`,
        }}
        ontransitionend={() => {
          if (row === 3 && col === 3) {
            ontransitionend();
          }
        }}
      >
        <div
          class={[
            styles.block,
            row % 2 === 0 ? styles.blockDarkEven : styles.blockDarkOdd,
          ]}
          style={{
            "background-color": "#ffffff",
            "mask-position": [-(maskPosX + 64 * col), -(maskPosY + 64 * row)],
            "mask-image": `url("${devStepsSvg}")`,
            "transition-delay": `${0.2 + row * 0.5}s`,
          }}
        />
        <div
          class={[
            styles.block,
            row % 2 === 0 ? styles.blockLightEven : styles.blockLightOdd,
          ]}
          style={{
            "background-color": "#191919",
            "mask-position": [-(maskPosX + 64 * col), -(maskPosY + 64 * row)],
            "mask-image": `url("${devStepsSvg}")`,
            "transition-delay": `${0.2 + row * 0.5}s`,
          }}
        />
      </div>
    </div>;
  },
);

const indices = [0, 1, 2, 3].map((row) =>
  [0, 1, 2, 3].map((col) => ({ row, col })),
);
const flatIndices = indices.flat();

const Grid = component<GridProps>(({ $active, maskPosX, maskPosY }) => {
  let $localActive = $active;
  let $display = $active ? "block" : "none";

  watch(() => {
    if ($active) {
      $display = "block";
      requestAnimationFrame(() => {
        $localActive = true;
      });
    } else {
      $localActive = false;
    }
  });

  <div class={styles.grid} style={{ display: $display }}>
    <For
      of={flatIndices}
      slot={(props) => (
        <Cell
          {...props}
          $active={$localActive}
          maskPosX={maskPosX}
          maskPosY={maskPosY}
          ontransitionend={() => {
            if (!$active) {
              $display = "none";
            }
          }}
        />
      )}
    />
  </div>;
});

interface Item {
  id: string;
  title: string;
  descTitle: string;
  descBody: string;
  maskPosX: number;
  maskPosY: number;
  link: string;
}

interface Props {
  items: Item[];
  id: string;
}

export const Accordion = component<Props>(({ items, id }) => {
  let $current = localStorage.getItem(id) ?? items[0].id;

  watch(() => {
    localStorage.setItem(id, $current);
  });

  <Row class={styles.bg}>
    <div class={styles.image}>
      <div class={styles.gridsContainer}>
        <For
          of={items}
          slot={(item) => {
            <Grid
              $active={$current === item.id}
              maskPosX={item.maskPosX}
              maskPosY={item.maskPosY}
            />;
          }}
        />
      </div>
    </div>
    <div class={styles.items}>
      <For
        of={items}
        slot={(item) => {
          const $isCurrent = $current === item.id;
          const isLast = items.at(-1) === item;
          let $bodyHeight = 0;
          const resizeObserver = new ResizeObserver((entries) => {
            $bodyHeight = entries[0].contentRect.height;
          });
          let $descriptionDisplay = "flex";
          let $descriptionTransform = "translateX(0)";
          let $buttonTransform = "translateY(0)";
          let $inited = false;

          watch(() => {
            if ($isCurrent) {
              $descriptionDisplay = "flex";
              requestAnimationFrame(() => {
                $descriptionTransform = "translateX(0)";
                $buttonTransform = "translateY(0)";
              });
            } else {
              $descriptionTransform = "translateX(100%)";
              $buttonTransform = "translateY(-100%)";
            }
          });

          <div class={styles.item}>
            <div
              class={styles.itemTitle}
              onclick={() => ($current = item.id)}
              style={{ cursor: $isCurrent ? "default" : "pointer" }}
            >
              <div style={{ flex: "1" }}>// {item.title}</div>
              <div
                class={[styles.round, styles.roundBg]}
                style={{
                  transform: $isCurrent ? "rotate(45deg)" : "rotate(-45deg)",
                }}
              >
                <div class={styles.roundRow}>
                  <div
                    class={[styles.round, styles.roundFg]}
                    style={{
                      "mask-image": `url("${itemSvg}")`,
                      "background-color": "#191919",
                    }}
                  />
                  <div
                    class={[styles.round, styles.roundFg]}
                    style={{
                      "mask-image": `url("${itemSvg}")`,
                      "background-color": "#FFFFFF",
                    }}
                  />
                </div>
              </div>
            </div>
            <div
              style={{
                height:
                  $current === item.id
                    ? $bodyHeight > 0 || $inited
                      ? $bodyHeight
                      : "auto"
                    : 0,
                overflow: "hidden",
                transition: "height 1s ease",
              }}
            >
              <div
                callback={(div) => {
                  resizeObserver.observe(div);
                  $bodyHeight = div.offsetHeight;
                  $inited = true;
                  if (!$isCurrent) {
                    $descriptionDisplay = "none";
                  }
                }}
                ontransitionend={() => {
                  if (!$isCurrent) {
                    $descriptionDisplay = "none";
                  }
                }}
                style={{
                  transform: $descriptionTransform,
                  transition: "transform 1s ease",
                  display: $descriptionDisplay,
                  "flex-direction": "column-reverse",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: [6, 0, 20],
                    transition: "transform 0.5s ease",
                    "transition-delay": $isCurrent ? "0.5s" : "0s",
                    transform: $buttonTransform,
                  }}
                >
                  <Button text={"Learn More"} />
                </div>
                <div class={styles.itemDesc}>
                  <div class={styles.itemDescTitle}>
                    <div class={styles.double}>
                      <div class={styles.half} style={{ color: "#FFFFFF" }}>
                        {item.descTitle}
                      </div>
                      <div class={styles.half} style={{ color: "#191919" }}>
                        {item.descTitle}
                      </div>
                    </div>
                  </div>
                  <div class={styles.itemDescBody}>
                    <div
                      class={styles.double}
                      style={{ "transition-delay": "0.5s" }}
                    >
                      <div class={styles.half} style={{ color: "#C5C5C5" }}>
                        {item.descBody}
                      </div>
                      <div class={styles.half} style={{ color: "#605F5F" }}>
                        {item.descBody}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div
              class={styles.hr}
              style={{ width: $isCurrent || isLast ? 0 : "100%" }}
            ></div>
          </div>;

          beforeDestroy(() => {
            resizeObserver.disconnect();
          });
        }}
      />
    </div>
  </Row>;
});

const styles = styleSheet({
  bg: {
    flex: "1",
    display: "flex",
    "border-radius": 16,
    "background-color": ["#F9F9F9", dark("#2A2A2A")],
    transition: "background-color 0.2s ease-in-out",
    padding: [24, 12],
  },
  image: {
    flex: "1",
    display: "flex",
    "align-items": "center",
    "justify-content": "center",
    overflow: "hidden",
  },
  items: {
    flex: "1",
    display: "flex",
    "flex-direction": "column",
    "align-items": "stretch",
  },
  item: {
    display: "flex",
    "flex-direction": "column",
    "align-items": "stretch",
    overflow: "hidden",
  },
  itemTitle: {
    padding: [18, 10, 18, 0],
    "font-size": 20,
    "font-weight": "500",
    "letter-spacing": "-0.6px",
    "text-transform": "uppercase",
    color: ["#191919", dark("#FFFFFF")],
    transition: "color 0.2s ease-in-out",
    display: "flex",
    "line-height": 24,
  },
  itemDesc: {
    "border-radius": 16,
    padding: [14],
    "margin-right": 14,
    display: "flex",
    "flex-direction": "column",
    "align-items": "stretch",
    "background-color": ["#EDEDED", dark("#383737")],
    transition: "background-color 2s ease-in-out",
    "z-index": "1",
  },
  itemDescTitle: {
    "font-size": 15,
    "letter-spacing": "-0.3px",
    "font-weight": "500",
    "line-height": "120%",
    "margin-bottom": 16,
    overflow: "hidden",
  },
  itemDescBody: {
    "font-size": 15,
    "letter-spacing": "-0.3px",
    "font-weight": "500",
    overflow: "hidden",
  },
  round: {
    width: 24,
    height: 24,
  },
  roundRow: {
    display: "flex",
    width: 48,
    height: 24,
    transform: ["translateX(-24px)", dark("translateX(0)")],
    transition: "transform 2s ease-in-out 0.2s",
  },
  roundBg: {
    "border-radius": 12,
    overflow: "hidden",
    "background-color": ["#191919", dark("#FFFFFF")],
    transition: "background-color 2s ease-in-out, transform 1s ease-in-out",
  },
  roundFg: {
    transition: "background-color 0.2s ease-in-out",
    "mask-size": [24, 24],
    transform: "rotate(45deg)",
  },
  hr: {
    height: 2,
    "background-color": [dark("#373737"), "#EFEFEF"],
    transition: "width 1s ease, background-color 0.2s ease-in-out",
  },
  double: {
    display: "flex",
    transform: ["translateX(-50%)", dark("translateX(0)")],
    transition: "transform 1s ease",
    width: "200%",
  },
  half: {
    flex: 1,
  },
  gridsContainer: {
    width: 256,
    height: 256,
    position: "relative",
  },
  grid: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  cell: {
    display: "block",
    width: "25%",
    height: "25%",
    position: "absolute",
  },
  block: {
    display: "block",
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    "mask-size": [512, 512],
    transition: "transform 2s ease, opacity 2s ease",
  },
  blockInactiveOdd: {
    transform: "translateY(-400%)",
    opacity: "0",
  },
  blockInactiveEven: {
    transform: "translateY(400%)",
    opacity: "0",
  },
  blockLightOdd: {
    transform: ["translateX(0)", dark("translateX(-400%)")],
    opacity: ["1", dark("0")],
  },
  blockLightEven: {
    transform: ["translateX(0)", dark("translateX(400%)")],
    opacity: ["1", dark("0")],
  },
  blockDarkOdd: {
    transform: ["translateX(400%)", dark("translateX(0%)")],
    opacity: ["0", dark("1")],
  },
  blockDarkEven: {
    transform: ["translateX(-400%)", dark("translateX(0%)")],
    opacity: ["0", dark("1")],
  },
});
