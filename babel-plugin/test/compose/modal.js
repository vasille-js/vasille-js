import { modal, ref } from "vasille-web";
const TestModal = modal((Vasille, props) => {
  const $b = ref(props.$a?.V);
});
const NoPropsModal = modal(Vasille => {});
TestModal({
  $a: ref(true)
});
NoPropsModal({});
