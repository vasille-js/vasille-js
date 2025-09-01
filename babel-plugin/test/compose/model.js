import { model, ref as VasilleRef } from "vasille-web";
const testModel = model(Vasille => {
  const $a = VasilleRef(1, "a");
  return {
    $a
  };
}, "testModel");
const test2Model = model((Vasille, props) => {
  return {
    $a: VasilleRef(props.a)
  };
}, "test2Model");
const test1 = testModel();
test1.$a?.V;
const test2 = test2Model({
  a: 1
});
test2.$a?.V;
