import { beforeMount, compose, For } from "vasille-web";

interface Props {
  $name: string;
  $data: {
    id: string;
    width: number;
    height: number;
  };
  $more: string;
}

const C = compose(function C({ $name = "name", ["$data"]: $d, ...rest }: Props) {
  const model: Props[] = [{ $name: "name1", $data: { id: "x", width: 1, height: 4 }, $more: "more" }];

  beforeMount(() => console.log($d.id, $d.width, $d.height, $name, rest.$more));

  <div>
    {$d.id}:{$name} {$d.width}/{$d.height}...{rest.$more}
  </div>;

  <For
    of={model}
    slot={({ $name = "xName", $data, ...rest2 }) => {
      <div>
        {$data.id}:{$name} {$data.width}/{$data.height}...{rest2.$more}
      </div>;

      console.log($data.id, $data.width, $data.height, $name, rest2.$more);
    }}
  />;
});
