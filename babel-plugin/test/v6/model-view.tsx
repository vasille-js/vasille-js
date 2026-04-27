import {
  arrayModel,
  ArrayModelView,
  ArrayView,
  compose,
  mapModel,
  MapModelView,
  setModel,
  SetModelView,
} from "steel-frame";

const C = compose(() => {
  let $arr = [1, 2, 3];
  const am = arrayModel([1, 2, 3]);
  const sm = setModel(arr);
  const mm = mapModel([
    [1, 2],
    [3, 4],
  ]);

  <ArrayView
    $of={$arr}
    key={item => item}
    slot={($item, $index) => {
      <div>{$item + $index}</div>;
    }}
  />;
  <ArrayModelView
    of={am}
    slot={(value, $index) => {
      <div>{value + $index}</div>;
    }}
  />;
  <SetModelView
    of={sm}
    slot={value => {
      <div>{value}</div>;
    }}
  />;
  <MapModelView
    of={mm}
    slot={($value, key) => {
      <div>{$value + key}</div>;
    }}
  />;
});
