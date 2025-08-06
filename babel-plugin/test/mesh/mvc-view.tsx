import { mvcView } from "vasille-web";

interface Props {
  name: string;
  data: {
    id: string;
    width: number;
    height: number;
  };
  more: string;
}

const C = mvcView(function C({ name = "name", ["data"]: d }: Props) {
  <div>
    {d.id}:{name} {d.width}/{d.height}
  </div>;

  console.log(d.id, d.width, d.height, name);
});
