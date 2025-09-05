import {modal, page, Slot} from "vasille-web";

interface Props {
  slot?(): void;
}

const DivModal = modal(({slot}:Props) => {
  <div class="modal">
    <Slot slot={slot}/>
  </div>;
})

export default page(async () => {
  <div class="container">
    <div class="div1"/>
    <DivModal />
    <div class="div2"/>
    <DivModal slot={() => {
      <span>Hello</span>
    }}/>
  </div>;
})

export function runModalDirectly() {
  DivModal({});
}
