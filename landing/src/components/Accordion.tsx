import {
  beforeDestroy,
  component,
  dark,
  Delay,
  Else,
  For,
  If,
  raw,
  styleSheet,
  tablet,
  watch,
} from "steel-frame";
import { Row as ViewRow } from "./code-block/lib/Row.js";
import { Button } from "./Button.js";
import itemSvg from "../assets/item.svg";
import devStepsSvg from "../assets/devSteps.svg";

interface GridProps {
  $active: boolean;
  maskPosX: number;
  maskPosY: number;
}

interface RowProps extends GridProps {
  row: number;
  color: string;
  classes: [string, string];
  ontransitionend(): void;
}

interface CellProps extends Omit<RowProps, "classes"> {
  col: number;
}

const Cell = component<CellProps>(
  ({ row, col, $active, maskPosX, maskPosY, ontransitionend, color }) => {
    const inactiveClass =
      col % 2 === 0 ? styles.cellInactiveEven : styles.cellInactiveOdd;
    let $class = $active ? "active" : inactiveClass;

    watch(() => {
      $class = $active ? "active" : inactiveClass;
    });

    <div
      class={[styles.cell, $class]}
      style={{
        top: 0,
        left: `${(col / 4) * 100}%`,
        "background-color": color,
        "mask-position": [-(maskPosX + 64 * col), -(maskPosY + 64 * row)],
        "mask-image": `url("${devStepsSvg}")`,
        "transition-delay": `${0.2 + row * 0.5}s`,
      }}
      ontransitionend={() => {
        if (col === 3 && row === 3) {
          ontransitionend();
        }
      }}
    ></div>;
  },
);

const Row = component<RowProps>(
  ({ row, $active, maskPosX, maskPosY, ontransitionend, color, classes }) => {
    <div
      style={{ top: `${row * 25}%`, "transition-delay": `${row * 0.5}s` }}
      class={[styles.line, classes[row % 2]]}
    >
      <For
        of={[0, 1, 2, 3]}
        slot={(col) => {
          <Cell
            color={color}
            row={row}
            col={col}
            $active={$active}
            maskPosX={maskPosX}
            maskPosY={maskPosY}
            ontransitionend={ontransitionend}
          />;
        }}
      />
    </div>;
  },
);

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

  function onTransitionEnd() {
    if (!$active) {
      $display = "none";
    }
  }

  <div class={styles.grid} style={{ display: $display }}>
    <For
      of={[0, 1, 2, 3]}
      slot={(row) => {
        <Delay time={5}>
          <Row
            row={row}
            color={"#191919"}
            $active={$localActive}
            maskPosX={maskPosX}
            maskPosY={maskPosY}
            ontransitionend={onTransitionEnd}
            classes={[styles.rowLightOdd, styles.rowLightEven]}
          />
          <Row
            row={row}
            color={"#ffffff"}
            $active={$localActive}
            maskPosX={maskPosX}
            maskPosY={maskPosY}
            ontransitionend={onTransitionEnd}
            classes={[styles.rowDarkOdd, styles.rowDarkEven]}
          />
        </Delay>;
      }}
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

interface ItemContentProps {
  item: Item;
  $current: string;
  $isCurrent: boolean;
  $bodyHeight: number;
  $inited: boolean;
  $descriptionDisplay: string;
  $descriptionTransform: string;
  $buttonTransform: string;
  resizeObserver: ResizeObserver;
}

const ItemContent = component<ItemContentProps>(
  ({
    item,
    $inited,
    $bodyHeight,
    $buttonTransform,
    $descriptionTransform,
    $descriptionDisplay,
    $current,
    $isCurrent,
    resizeObserver,
  }) => {
    <div
      style={{
        height: $current === item.id ? ($inited ? $bodyHeight : "auto") : 0,
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
          <Button text={"Learn More"} primary />
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
            <div class={styles.double} style={{ "transition-delay": "0.5s" }}>
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
    </div>;
  },
);

export const Accordion = component<Props>(({ items, id }) => {
  let $current = localStorage.getItem(id) ?? items[0].id;

  watch(() => {
    localStorage.setItem(id, $current);
  });

  <ViewRow class={styles.bg}>
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
            const height = entries[0].contentRect.height;
            if (height > 0) {
              $bodyHeight = height;
            }
          });
          let $descriptionDisplay = "flex";
          let $descriptionTransform = "translateX(0)";
          let $buttonTransform = "translateY(0)";
          let $inited = false;
          const isCurrent = raw($isCurrent);

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
              class={[styles.itemTitle, $isCurrent && styles.active]}
              onclick={() => ($current = item.id)}
              onkeydown={(ev) => {
                if (ev.key === "Enter" || ev.key === " ") {
                  $current = item.id;
                }
              }}
              style={{ cursor: $isCurrent ? "default" : "pointer" }}
              role="button"
              aria-label={item.title}
              aria-pressed={$isCurrent}
              tabindex={$isCurrent ? "-1" : "0"}
            >
              <div style={{ flex: "1" }}>// {item.title}</div>
              <div
                class={[
                  styles.round,
                  styles.roundBg,
                  $isCurrent && styles.activeBg,
                ]}
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
            <If $condition={isCurrent}>
              <ItemContent
                item={item}
                $current={$current}
                $isCurrent={$isCurrent}
                $bodyHeight={$bodyHeight}
                $inited={$inited}
                $descriptionDisplay={$descriptionDisplay}
                $descriptionTransform={$descriptionTransform}
                $buttonTransform={$buttonTransform}
                resizeObserver={resizeObserver}
              />
            </If>
            <Else>
              <Delay time={0}>
                <ItemContent
                  item={item}
                  $current={$current}
                  $isCurrent={$isCurrent}
                  $bodyHeight={$bodyHeight}
                  $inited={$inited}
                  $descriptionDisplay={$descriptionDisplay}
                  $descriptionTransform={$descriptionTransform}
                  $buttonTransform={$buttonTransform}
                  resizeObserver={resizeObserver}
                />
              </Delay>
            </Else>
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
  </ViewRow>;
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
    "@media screen and (max-width: 1000px)": {
      "max-width": 256,
    },
    "@media screen and (max-width: 800px)": {
      display: "none",
    },
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
    ":focus-visible": {
      "outline-color": ["#e10000", dark("#ff946a")],
      "outline-width": 2,
      "outline-offset": "-2px",
    },
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
    "margin-left": 10,
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
  line: {
    position: "absolute",
    width: "100%",
    height: "25%",
    transition: "transform 2s ease, opacity 2s ease",
  },
  cell: {
    display: "block",
    width: "25%",
    height: "100%",
    position: "absolute",
    "mask-size": [512, 512],
    transition: "transform 2s ease, opacity 2s ease",
  },
  cellInactiveOdd: {
    transform: "translateY(-400%)",
    opacity: "0",
  },
  cellInactiveEven: {
    transform: "translateY(400%)",
    opacity: "0",
  },
  rowLightOdd: {
    transform: ["translateX(0)", dark("translateX(-100%)")],
    opacity: ["1", dark("0")],
  },
  rowLightEven: {
    transform: ["translateX(0)", dark("translateX(100%)")],
    opacity: ["1", dark("0")],
  },
  rowDarkOdd: {
    transform: ["translateX(100%)", dark("translateX(0%)")],
    opacity: ["0", dark("1")],
  },
  rowDarkEven: {
    transform: ["translateX(-100%)", dark("translateX(0%)")],
    opacity: ["0", dark("1")],
  },
  active: {
    color: ["#e10000", dark("#ff946a")],
  },
  activeBg: {
    "background-color": ["#e10000", dark("#ff946a")],
  },
});
