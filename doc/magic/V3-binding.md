## Inline expressions are reactive

```typescript jsx
export const MyComponent = compose(() => {
  let a = 1;
  let b = 3;
  let c = 5;
  let sum = a + b;


  sum == 4;

  a = 2;
  sum == 5;

  sum = b + c;
  sum == 9;

  b = 4;
  sum == 10;

  sum = c;
  sum == 5;

  c = 6;
  sum == 6;

  sum = 10;
  c == 6;

  c = 7;
  sum == 10;

  const w = "world"; // w is a value
  let x = "value";   // x is a reference
  let y = x;         // y is a binding
  const z = x;       // z is a binding
  const zx = z + x;  // x is a binding

  let q = value(z);  // q is a value
  let r = ref(x);    // r is a reference
  let s = bind(2);   // s is a binding
});
```