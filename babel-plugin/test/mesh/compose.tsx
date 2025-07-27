import { arrayModel, awaited, compose, For } from "vasille-dx";

interface Props {
  name: string;
  data: {
    id: string;
    width: number;
    height: number;
  };
  more: string;
}

const C = compose(function C({ name = "name", ["data"]: d, ...rest }: Props) {
  const model: Props[] = [{ name: "name1", data: { id: "x", width: 1, height: 4 }, more: "more" }];

  <div>
    {d.id}:{name} {d.width}/{d.height}...{rest.more}
  </div>;

  console.log(d.id, d.width, d.height, name, rest.more);

  <For
    of={model}
    slot={({ name = "xName", data: { id, width, ...rest }, ...rest2 }) => {
      <div>
        {id}:{name} {width}/{rest.height}...{rest2.more}
      </div>;

      console.log(id, width, rest.height, name, rest2.more);
    }}
  />;
});
