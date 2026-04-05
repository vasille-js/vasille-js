function x(
  y = 1,
  [z] = [1],
  {
    a: {
      b: { c },
    },
  } = { a: { b: { c: 1 } } },
) {
  console.log(y, z, c);
}
