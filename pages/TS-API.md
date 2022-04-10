# Vassile - High Level Procedural Composition Documentation

To create a Vasille.js component, create a file with extension `.vc.js` or `.vc.ts` and 
define a template based on `App`, `Component`, `Fragment` or `Reactive`.

Example of app:

```typescript jsx
import {app} from 'vasille';

export default app(() => {
    // empty
});
```

Example of component:

```typescript jsx
import {component} from 'vasille';

export default component(() => {
    // empty
});
```

Example of fragment:

```typescript jsx
import {fragment} from 'vasille';

export default fragment(() => {
    // empty
});
```

Example of Reactive:

```typescript jsx
import {reactive} from 'vasille';

export default reactive(() => {
    // empty
});
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

Component state is composed of declared variables, reactive ones can be created by a call
to `ref<type>(initialValue: type): type` method:

```typescript jsx
import {app, ref} from 'vasille';

export default app(() => {
    let foo = ref(2);
    let bar = ref('bar');

    // non reactive data
    let data = 3;

    // const data
    const pi = 3.14;
});
```

### Component properties

Use a interface declaration to declare component properties

```typescript jsx
import {app, Options, IValue} from 'vasille';

interface MyComponentOptions extends Options {
    foo: number         // property
    bar: IValue<string> // reactive property
    ff?: string         // optional property
}

export default app<MyComponentOptions>(({foo, bar, ff}) => {
    // foo is a number
    // bar is a reactive string value
    // ff is a string or undefined
});
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`expr<type>(expr: (...args: ...any) => type, ...args: ...IValue<type>): type` function:

```typescript jsx
import {app, ref, expr} from 'vasille';

export default app(() => {
    const x = ref(2);
    const y = ref(3);
    const z = expr<number>((x, y) => x + y, x, y);

    // multiline computed property
    const multilineExpression = expr<number>((x, y) => {
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
    }, x, y);

    // partial bind expression
    let z1 = expr<number>((x) => x + y.$, x); //< update only on x change
    let z2 = expr<number>((y) => x.$ + y, y); //< update only on y change
})
```

### Methods (functions)

To declare a component method, just declare a function:

```typescript jsx
import {app} from 'vasille';

export default app(() => {
    // private method
    function sum(a : number, b : number) : number {
        return a + b;
    }

    created(() => {
        console.log(sum(1, 2)); // prints 3
    });
});
```

There is possible to make a method public:
```typescript jsx
import {app, Options} from 'vasille';

interface Out {
    sum : (a : number, b : number) => void
}

export default app<Options, Out>(() => {
    // private method
    function sum(a : number, b : number) : number {
        return a + b;
    }

    console.log(sum(1, 2)); // prints 3
    
    return {
        sum
    };
});
```

### Components hooks

The Vasille components has 3 hooks. The `created`
hook is called when the component is created and properties are 
initialized. The `mounted` hook is called when all elements defined in
component are mounted. The`destroyed` hook is called when component is destroyed.

```typescript jsx
import {app, destroyed, created, mounted} from 'vasille';

export default app(() => {
    // created hook
    
    // DOM creation code 
    
    // mounted hook
}, () => {
    // destroyed hook
})
```

### Events

An event can be handled outside of function, events are declared 
as part of input options.

Syntax:
```typescript jsx
import {app, Options} from 'vasille';

interface Input extends Options {
    myEvent?: (x: number, y: number) => void
}

export default app(({myEvent}) => {
    myEvent?.(2, 3);
});
```

### Watchers

A watcher is an anonymous function which will be called each time when a 
bound variable get changed. Call `watch(expr: (...args: ...any) => void, ...args : IValue<any>)` method
to define a watcher.

Example:

```typescript jsx
import {app, ref, watch} from 'vasille';

export default app(() => {
    const x = ref(0);
    const y = ref(0);
    const visible = ref(false);

    watch((x, y) => {
        if (x < 0 && y < 0) {
            visible.$ = true;
        } else {
            visible.$ = false;
        }
    }, x, y);

    // Force partial watch
    watch((x) => {
        if (x < 0 && y < 0) {
            visible = false;
        } else {
            visible = true;
        }
    }, x);
});
```

## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

Use JSX to define composition function:
```javascript
import {app, tag, text} from 'vasille';

export default app(() => {
    tag("div", {}, () => {
        tag("p", {}, () => {
            text("some text here");
        });
    });
});
```

### Render functions

Use JSX to define composition function:
```typescript jsx
import {App} from 'vasille';

function renderFunction(x : number) {
    tag('span', {}, () => {
        text(`${x}`);
    });
}

export default app(() => {
    renderFunction(23);
});
```

### Subcomponents

Subcomponents must be imported.
```javascript
import {app} from 'vasille';
import {MyComponent} from './MyComponent';

export default app(() => {
    MyComponent();
});
```

### Attributes and properties

Example:

