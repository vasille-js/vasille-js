import { model } from "steel-frame";

const testModel = model(() => {
  let $a = 1;

  return { $a };
});

const test2Model = model((props: { a: number }) => {
  return { $a: props.a };
});

const test1 = testModel();

test1.$a satisfies number;

const test2 = test2Model({ a: 1 });

test2.$a satisfies number;
