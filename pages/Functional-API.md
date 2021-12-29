# Vassile - High Level Procedural Composition Documentation

To create a Vassile.js component, create a file with extension `.vc.js` or `.vc.ts` and 
define a template based on `App`, `Component`, `Fragment` or `Reactive`.

Example:

```javascript
import {App, compose} from 'vcc';

compose(new App);
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
to `$.ref<type>(initialValue: type): type` method:

```typescript
import {App, compose, ref} from 'vcc';
 
const template = new App;

let foo = ref(2);
let bar = ref('bar');

// non reactive data
let data = 3;

// const data
const pi = 3.14;
```

### Component properties

Component properties are created by a call to 
`$.prop<type>(initialValue?: type): type` method:

```typescript
import {App, compose, prop} from 'vcc';

const template = new App;


let foo = prop<number>();
let bar = prop('default value');

// A property with content value until component lifetime
const foo2 = prop<number>();
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`bind<type>(expr: (...args: ...any) => type): type` 
method:

```typescript
import {App, compose, ref, bind} from 'vcc';

const template = new App;

let x = ref(2);
let y = ref(3);
let z = bind<number>(x + y);

// multiline computed property
let multilineExpression = bind<number>(() => {
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
let z1 = bind<number>((x : number) => x + y); //< update only on x change
let z2 = bind<number>((y : number) => x + y); //< update only on y change
```

### Methods (functions)

To declare a component method, just declare a function:

```typescript
import {App, compose} from 'vcc';

function sum(a : number, b : number) : number {
    return a + b;
}

compose(new App);
```

Any method is available outside of component.

### Components hooks

The Vasille components has 4 hooks. The `$created`
hook is called when the component is created and properties are 
initialized. The `$mounted` hook is called when all elements defined in
component are mounted. The `$ready` hook is called when all elements 
declared is component and installed to its slots are mounted. The
`$destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```typescript
import {App, compose} from 'vcc';

compose(new App)
    .created(() => {
        // created hook
    })
    .mounted(() => {
        // mounted hook
    })
    .ready(() => {
        // ready hook
    })
    .destroy(() => {
        // before destroy hook
    });
```

### Events

An event can be handled outside of function, events are declared as function header, 
after call declared function to emit the defined event.

Syntax:
```typescript
import {App, compose} from 'vcc';

// declare event
declare function myEvent(x: number, y: number);

compose(new App).mounted(() => {
    // emit a event
    myEvent(2, 4);
})
```

### Watchers

A watcher is an anonymous function which will be called each time when a 
bound variable get changed. Call `watch(expr: (...args: ...any) => void)` method
to define a watcher.

Example:

```typescript
import {App, compose, ref, watch} from 'vcc';

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
watch((x: number) => {
    if (x < 0 && y < 0) {
        visible = false;
    } else {
        visible = true;
    }
});
```

## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

An HTML tag is defined by 
`node.tag(tagName: string, callback: ({ props, signals, slots, el, self, ... }) => void)`
method in composition function:
```javascript
import {App, compose} from 'vcc';

compose(new App)
    .tag("div")
        .tag("p")
            .text("Some text here")
            .ready()
        .ready()
    .ready()
```

### Subcomponents

Subcomponents must be imported, after are defined by a call to
`node.create<T>(component: T, callback: ({ props, signals, slots, el, self, ... }) => void)`
method. `props` handler is used to set up component properties.
```javascript
import {App, compose} from 'vcc';
import {Component} from './Component';

compose(new App)
    .create(new Component)
        .ready()
    .ready()
```

### Attributes and properties

Attributes are set upped by calls to `node.attr(name: string, value: string)`.

Example:
```javascript
import {App, compose, bind} from 'vcc';

compose(new App)
    .tag("div")
        .attr("id", "id")
        .attr("data-xcode", "xcode1")
        .attr("bind-example", $.bind(a + b))

        .create(new Component)
            .props.prop1("string value")
            .props.prop2(bind(x + y)) // bind example
            .ready()
        .ready()
    .ready()
```

### Class directives

Use `node.class(name: string)` or `node.class(condition: boolean, name: string)` to set classes.

```javascript
import {App, compose} from 'vcc';

compose(new App)
    .tag("div")
        .class("static class")
        .class(this.dynamicalClass)
        .class(this.condition, "conditionalClass")
    .ready()
```

### Style directives

Use `node.style(property: string, value: string)` to set up element style.

Example:
```typescript
import {App, compose, bind} from 'vcc';

