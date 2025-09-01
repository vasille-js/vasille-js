import { compose, For, ref as VasilleRef, match as VasilleMatch, arrayModel as VasilleArrayModel, expr as VasilleExpr } from "vasille-web";
const C = compose(function C(Vasille, {
  $name = VasilleRef("name"),
  ["$data"]: $d = VasilleMatch("$d"),
  ...rest
}) {
  const model = VasilleArrayModel(Vasille, [{
    $name: VasilleRef("name1"),
    $data: VasilleRef({
      id: "x",
      width: 1,
      height: 4
    }),
    $more: VasilleRef("more")
  }], "model");
  console.log($d.V.id, $d.V.width, $d.V.height, $name.V, rest.$more?.V);
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(VasilleExpr(Vasille, Vasille_d => Vasille_d.id, [$d]));
    Vasille.text(":");
    Vasille.text($name);
    Vasille.text(VasilleExpr(Vasille, Vasille_d => Vasille_d.width, [$d]));
    Vasille.text("/");
    Vasille.text(VasilleExpr(Vasille, Vasille_d => Vasille_d.height, [$d]));
    Vasille.text("...");
    Vasille.text(rest.$more);
  });
  For({
    of: model,
    slot: (Vasille, {
      $name = VasilleRef("xName"),
      $data = VasilleRef(),
      ...rest2
    }) => {
      Vasille.tag("div", {}, Vasille => {
        Vasille.text(VasilleExpr(Vasille, Vasille_data => Vasille_data.id, [$data]));
        Vasille.text(":");
        Vasille.text($name);
        Vasille.text(VasilleExpr(Vasille, Vasille_data => Vasille_data.width, [$data]));
        Vasille.text("/");
        Vasille.text(VasilleExpr(Vasille, Vasille_data => Vasille_data.height, [$data]));
        Vasille.text("...");
        Vasille.text(rest2.$more);
      });
      console.log($data.V.id, $data.V.width, $data.V.height, $name.V, rest2.$more?.V);
    }
  }, Vasille);
}, "C");
