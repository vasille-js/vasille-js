# Vassile - High Level Procedural Composition Documentation

To create a Vasille.js component, create a file with extension `.vc.js` or `.vc.ts` and 
define a template based on `App`, `Component`, `Fragment` or `Reactive`.

Example of app:

```typescript jsx
import {App} from 'vcc';

<App />;
```

Example of component:

```typescript jsx
import {Component} from 'vcc';

<Component />;
```

Example of fragment:

```typescript jsx
import {Fragment} from 'vcc';

<Fragment />;
```

Example of Reactive:

```typescript jsx
import {ref} from 'vcc';

let field = ref(0);
```

A `App` is a root of a Vasille application, it will be bounded to
an existing DOM node. `Component` defines a typical component, which root
is an HTML node created by Vasille. `Fragment` can contain any number of
nodes at top level. `Reactive` is just a reactive object.

## Table of content
[[_TOC_]]

## Class fields and methods

Component data, functions, events, slots and watcher are defined as class
fields and methods.


### Component data/state

Component state is composed of private class fields, created by a call
to `ref<type>(initialValue: type): type` method:

```typescript jsx
import {App, ref} from 'vcc';

let foo = ref(2);
let bar = ref('bar');

// non reactive data
let data = 3;

// const data
const pi = 3.14;

<App />;
```

### Component properties

Component properties are created by a call to 
`prop<type>(initialValue?: type): type` method:

```typescript jsx
import {App, asset} from 'vcc';

let foo = asset<number>();
let bar = asset('default value');

// A property with content value until component lifetime
const foo2 = asset<number>();

<App />;
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`expr<type>(expr: (...args: ...any) => type): type` 
method:

```typescript jsx
import {App, ref, expr} from 'vcc';

let x = ref(2);
let y = ref(3);
let z = expr<number>(x + y);

// multiline computed property
let multilineExpression = expr<number>(() => {
    let result : number;

    switch (x) {
        case 1:
            result = x + 2;
            break;

        case 2:
            result = y + 3;
            break;

        default:
            result = visible ? x - 2 : y - 4;
    }

    return result;
});

// partial bind expression
let z1 = expr<number>(() => x + y, [x]); //< update only on x change
let z2 = expr<number>(() => x + y, [y]); //< update only on y change

<App />;
```

### Methods (functions)

To declare a component method, just declare a function:

```typescript jsx
import {App} from 'vcc';

// private method
function sum(a : number, b : number) : number {
    return a + b;
}

// public method
export function diff(a : number, b : number) : number {
    return a - b;
}

<App />;
```

Any method is available outside of component.

### Components hooks

The Vasille components has 4 hooks. The `created`
hook is called when the component is created and properties are 
initialized. The `mounted` hook is called when all elements defined in
component are mounted. The`destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```typescript jsx
import {App} from 'vcc';

// created hook

<App />

// mounted hook

<></>

// destroy hook

```

### Events

An event can be handled outside of function, events are declared as function header, 
after call declared function to emit the defined event.

Syntax:
```typescript jsx
import {App} from 'vcc';

// declare event
declare function myEvent(x: number, y: number);

myEvent(2, 3);

<App/>;
```

### Watchers

A watcher is an anonymous function which will be called each time when a 
bound variable get changed. Call `watch(expr: (...args: ...any) => void)` method
to define a watcher.

Example:

```typescript jsx
import {App, ref, watch} from 'vcc';

const template = new App;

let x = ref(0);
let y = ref(0);
let visible = ref(false);

watch(() => {
    if (x < 0 && y < 0) {
        visible = true;
    } else {
        visible = false;
    }
});

// Force partial watch
watch(() => {
    if (x < 0 && y < 0) {
        visible = false;
    } else {
        visible = true;
    }
}, [x]);

<App />;
```

## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

Use JSX to define composition function:
```javascript
import {App} from 'vcc';

<App>
    <div>
        <p>{ "Some text here" }</p>
    </div>
</App>;
```

### Render functions

Use JSX to define composition function:
```typescript jsx
import {App} from 'vcc';

function renderFunction(x : number) {
    <span>{x}</span>
}

<App>
    <div>
        <!-- Call render function example 1 -->
        <renderFunction x={23} />
        <!-- Call render function example 2 -->
        {void renderFunction(23)}
    </div>
</App>;
```

### Subcomponents

Subcomponents must be imported.
```javascript
import {App} from 'vcc';
import {MyComponent} from './MyComponent';

<App>
    <MyComponent />
</App>;
```

### Attributes and properties

Attributes are set upped by like HTML ones.

Example:
```javascript
import {App} from 'vcc';

<App>
    <div id="id" data-xcode="xcode1" expr-example={a + b}>
        <MyComponent prop1={"string value"} prop2={x + y} />
    </div>
</App>
```

### Class directives

```typescript jsx
import {App} from 'vcc';

<App>
    <div 
        class="static-class" 
        bind:class={dynamicalClass} 
        class:conditionalClass={condition} />
</App>;
```