```typescript jsx
import {app, expr} from 'vasille';

export default app(() => {
    tag("div", {
        attr: {
            id: "id",
            'data-xcode': "xcode",
            'expr-example': expr((a, b) => a + b, a, b)
        }
    }, () => {
        MyComponent({
            prop1: "string value",
            prop2: expr((x, y) => x + y, x, y)
        });
    });
});
```

### Class directives

```typescript jsx
import {app} from 'vasille';

export default app(() => {
    tag("div", {
        class: [
            "static-class", // string value
            dynamicalClass, // IValue<string>
            {
                conditionalClass: condition // IValue<boolean>
            }
        ]
    });
});
```

### Style directives

Example:
```typescript jsx
import {app} from 'vasille';


let h = 23;

export default app(() => {
    tag("div", {
        style: {
            'width': "3px",
            'height': [h, "px"]
        }
    });
});
```

### Listen for events

Examples:
```typescript jsx
import {app} from 'vasille';
import {MyComponent} from './MyComponent';

export default app(() => {
    tag("div", {
        event: {
            mousedown: () => { /* code here */ },
            mousemove: ev => x = ev.clientX
        }
    });
    MyComponent({
        on: {
            eventName: () => { /* code here */ },
            hover: state => hover = state
        }
    });
});
```

### Setting inner HTML

Use `set` to set innerHTML of element.

```typescript jsx
import {App} from 'vasille';

let code = ref('<html>code</html>');

export default app(() => {
    tag("p", {
        bind: {
            html: code
        }
    });
});
```

### Reference to node or subcomponents

Use fields to define a reference, assigning value to it make a reference
available outside of `render` function.

References are available in `mounted` hook.

Examples:
```typescript jsx
import {app} from 'vasille';
import {MyComponent, MyComponentOut} from './MyComponent';

export default app(() => {
    let div !: HTMLElement;
    let sub !: MyComponentOut;
    let items : Set<HTMLElement> = new Set;

    console.log(div, sub); // All undefined, items.size == 0

    div = tag("div");
    sub = MyComponent({}, () => {
        items.add(tag('p'));
        items.add(tag('p'));
        items.add(tag('p'));
    });

    console.log(div, sub); // All defined, items.size == 3
});
```

### Slots

Use `slot` tag to define a slot.

Example:

```typescript jsx
import {app, Options} from 'vasille';
import {fragment} from "./stack";

interface In extends Options {
    slot ?: () => void // a default slot is always called `slot`
    slot2 ?: (from: number, to: number) => void
}

const example = fragment<In>(({slot, slot2}) => {
    // create content of slot
    slot ? slot() : tag("div");
    slot2 && slot2(2, 4);
});

export default app(() => {
    // example of using
    example({
        slot: () => tag("div"), // inserts content to first slot
        slot2: (from, to) => text(`from: ${from}, to: ${to}`) // inserts content to second slot
    });
    // example of using default slot
    example({}, () => {
        // Also inserts content to first slot
        tag("div");
    });
});
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
v.if(condition, () => {
    // code...
})
```

### `if (..) {..} else {..}`

If-else has a condition and 2 callbacks, the first will be released when the
condition is true, the second will be released when the condition is false.
```javascript
v.if(condition, () => {
    // code...
});
v.else(() => {
    // else code...
});
```

### `if (..) {..} else if ..`

A switch accepts pairs of conditions and callback.
```javascript
v.if(condition, () => {
    // code...
});
v.elif(condition, () => {
    // code...
});
v.else(condition, () => {
    // code...
});
```

### Custom components

A repeater will repeat a fragment, by a special rule.
Use `v.for` with `ArrayModel`, `ObjectModel`, `SetModel`, `MapModel` & number values.

```typescript jsx
import {App, ArrayView, ArrayModel} from 'vasille';

const model = new ArrayModel<string>();

export default app(() => {
    v.for(model, (item, index) => {
        tag("li", {}, () => {
            text(item);
        });
    });
});
```

### Debugging comments

Use `Debug` tag to define debug comments:
```typescript jsx
import {App, Debug} from 'vasille';

export default app(() => {
    debug(stringValueOrExpression);
});
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
import {App, SetView} from 'vasille';

// Customize current app rendering 
<App freezeUi={false}>
    <!-- Cutomize repeater render -->
    <SetView set:freezeUi={false} />
</App>
```

### Pointers

A pointer can be defined using a `point` method.

```typescript jsx
import {App, ref, point, extract, setValue, valueOf} from 'vasille';

export default app(() => {
    let x = ref('x');
    let y = ref('y');
    let pointer = point(x);

    console.log(x, y, pointer); //< prints `x y default-value`

    // change pointer value
    setValue(pointer, x);

    console.log(valueOf(x), valueOf(y), valueOf(pointer)); //< prints `x y x`

    // change pointed value;
    setValue(pointer, valueOf(y));

    console.log(valueOf(x), valueOf(y), valueOf(pointer)); //< prints `y y y`
});
```

### Watch for
"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```typescript jsx
import {App} from 'vasille';

export default app(() => {
    v.watch(reactiveValue, () => {
        // code...
    });
});
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
