# Vassile Less Library - Low Level Object-Oriented Programming Documentation

To create a Vasille Less component, create a file with extension `.js` or `.ts` and
define a constant of type `VApp`, `VComponent`, `VExtension` or `VFragment`.

Example:

```typescript
import { VApp, app } from 'vasille-less';

const MyComponent : VApp = app(() => {
    // ..
})
```

A `VApp` is a root of a Vasille.js application, it will be bounded to
an existing DOM node. `VComponent` defines a typical component, which root
is an HTML node created by Vasille.js. `VFragment` can contain any number of
nodes at top level. `VExtension` are used to extend a component.

## Table of content
[[_TOC_]]

### Component data/state

Component state is composed of private class fields, created by a call
to `ref<T>(initialValue: T): IValue<T>` method:

```typescript
import { VApp, value, app } from 'vasille-less';

const MyComponent1 : VApp = app(() => {
    // reactive data
    let foo = value(2);
    let bar = value('bar');

    // non reactive data
    const data = 3;
})

// React style

import { VApp, ref, app } from 'vasille-less';

const MyComponent2 : VApp = app(() => {
  // reactive data
  const [foo, setFoo] = ref(2);
  const [bar, setBar] = ref('bar');

  // non reactive data
  const data = 3;
})
```

### Component properties

Component properties are declared in an interface type which
extends `AppOptions` for `VApp`, `Options` for `VFragment` or
`TagOptions` for others:

```typescript
import {VApp, TagOptions, IValue} from 'vasille-less';

interface MyComponentOptions extends AppOptions<"div"> {
    x?: number; // non reactive prop
    y: IValue<number>; // reactive prop
}
const MyComponent : VApp = app(({x, y}) => {
    console.log(x, y);
})
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`expr<T, ...Args>(expr: (args: ...Args) => T, ...args: IValue<...Args>): IValue<T>` method:

```typescript
import { VApp, app, expr } from 'vasille-less';

const MyApp : VApp = app(() => {
    const x = ref(2);
    const y = ref(3);
    const z = expr((x, y) => x + y, x, y);

    // multiline computed expression
    const multilineExpression = expr((x, y, visible) => {
        let result;

        switch (x) {
            case 1:
                result = x + 2;
                break;

            case 2:
                result = y + 3;
                break;

            default:
                result = visible ? x - 2 : y - 4;
                break;
        }

        return result;
    }, x, y, visible);

    // partial bind expression
    const z1 = expr(x => x + y.$, x);
    const z2 = expr(y => x.$ + y, y);
}) 
```

### Methods (functions)

To declare a component method, just declare a function:

```typescript
import { VApp, app } from 'vasille-less';

const MyApp : VApp = app(() => {
    function sum (a, b) {
        return a + b;
    }
})
```

Any method is available outside of component.

### Components hooks

The Vasille.js components has 4 hooks and some milestones. The `created`
hook is called when the component is created and properties are
initialized. The `mounted` hook is called when all elements defined in
component are mounted The`destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```javascript
import { VApp, app } from 'vasille-less';

const MyApp : VApp = app(() => {
    // created

    // DOM composition code

    // mounted

    v.runOnDestroy(() => {
        // destroyed
    });
});
```

### Events

To send and handle custom events use props;

Syntax:

```typescript
import {VApp, AppOptions} from 'vasille-less';

interface Input extends AppOptions {
    onEvent ?: (x : number, y : number) => void;
}

const MyApp: VApp = app(({onEvent}) => {
    // emit a event
    onEvent && onEvent(1, 2);
});
```

### Watchers

A watcher is an anonymous function which will be called each time when a
bound variable get changed. Call
`watch<...Args>(expr: (args: ...Args), ...args: IValue<...Args>)` method
to define a watcher in `createWatchers` milestone.

Example:

```javascript
import { VApp, value } from 'vasille-less';

const MyApp: VApp = app(() => {
    const x = value(0);
    const y = value(0);
    const visible = value(false);
    
    watch((x, y) => {
        if (x < 0 && y < 0) {
            visible.$ = true;
        }
        else {
            visible.$ = false;
        }
    }, x, y);
})
```


## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

An HTML tag is defined by
`tag(tagName: string, callback: (createdNode: TagNode) => void)`
method in `compose` milestone:
```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    tag("div", {}, div => {
        tag("p", {}, p => {
            text("some text here");
        });
    });
});
```

### Subcomponents

Subcomponents must be imported, after are defined by a call to
`create<T>(component: T, callback?: T.input.slot) : T.input.return` method.
```javascript
import { VApp } from 'vasille-less';
import { Component } from './Component';

const MyApp: VApp = app(() => {
    Component({});
})
```

### Attributes and properties

Attributes and properties are set using options parameter.

Example:
```javascript
import { VApp, value } from 'vasille-less';

const MyApp: VApp = app(() => {
    const a = value(0);
    const b = value(0);
    
    tag("div", {
        "v:attr": {
            id: "id1",
            "data-class": "class",
            "data-sum": expr((a, b) => a + b, a, b)
        }
    });
    Component({
        prop1: "string value",
        prop2: 100,
        prop3: a
    });
})
```

### Class directives

Classes are set using options parameter:

```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const dynamicalClass = ref('dynamical-class');
    const condition = ref(false);
    
    tag("div", {
        class: [
            "static-classs",
            dynamicalClass,
            { conditionalClass: condition }
        ]
    });
})
```