compose(new App)
    .tag("div")
        .style("width", "3px")
        .style("width", bind(width + 'px'))
        .ready()
    .ready()
```

### Listen for events

Use `node.on<eventname>` to bind to standard HTML DOM events 
or `signals` to listen custom signals.

Examples:
```typescript
import {App, compose} from 'vcc';
import {Component} from './Component';

compose(new App)
    .tag("div")
        .onmousedown(() => { /* code here */ })
        .onmousemove(ev => x = ev.clientX)
        .ready()
    .create(new Component)
        .signals.eventName(() => { /* code here */ })
        .signals.hover(() => this.hover = true)
        .ready()
    .ready()
```

### Setting inner HTML

Use `node.html(html : string)` method to set inner HTML:
```typescript
import {App, compose} from 'vcc';

compose(new App)
    .tag("p")
        .html(text)
        .ready()
    .ready()
```

### Reference to node or subcomponents

Use fields to define a reference, assigning value to it make a reference
available outside of `$compose` milestone.

References are available in `$mounted` hook.

Examples:
```typescript
import {App, compose} from 'vcc';
import {MyComponent} from './MyComponent';

let div!: HTMLElement;
let sub!: MyComponent;
let items!: Set<HTMLElement> = new Set;

compose(new App)
    .tag("div")
        .assignEl(div)
        .ready()
    .create(new MyComponent)
        .assignSelf(self)
        
        .tag("p").addElTo(items).ready()
        .tag("p").addElTo(items).ready()
        .tag("p").addElTo(items).ready()
        .ready()
    .ready()
```

### Slots

Use `slot<types...>()` method to define a slot, and use assignment 
to change the composition function.

Example (it is recursively, don't try to run this code):
```typescript
import {App, compose, slot, pipe} from 'vcc';

declare function slot1() : slot; //< first declared slot is always the default
declare function slot2(arg1 : number, arg2 : number) : slot;


compose(new App)
    // You can predefine slot content
    // Predefined content will be overritten
    // Create the content of first slot
    .insert(slot1())
        .tag("div")
        .ready()
    
    .create(new Self)
        // Create the content of second slot in a children node
        .insert(slot2(1, 2)).ready()
        .ready()
    
    .create(new Self)
        .slots.slot1(() => {
            // Insert into slot1
            pipe
                .tag("div")
                .ready()
        })
        
        .slots.slot2((arg1 : number, arg2 : number) => {
            // Insert into slot2
            pipe.tag("div");
            // Prints: 1 2
            console.log(arg1, arg2);
        })
        .ready()
    
    // Just push to the default slot
    .create(new Self)
        .tag("div")
        .ready()
    
    .ready()
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
    // ..
}
else {
    // ..
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
 
```typescript
import {App, ArrayView, $} from 'vcc';

compose(new App)
    .create (new ArrayView)
        .props.model(new ArrayModel<string>)
        .slots.item((item : string, index : number) => {
            // create some nodes here
        })
        .ready()
    .ready()
```

### Debugging comments

Use `node.debug` tag to define debug comments:
```typescript
import {App, compose} from 'vcc';

compose(new App)
    .debug(stringValueOrBind)
    .ready()
```

## Advanced

There are some advanced options, which can be coded using Vasille
Functional language.

### Execution

DOM creation by default is a UI blocking operation, 
custom components can be rendered non-freezing UI,
also predefined repeaters have a special property 
`freezeUi` with `true` as default value.

Example:
```javascript
import {App, SetView, compose} from 'vcc';

// Customize current component rendering 
compose(new App({
    freezeUi: false
}))
    // Cutomize repeater render
    .create(new SetView)
        .props.freezeUi(false)
        .ready()
    .ready()
```

### Pointers

A pointer can be defined using a `point` method.

```typescript
import {App, compose, point, value} from 'vcc';

let pointer = point<string>('default-value');
let x = ref('x');
let y = ref('y');

console.log(x, y, pointer); //< prints `x y default-value`

// change pointer value
pointer = x;

console.log(x, y, pointer); //< prints `x y x`

// change pointed value;
pointer = value(y);
// equivalent to
pointer = 'y';

console.log(x, y, pointer); //< prints `y y y`

compose(new App);
```

### Watch for
"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```typescript
import {App, compose} from 'vcc';

compose(new App)
    .create(new Watch)
        .props.model(someReactiveValue)
        // defines some node here
        .ready()
    .ready()
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
