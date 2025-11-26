import { afterMount, beforeMount, component, ref } from "steel-frame";

export class Test1 {
  public $1 = ref(1);
  public $2: number;
  public $3: number;

  public constructor(data: { $3: number }) {
    this.$2 = 2;
    this.$3 = data.$3;
  }

  public get3() {
    return this.$3;
  }

  public set2(v: number) {
    this.$2 = v;
  }
}

class Test2 {
  public $a = ref(1);
  public $b: number;
  public $c: number;

  public constructor({ $3 }: { $3: number }) {
    this.$b = 2;
    this.$c = $3;
  }

  public getC() {
    return this.$c;
  }

  public setB(v: number) {
    this.$b = v;
  }
}

const C = component(() => {
  let $3 = 3;
  let $t1 = new Test1({ $3 });
  let $t2 = new Test2({ $3 });
  const t4 = new Test2({ $3 });

  beforeMount(() => {
    $t2.setB(2);
  });

  afterMount(() => {
    console.log($3, $t2.$b, $t1.$1);
  });
});
