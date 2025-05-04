# Documentation of `vasille-explicit`

The main goal of the Vasille project is to create a framework which just works as expected.
No special knowledge required, just HTML, CSS, JavaScript, minimal JSX.

## Table of content
1. [Components](#components)
2. [Assignments](#assignments-are-reactive)
3. [Inline expressions](#inline-expressions-are-reactive)
4. [Multiline expressions](#multiline-reactive-expression)
5. [Tags](#tags)
6. [Attributes](#attributes)
7. [Properties](#properties)
8. [Text](#text-expressions)
9. [Slots](#slots)
10. [Returns](#returns)
11. [Logic Blocks](#logic-blocks)
12. [Loops](#loops)
13. [Watching](#watching)
14. [Debug](#debug)
15. [Styling](#styling)

## Components

Components are reusable parts of Vasille applications. They are written in `.jsx` or `.tsx` files, using a superset of javascript.

Components are designed as functions, which are executed each time when the component is used.

```typescript jsx
export const MyComponent = compose(() => {
  // logic here
});
```

The `compose` function contains code that runs when the component is created.

Component props are sent as the first parameter of the compose function.
```typescript jsx
interface Props {
  foo: number;
}

export const MyComponent = compose<Props>(({foo}) => {
  // value is immmediately available
  console.log(foo.$);
});
```

## Assignments to `$` member will trigger updates

```typescript jsx
export const MyComponent = compose(() => {
  let count = ref(1);
  
  function inc () {
    // calling this function will update
    // all usage of count in user interface
    count.$ += 1;
  }
});
```

Component data can contains asynchronous data.

```typescript jsx
export const MyComponent = compose(() => {
  const [err1, data1] = awaited(new Promise());
  const [err2, data2] = awaited(async () => {
    const response = await fetch('https://..');
    return await response.json()
  });
  // err1, data1, err2, data2 are reactive values
});
```

## Inline reactive expressions

```typescript jsx
export const MyComponent = compose(() => {
  const a = ref(1);
  const b = ref(3);
  // sum will be updated each time when a or b changes it's value
  const sum = bind(a.$ + b.$);
});
```

## Multiline reactive expression

Use the `calculate` function to create multiline reactive expression.

```typescript jsx
export const MyComponent = compose(() => {
  const a = ref(1);
  const b = ref(3);
  // sum will be updated each time when a or b changes it's value
  const sum = calculate(() => {
    return a.$ + b.$;
  });
});
```

It the goal is to watch for changes instead of calculate a value, use `watch` function.
```typescript jsx
export const MyComponent = compose(() => {
  const a = ref(1);
  const b = ref(3);
  // run each time when a or b changes it's value
  watch(() => {
    console.log(a.$, b.$);
  });
});
```

## Tags

A lowercase tag like `<a>`, denotes a regular HTML tag. A capitalized tag, such `MyComponent`, indicates a *component*.

```typescript jsx
export const MyApp = compose(() => {
  <div>
    <MyComponent/>
  </div>
});
```

## Attributes

Attributes work exactly like HTML ones.
```typescript jsx
export const MyApp = compose(() => {
  <a href="/main">To Main Page</a>
});
```

Attribute values can be JavaScript expressions.

```typescript jsx
export const MyApp = compose(() => {
  let path = '/main';
  
  <a href={path}>To Main Page</a>
});
```

Conditionally attributes are controlled using boolean values.
```typescript jsx
export const MyApp = compose(() => {
  let readonly = false;
  
  <button disabled={readonly}>To Main Page</button>
});
```

## Properties

Values passed to a component will be processed as properties of the component.

```typescript jsx
interface Props {
  count: number;
}

const MyComponent = compose<Props>(({count}) => {
  <div>{count}</div>
});

export const MyApp = compose(() => {
  <MyComponent count={2}/>
});
```

## Text expressions

In JSX a text expression can be included in HTML using curly braces.
```typescript jsx
export const MyApp = compose(() => {
  const text = 'Main';
  
  <a href="/main">To {text} Page</a>
});
```

## Slots

Slots are used to render external content in the component. Slots, like components, are function and can accept props.
```typescript jsx
interface Props {
  slot?: () => void;
}

const MyComponent = compose<Props>(({slot}) => {
  <div>
    <Slot model={slot}/>
  </div>
});

export const MyApp = compose(() => {
  <MyComponent slot={() => {
    <div>Text</div>
  }}/>;
});
```

In the component the slot can have default content. Let's see an example of sending props to slot content.
```typescript jsx
interface Props {
  slot?: (p: {name: string; count: number}) => void;
}

const MyComponent = compose(({slot}: Props) => {
  <div>
    <Slot model={slot} name={"Name"} count={1} slot={() => {
      <>Default content</>
    }}/>
  </div>
});

export const MyApp = compose(() => {
  <MyComponent slot={({name, count}) => {
    <div>{name}: x{count}</div>
  }}/>
});
```

## Returns

Components are functions, and like functions they return a value when called. Use `callback` attribute the handle that value. Standard `HTML` tags return `HTMLElement` instance.
```typescript jsx
interface InputControl {
  blur(): void;
  focus(): void;
}

const MyComponent = compose((): InputControl|null => {
  let input: HTMLInputElement|null = null;
  
  <input callback={node => input = node}/>
  
  if (input !== null) {
    return {
      focus: () => input.focus(),
      blur: () => input.blur()
    }
  }
  
  return null;
});

export const MyApp = compose(() => {
  let control: InputControl|null = null;
  
  <MyComponent callback={obj => control = obj}/>
  
  if (control) {
    control.focus();
  }
});
```

## Logic Blocks

All logic blocks are predefined components, no any special syntax.
```typescript jsx
export const MyApp = compose(() => {
  const cond = ref(true);
  
  <If condition={cond} slot={() => { /* .. */ }}/>
  <ElseIf condition={cond} slot={() => { /* .. */ }}/>
  <Else slot={() => { /* .. */ }}/>
});
```

## Loops

Iterating over a list can be done using `For` component.
```typescript jsx
export const MyApp = compose(() => {
  const arr = arrayModel([1, 2, 3]);
  const set = setModel([2, 3]);
  const map = mapModel([[1, 2], [2, 3]]);
  
  <For of={arr} slot={(value, key) => { /* .. */ }}/>
  <For of={set} slot={(value) => { /* .. */ }}/>
  <For of={map} slot={(value, key) => { /* .. */ }}/>
});
```

Lists of objects are supported.
```typescript jsx
export const MyApp = compose(() => {
  const arr = arrayModel([
    reactiveFields({name: "Human1", age: 20}),
    reactiveFields({name: "Human2", age: 30}),
  ]);
  
  <ol>
    <For of={arr} slot={(value, key) => {
      <li>{value.name} is {value.age} years old</li>
    }}/>
  </ol>
  <button onclick={() => arr.push(reactiveFields({name: "Human", age: arr.length}))}>
    Add human
  </button>
  <button onclick={() => arr[0].age.$ = 30}>
    Correct age of first human
  </button>
});
```

## Watching

Watching a value will lead to content destroyed and created each time when the model is updated.
```typescript jsx
export const MyApp = compose(() => {
  const model = ref(2);
  
  <Watch model={model} slot={value => {
    console.log(value);
  }}/>
});
```

## Debug

Debug allows you to see some values of states or properties in DOM as comments. Values will be cast to string using `toString` method.

```typescript jsx
export const MyApp = compose(() => {
  const model = ref(2);
  
  <Debug model={model}/>
});
```

## Styling

Please use `vasille-css` package for styling.
