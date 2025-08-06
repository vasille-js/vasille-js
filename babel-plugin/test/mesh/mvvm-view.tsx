import { mvvmView } from "vasille-web";

interface Props {
  name: string;
  data: {
    id: string;
    width: number;
    height: number;
  };
  more: string;
}

const C = mvvmView(function C({ name = "name", ["data"]: d, ...rest }: Props) {
  <div>
    {d.id}:{name} {d.width}/{d.height}...{rest.more}
  </div>;

  console.log(d.id, d.width, d.height, name, rest.more);
});
