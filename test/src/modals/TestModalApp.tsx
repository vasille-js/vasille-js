import { component, modal } from "steel-frame";

interface Props {
  title: string;
}

const Modal = modal(({ title }: Props) => {
  <div class="modal">{title}</div>;
});

export const TestModalApp = component(() => {
  <div class="root">
    <Modal title={"test"} />
  </div>;
});
