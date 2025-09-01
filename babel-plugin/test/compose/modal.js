import { modal, ref } from "vasille-web";
const TestModal = modal((Vasille, props) => {
  const $b = ref(props.$a?.V, "b");
}, "TestModal");
const NoPropsModal = modal(Vasille => {}, "NoPropsModal");
TestModal({
  $a: ref(true)
});
NoPropsModal({});
