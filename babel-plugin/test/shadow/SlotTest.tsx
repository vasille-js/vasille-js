import { component, Slot } from "steel-frame";

interface Props {
  slot(): void;
  beforeSlot(): void;
  afterSlot(): void;
}

export const SlotTest = component<Props>(({ slot, beforeSlot, ...props }) => {
  <div>
    <div class="before">
      <Slot model={beforeSlot} />
    </div>
    <Slot model={slot}>
      <div class={"default"}></div>
    </Slot>
    <div class="after">
      <Slot model={props?.afterSlot} />
    </div>
  </div>;
});