### Style directives

Example:
```typescript jsx
import {App} from 'vcc';


let h = 23;

<App>
    <div 
        style:width="3px" 
        style:heigth.px={h}
    ></div>
</App>;
```

### Listen for events

Use `$.on<eventname>` to bind to standard HTML DOM events 
or `on:signalName` to listen custom signals.

Examples:
```typescript jsx
import {App} from 'vcc';
import {MyComponent} from './MyComponent';

<App>
    <div 
        onmousedown={() => { /* code here */ }}
        onmousemove={ev => x = ev.clientX}
    >
        <MyComponent
            on:eventName={() => { /* code here */ }}
            on:hover={state => hover = state}
        />
    </div>
</App>;
```

### Setting inner HTML

Use `set` to set innerHTML of element.

```typescript jsx
import {App} from 'vcc';

let code = ref('<html>code</html>');

<App>
    <p bind:html={code}></p>
</App>;
```

### Reference to node or subcomponents

Use fields to define a reference, assigning value to it make a reference
available outside of `render` function.

References are available in `mounted` hook.

Examples:
```typescript jsx
import {App} from 'vcc';
import {MyComponent} from './MyComponent';

let div !: HTMLElement;
let sub !: MyComponent;
let items : Set<HTMLElement> = new Set;

console.log(div, sub); // All undefined, items.size == 0

<App>
    <div ref:set={div}></div>
    <MyComponent ref:set={sub}>
        <p ref.add={items}></p>
        <p ref.add={items}></p>
        <p ref.add={items}></p>
    </MyComponent>
</App>

console.log(div, sub); // All defined, items.size == 3
```

### Slots

Use `slot` tag to define a slot.

Example:
```typescript jsx
import {App} from 'vcc';

<App>
    // defines some slots
    <slot>
        <div></div>
    </slot>
    <slot name="slot2" from={2} to={2}></slot>
    // example of using
    <Self 
        default={<div></div> /* inserts content to first slot */}
        slot2={({from, to}) => `from: ${from}, to: ${to}` /* inserts content to second slot */}
    >
    </Self>
    // The short form
    <Self>
        <div></div> <!-- Also inserts content to first slot -->
    </Self>
</App>;
```

## Flow control

Flow can be controlled using methods:
* `if (..) {..}`.
* `if (..) {..} else {..}`.
* `if (..) {..} else if ..`.
* Custom components.
  

### `if (..) {..}`

The if has one condition, and one callback which get executed when the condition
is true:
```javascript
if (condition) {
    // ..
}
```

### `if (..) {..} else {..}`

If-else has a condition and 2 callbacks, the first will be released when the
condition is true, the second will be released when the condition is false.
```javascript
if (condition) {
    <div>{'this is a div'}</div>
}
else {
    <span>{'this is a span'}</span>
}
```

### `if (..) {..} else if ..`

A switch accepts pairs of conditions and callback.
```javascript
if (condition) {
    // ..
}
else if (condition) {
    // ..
}
else {
    // ..
}
```

### Custom components

A repeater will repeat a fragment, by a special rule. List of predefined repeaters:
* `RepeatNode` - repeat a fragment x times, use a number as model.
* `ArrayView` - use `ArrayModel` as model.
* `ObjectView` - use `ObjectModel` as model.
* `SetView` - use `SetModel` as model.
* `MapView` - use `MapModel` as model.

```typescript jsx
import {App, ArrayView, ArrayModel} from 'vcc';

const model = new ArrayModel<string>();

<App>
    <ArrayView model={model} item={(item: string, index: number) => {
        <li>{item}</li>
    }}></ArrayView>
</App>;
```

### Debugging comments

Use `Debug` tag to define debug comments:
```typescript jsx
import {App, Debug} from 'vcc';

<App>
    <Debug value={stringValueOrExpression}/>
</App>
```

## Advanced

There are some advanced options, which can be coded using Vasille
language.

### Execution

DOM creation by default is a UI blocking operation, 
custom components can be rendered non-freezing UI,
also predefined repeaters have a special property 
`freezeUi` with `true` as default value.

Example:
```javascript
import {App, SetView} from 'vcc';

// Customize current app rendering 
<App freezeUi={false}>
    <!-- Cutomize repeater render -->
    <SetView set:freezeUi={false} />
</App>
```

### Pointers

A pointer can be defined using a `point` method.

```typescript jsx
import {App, ref, point, extract} from 'vcc';

let pointer = point<string>('default-value');
let x = ref('x');
let y = ref('y');

console.log(x, y, pointer); //< prints `x y default-value`

// change pointer value
pointer = x;

console.log(x, y, pointer); //< prints `x y x`

// change pointed value;
pointer = extract(y);
// equivalent to
pointer = 'y';

console.log(x, y, pointer); //< prints `y y y`

<App />;
```

### Watch for
"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```typescript jsx
import {App} from 'vcc';

<App>
    <Watch model={someReactiveValue}>
        <!-- defines some nodes here -->
    </Watch>
</App>
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
