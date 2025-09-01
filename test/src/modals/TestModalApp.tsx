import { component, modal } from "vasille-web";

interface Props {
  title: string;
}

const Modal = modal(({title} : Props) => {
  <div class="modal">{title}</div>;
});

export const TestModalApp = component(() => {
  <div class="root">
    <Modal title={"test"}/>
  </div>;
})
