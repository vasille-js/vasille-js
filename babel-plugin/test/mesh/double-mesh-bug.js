import { component, ref as VasilleRef } from "vasille-web";
const Accordion = component(Vasille => {
  const $bodyHeight = VasilleRef(0);
  const o = {
    $bodyHeight: VasilleRef(0)
  };
  const resizeObserver = new ResizeObserver(entries => {
    o.$bodyHeight.V = $bodyHeight.V = entries[0].contentRect.height;
  });
  Vasille.tag("div", {
    k: div => {
      resizeObserver.observe(div);
    }
  }, Vasille => {
    Vasille.text("Test div");
  });
});