### Style directives

Style are set using options parameter:

Example:
```javascript
import { VApp, value } from 'vasille-less';

const MyApp: VApp = app(() => {
    const reactive = value(0);
    const composed = expr(reactive => `${reactive}px`, reactive);
    
    tag("div", {
        style: {
            width: '3px',
            // the next style values are equivalent
            margin: [reactive, 'px'],
            padding: composed,
        }
    });
})
```

### Listen for events

Listeners to DOM events are set using options parameter:

```javascript
import { VApp } from 'vasille-less';
import {Component} from './Component'; 

const MyApp: VApp = app(() => {
    tag("div", {
        'v:event': {
            mousedown: () => { /* code here */ },
            mousemove: event => event.target.click()
        }
    });
    Component({
        'onHover': () => { /* code here */ },
        'onClick': () => { /* code here */ }
    });
})
```

### Setting inner HTML

Inner HTML are set/bound using options parameter:
```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const html = ref('code');
    
    tag("p", {
        "v:set": {
            'innerHTML': 'code' // on define assigment
        },
        "v:bind": {
            'innerHTML': html // reactive assigment
        }
    });
})
```

### Reference to node

Use variables and assign the result of `tag` function;

Examples:
```typescript
import { VApp, tag } from 'vasille-less';
import MyComponent from './MyComponent';

const Myapp: VApp = app(() => {
    const items : Set<HTMLElement> = new Set();
    
    const div = tag("div").node;
    MyComponent({}, () => {
        items.add(tag('p', {}).node);
        items.add(tag('p', {}).node);
        items.add(tag('p', {}).node);
    });
})
```

### Slots

Slots are functions which trigger the composition of subcomponent.

Example:

```typescript
import {VApp, Options, Fragment} from 'vasille-less';

interface Opts extends Options {
    slot1?: () => void;
    slot2?: (x : number, y : number) => void;
}

const MyComponent: Fragment<Opts> = v.fragment(({slot1, slot2}) => {
    // You can predefine slot content
    // Predefined content will be overritten
    // Create the content of first slot
    if (slot1) {
        slot1();
    }
    else {
        tag('div', {});
    }
    
    MyComponent({}, () => {
        // Create the content of second slot in a children node
        slot2 && slot2(1, 2);
    });

    MyComponent({
        slot1: () => {
            // Insert into slot1
            tag("div");
        },
        slot2: (arg1, arg2) => {
            // Insert into slot2
            tag("div");
            // Prints: 1 2
            console.log(arg1, arg2);
        }
    });

    // The easy way
    MyComponent({}, () => {
        tag("div");
    });
})
```

## Flow control

Flow can be controlled using methods:
* `v.if (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `v.elif (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `v.else (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `v.create<T> (nodeT : T, slot : (node : Fragment, ...) => void)`


### `if`

The `if` has one condition, and one callback which get executed when the condition
is true:
```javascript
import { VApp, v } from 'vasille-less';

const MyApp: VApp = app(() => {
    const condition = value(false);
    
    v.if(condition, () => {
        // ..
    });
})
```

### `if_else`

If-else is composed of a 'if' and 'else' calls:
```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const condition = value(false);

    v.if(condition, () => {
        // ..
    });
    v.else(() => {
        // ..
    });
})
```

### `if_else_if`

A switch accepts pairs of conditions and callback.
```typescript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const condition = value(false);
    
    v.if(condition, () => {
        // ..
    });
    v.elif(condition, () => {
        // ..
    });
})
```

### `create`

A repeater will repeat a fragment, by a special rule. List of predefined repeaters:
* `ArrayView` - use `arrayModel()` as model.
* `ObjectView` - use `objectModel()` as model.
* `SetView` - use `setModel()` as model.
* `MapView` - use `mapModel()` as model.

```typescript
import {VApp, ArrayModel} from 'vasille-less';

const MyApp: VApp = app(() => {
    const model = arrayModel();

    v.create(new ArrayView({ model }), (value) => {
        // ..
    });
})
```

### Debugging comments

Use `debug` tag to define debug comments:
```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const condition = ref('false');

    // will create a comment in HTML if debug mode is enabled
    v.debug(condition);
})
```

## Advanced

There are some advanced options, which can be coded using Vasille.js
language.

### Pointers

A pointer can be defined using a `point` method.

```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const x = value('x');
    const y = value('y');

    const pointer = point(x);

    // prints `x y x`
    console.log(x.$, y.$, pointer.$);
    
    // change pointer value
    pointer.$$ = y;

    // prints `x y y`
    console.log(x.$, y.$, pointer.$);

    // change pointed value;
    pointer.$ = 'z';

    // prints `y z z`
    console.log(x.$, y.$, pointer.$);
})
```

### Watch for (new in 2.1.0)

"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```javascript
import { VApp } from 'vasille-less';

const MyApp: VApp = app(() => {
    const model = value('false');

    v.watch(model, (modelValue) => {
        // define some content here
    });
});
```

## Portals (new in 2.3.7)

Portals are used to create elements somewhere else. Using portals you can
add popups in the end of the body.

Example:
```javascript
import { VApp, v } from 'vasille-less';

const MyApp: VApp = app(() => {
    v.portal(document.body, () => {
        // define some content here
        // will be inserted a the end of document.body
    });
});
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
