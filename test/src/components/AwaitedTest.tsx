import { awaited, beforeMount, component, view, watch } from "vasille-web";

export const reloads: (() => void)[] = [];
export const c1states: [unknown, unknown][] = [];
export const c2states: [unknown, unknown][] = [];

const C1 = component(() => {
  let $count = 0;
  const [$err, $data, reload] = awaited(() => {
    return new Promise<number>((resolve, reject) => {
      if ($count < 1) {
        resolve(0);
      } else {
        reject(1);
      }
    });
  });

  watch(() => {
    c1states.push([$err, $data]);
  });

  beforeMount(() => {
    reloads.push(() => {
      $count++;
      reload();
    });
  });
});

const C2 = component(() => {
  let $count = 0;
  const [$err, $data, reload] = awaited(() => {
    return new Promise<number>((resolve, reject) => {
      if ($count < 1) {
        reject(0);
      } else {
        resolve(1);
      }
    });
  });

  watch(() => {
    c2states.push([$err, $data]);
  });
  beforeMount(() => {
    reloads.push(() => {
      $count++;
      reload();
    });
  });
});

export const AwaitedTest = component(() => {
  <C1 />;
  <C2 />;
});
