import { awaited, view, watch } from "vasille-web";

export const reloads: (() => void)[] = [];
export const c1states: [unknown, unknown][] = [];
export const c2states: [unknown, unknown][] = [];

const C1 = view(() => {
  let count = 0;
  const [err, data, reload] = awaited(() => {
    return new Promise<number>((resolve, reject) => {
      if (count < 1) {
        resolve(0);
      } else {
        reject(1);
      }
    });
  });

  watch(() => {
    c1states.push([err, data]);
  });
  reloads.push(() => {
    count++;
    reload();
  });
});

const C2 = view(() => {
  let count = 0;
  const [err, data, reload] = awaited(() => {
    return new Promise<number>((resolve, reject) => {
      if (count < 1) {
        reject(0);
      } else {
        resolve(1);
      }
    });
  });

  watch(() => {
    c2states.push([err, data]);
  });
  reloads.push(() => {
    count++;
    reload();
  });
});

export const Component = view(() => {
  <C1 />;
  <C2 />;
});
