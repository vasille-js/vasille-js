import { compose } from "steel-frame";

const o1: { $a?: number } = {};
const o2: { $a: number } | null = null;

const C = compose(() => {
  const $a1 = o1.$a;
  // @ts-expect-error
  const $a2 = o2?.$a;
});
