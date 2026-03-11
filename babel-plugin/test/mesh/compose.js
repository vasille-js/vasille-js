import { compose, For, ref as VasilleRef, arrayModel as VasilleArrayModel, safe as VasilleSafe, expr as VasilleExpr } from "vasille-web";
const C = compose(function C(Vasille, {
  $name = VasilleRef("name"),
  ["$data"]: $d = VasilleRef(),
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
  }]);
  VasilleSafe(() => console.log($d.V.id, $d.V.width, $d.V.height, $name.V, rest.$more?.V))();
  Vasille.tag("div", {}, Vasille => {
    Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.id, [$d]));
    Vasille.text(":");
    Vasille.text($name);
    Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.width, [$d]));
    Vasille.text("/");
    Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.height, [$d]));
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
        Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.id, [$data]));
        Vasille.text(":");
        Vasille.text($name);
        Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.width, [$data]));
        Vasille.text("/");
        Vasille.text(VasilleExpr(Vasille, Vasille_0 => Vasille_0.height, [$data]));
        Vasille.text("...");
        Vasille.text(rest2.$more);
      });
      VasilleSafe(() => console.log($data.V.id, $data.V.width, $data.V.height, $name.V, rest2.$more?.V))();
    }
  }, Vasille);
});
