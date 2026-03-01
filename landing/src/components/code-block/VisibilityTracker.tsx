import { component, Slot, watch, beforeDestroy, styleSheet } from "steel-frame";

interface Props {
  slot(): void;
}

export const VisibilityTracker = component<Props>(({ slot }) => {
  let $visible = true;
  let innerDiv: HTMLDivElement | null = null;
  let observer: IntersectionObserver | null = null;
  let $height = 0;

  watch(() => {
    if (!$visible && innerDiv) {
      $height = innerDiv.offsetHeight;
    }
  });

  <div
    class={styles.div}
    callback={(div) => {
      observer = new IntersectionObserver((entries) => {
        $visible = entries[0].isIntersecting;
      });
      observer.observe(div);
    }}
    style={{ "min-height": $height }}
  >
    <div
      class={[styles.div, styles.inner]}
      style={{ display: $visible ? "flex" : "none" }}
      callback={(div) => {
        $height = div.offsetHeight;
        innerDiv = div;
      }}
    >
      <Slot model={slot} />
    </div>
  </div>;

  beforeDestroy(() => {
    observer?.disconnect();
  });
});

const styles = styleSheet({
  div: {
    width: "100%",
  },
  inner: {
    "flex-direction": "column",
    "align-items": "center",
  },
});
