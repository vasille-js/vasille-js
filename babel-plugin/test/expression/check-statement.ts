import { calculate, compose } from "steel-frame";

const C = compose(() => {
  let $a = 1;
  const o = { b: 1 };

  const $c = calculate(() => {
    o.b++;

    do {
      $a++;
    } while ($a < 1);

    for (const i in [0, 1]) {
      $a++;
    }

    for (const i of [0, 1]) {
      $a++;
    }

    for (let i = $a; i < $a; i += $a) {
      $a++;
    }

    for ($a = 3; $a < 4; $a++) {
      $a++;
    }

    label: if ($a < 3) {
      $a++;
    }

    switch ($a) {
      case $a:
        $a++;
        break;
    }

    try {
      throw $a;
    } catch (e) {
      $a++;
    } finally {
      $a++;
    }

    while ($a < 1) {
      $a++;
    }

    return 0;
  });
});
