# SolidFrame v5 Framework Documentation

The SolidFrame project aims to create a framework that functions intuitively with just HTML, CSS, and JavaScript -- no special knowledge required.

## Table of Contents
1. [Components](#components)
2. [Reactive Assignments](#reactive-assignments)
3. [Reactive Inline Expressions](#reactive-inline-expressions)
4. [Reactive Multiline Expressions](#reactive-multiline-expressions)
5. [Tags](#tags)
6. [Attributes](#attributes)
7. [Properties](#properties)
8. [Text Expressions](#text-expressions)
9. [Slots](#slots)
10. [Returns](#returns)
11. [Logic Blocks](#logic-blocks)
12. [Loops](#loops)
13. [Watching](#watching)
14. [Styling](#styling)

---

## Components
Components are reusable building blocks in SolidFrame, written as functions in `.jsx` or `.tsx` files (a superset of JavaScript).

```typescript jsx
export const MyComponent = component(() => {
  // Component logic here
});
```

Props are provided as the first parameter:

```typescript jsx
interface Props {
  foo: number;
}

export const MyComponent = component(({ foo }: Props) => {
  console.log(foo); // Direct prop access
});
```

---

## Reactive Assignments
Assignments to local variables with names starting with `$` are reactive. Changing their value triggers UI updates everywhere they're used.

```typescript jsx
export const MyComponent = component(() => {
  let $count = 1;
  function inc() {
    $count += 1; // Updates UI reactively
  }
});
```

This reactivity also applies to arrays, sets, and maps for operations like `push` and `pull`.

---

## Asynchronous Data
Components can handle asynchronous data using the `awaited` utility.

```typescript jsx
export const MyComponent = component(() => {
  const [$err, $data] = awaited(async () => {
    const response = await fetch('https://...');
    return response.json();
  });
  // Variables begin as undefined and update reactively
});
```

---

## Reactive Inline Expressions
Inline expressions that depend on reactive variables are automatically updated.

```typescript jsx
export const MyComponent = component(() => {
  let $a = 1, $b = 3;
  const $sum = $a + $b; // Reactively updates as $a or $b changes
});
```

---

## Reactive Multiline Expressions
For more complex calculations, use the `calculate` function.

```typescript jsx
export const MyComponent = component(() => {
  let $a = 1, $b = 3;
  const $sum = calculate(() => $a + $b);
});
```

To react to value changes (instead of calculating a value), use `watch`:

```typescript jsx
export const MyComponent = component(() => {
  let $a = 1, $b = 3;
  watch(() => {
    console.log($a, $b); // Runs each time either changes
  });
});
```

---

## Tags
- Lowercase tags (e.g., `<a>`) are standard HTML elements.
- Capitalized tags indicate components (e.g., `<MyComponent/>`).

```typescript jsx
export const MyApp = component(() => {
  <div>
    <MyComponent />
  </div>;
});
```

---

## Attributes
Attributes closely mirror HTML, supporting JS expressions.

```typescript jsx
export const MyApp = component(() => {
  let $path = '/main';
  <a href={$path} target="_blank">To Main Page</a>;
});
```

Conditional attributes use booleans:
```typescript jsx
export const MyApp = component(() => {
  let $readonly = false;
  <button disabled={$readonly}>Submit</button>;
});
```

---

## Properties
Component input values become props.

```typescript jsx
interface Props {
  count: number;
}

const MyComponent = component(({ count }: Props) => {
  <div>{count}</div>;
});

export const MyApp = component(() => {
  <MyComponent count={2} />;
});
```

---

## Text Expressions
Output text within JSX using curly braces:

```typescript jsx
export const MyApp = component(() => {
  let $text = 'Main';
  <a href="/main">To {$text} Page</a>;
});
```

---

## Slots
Slots allow you to render external content within a component, with optional props and defaults.

```typescript jsx
interface Props {
  slot?: (p: { name: string; count: number }) => void;
}

const MyComponent = component(({ slot }: Props) => {
  <div>
    <Slot model={slot} name="Name" count={1}>
      Default content
    </Slot>
  </div>
});

export const MyApp = component(() => {
  <MyComponent slot={({ name, count }) => {
    <div>{name}: x{count}</div>
  }} />
});
```

---

## Returns
Components may return values. Use the `callback` attribute to handle return values. Standard `HTML` tags return `HTMLElement` instance.

```typescript jsx
interface InputControl {
  blur(): void;
  focus(): void;
}

const MyComponent = component((): InputControl | null => {
  let input: HTMLInputElement | null = null;
  
  <input callback={node => input = node} />;
  return input;
});

export const MyApp = component(() => {
  <MyComponent callback={input => input.focus()} />;
});
```

---

## Logic Blocks
There is no special syntax for logic. Predefined components like `<If>`, `<ElseIf>`, and `<Else>` are used instead.

```typescript jsx
export const MyApp = component(() => {
  <>
    <If $condition={true}>...</If>
    <ElseIf $condition={false}>...</ElseIf>
    <Else>...</Else>
  </>
});
```

---

## Loops
Use the `<For>` component to iterate arrays, sets, or maps.

```typescript jsx
export const MyApp = component(() => {
  const arr = [1, 2, 3];
  const set = new Set([2, 3]);
  const map = new Map([[1, 2], [2, 3]]);

    <For of={arr} slot={(value, key) => {}} />;
    <For of={set} slot={value => {}} />;
    <For of={map} slot={(value, key) => {}} />;
});
```

Supports looping over objects too:

```typescript jsx
export const MyApp = component(() => {
  const arr = [
    { name: "Human1", $age: 20 },
    { name: "Human2", $age: 30 }
  ];

  <ol>
    <For of={arr} slot={(value, key) => {
      <li>{value.name} is {value.$age} years old</li>
    }} />
  </ol>;
  <button onclick={() => arr.push({ name: "Human", $age: arr.length })}>
    Add human
  </button>;
  <button onclick={() => arr[0].$age = 30}>
    Correct age of first human
  </button>;
});
```

---

## Watching
The `<Watch>` component recreates its content whenever the watched model updates.

```typescript jsx
export const MyApp = component(() => {
  let $model = 2;
  <Watch $model={$model}>...</Watch>;
});
```

---

## Styling
Use the `styleSheet` function to generate stylesheets at compile time.

```typescript jsx
export const MyComponent = component(() => {
  <div class={styles.root}>
    <div class={styles.container}>
      Styled text.
    </div>
  </div>;
});

const styles = styleSheet({
  root: {
    display: "block",
    // shortcut for 0px
    margin: 0,
    // shortcut for "10px 5px"
    padding: [10, 5],
    // Styles can be declared for any pseudo-selector
    ":hover": {
      margin: 5
    }
  },
  container: {
    // Custom media quesries are supported
    "@media (max-width: 1000px)": {
      margin: 20
    },
    // fallback with custom values for laptops, tablets and phones
    margin: [100, laptop(40), tablet(20), mobile(10)],
    // use same fallback for tablets and phones
    padding: [[50, 45], tablet(mobile([10, 5]))],
    // stylish your application by user requiments
    color: [prefersLight("#fff"), prefersDark("#222")],
    // support dark mode which can be switched from javascript
    background: [light("#fff"), dark("#000")],
    // suppoert custom themes
    "border-color": [theme("red", "#f00"), theme("green", "#0f0"), theme("blue", "#00f")],
  },
});
```

Apply dynamic styles directly via the `style` attribute (object or string notation):

```typescript jsx
export const MyComponent = component(() => {
  let padding = 10;
  <div style={{ padding: [padding, 'px'] }}>
    <div style={`padding: ${padding}px`}>
      Updated styling.
    </div>
  </div>;
});
```