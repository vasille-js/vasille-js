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

  let x = "value"; // Reference
  let y = x;       // Pointer to x value (forward-only)
  const z = y;     // Reference y value on init
});
```