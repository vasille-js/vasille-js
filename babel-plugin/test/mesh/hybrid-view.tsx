import { hybridView } from "vasille-web";

interface Model {
  model: string;
  data: {
    id: string;
    width: number;
    height: number;
  };
}

interface Props {
  name: string;
  more: string;
}

const C = hybridView(function C({ model = "model", ["data"]: d }: Model, { name = "name" }: Props) {
  <div>
    {d.id}:{name} {d.width}/{d.height} + {model}
  </div>;

  console.log(d.id, d.width, d.height, name, model);
});
