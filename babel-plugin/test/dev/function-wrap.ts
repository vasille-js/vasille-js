function f1() {
  console.log(1);
}

function f2(a: number, b: number) {
  return a + b;
}

async function f3() {
  await new Promise(resolve => setTimeout(resolve, 1000));
}

const f4 = function (a: number, b: number) {
  return a + b;
};

const f5 = (a: number, b: number) => a + b;

const o1 = {
  v: 1,
  f6(a: number) {
    console.log(a);
  },
  f7: (b: number) => {
    console.log(b);
  },
  f8: (c: number) => {
    console.log(c);
  },
};

class Test {
  public m1(a: number) {
    return a + 2;
  }
  #m2(a: number, b: number) {
    return a + b;
  }
  public constructor(public a: number) {}
}
