import { modal, ref } from "steel-frame";

const TestModal = modal((props: { $a: boolean }) => {
  let $b = props.$a;
});

const NoPropsModal = modal(() => {});

TestModal({
  $a: ref(true),
});

NoPropsModal({});
