import { component } from "steel-frame";

const Accordion = component(() => {
  let $bodyHeight = 0;
  const o = { $bodyHeight: 0 };
  const resizeObserver = new ResizeObserver(entries => {
    o.$bodyHeight = $bodyHeight = entries[0].contentRect.height;
  });

  <div
    callback={div => {
      resizeObserver.observe(div);
    }}
  >
    Test div
  </div>;
});
