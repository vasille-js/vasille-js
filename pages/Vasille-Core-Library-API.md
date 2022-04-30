# Vassile Core Library - Low Level Object-Oriented Programming Documentation

To create a Vasille CL component, create a file with extension `.js` or `.ts` and 
define a ES6 class which extends `App`, `Component`, `Extension` or `Fragment`.

Example:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
}
```

A `App` is a root of a Vasille.js application, it will be bounded to
an existing DOM node. `Component` defines a typical component, which root
is an HTML node created by Vasille.js. `Fragment` can contain any number of
nodes at top level. `Extension` are used to extend a component.

## Table of content
[[_TOC_]]

### Component data/state

Component state is composed of private class fields, created by a call
to `ref<T>(initialValue: T): IValue<T>` method:

```typescript
import { App } from 'vasille';

class MyComponent extends App {
    compose() {
        // reactive data
        const foo = this.ref(2);
        const bar = this.ref('bar');
        
        // non reactive data
        const data = 3;
    }
}
```

### Component properties

Component properties are declared in an interface type which
extends `AppOptions` for `VApp`, `Options` for `VFragment` or
`TagOptions` for others:

```typescript
import {App, TagOptions, IValue} from 'vasille';

interface MyComponentOptions extends AppOptions<"div"> {
    x?: number; // non reactive prop
    y: IValue<number>; // reactive prop
}

class MyComponent extends App<MyComponentOptions> {
    compose({x, y}) {
        console.log(x, y);
    }
}
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`expr<T, ...Args>(expr: (args: ...Args) => T, ...args: IValue<...Args>): IValue<T>` method:

```typescript
import { App } from 'vasille';

class MyComponent extends App {
    compose() {
        const x = this.ref(2);
        const y = this.ref(3);
        const z = this.expr((x, y) => x + y, this.x, this.y);
        
        // multiline computed expression
        const multilineExpression = this.expr((x, y, visible) => {
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
        }, this.x, this.y, this.visible);
        
        // partial bind expression
        const z1 = this.expr(x => x + y.$, x);
        const z2 = this.expr(y => x.$ + y, y);
    }
}
```

### Methods (functions)

To declare a component method, just declare a function:

```typescript
import { App } from 'vasille';

class MyComponent extends App {
    compose() {
        function sum (a, b) {
            return a + b;
        }
    }
    
}
```

Any method is available outside of component.

### Components hooks

The Vasille.js components has 4 hooks and some milestones. The `created`
hook is called when the component is created and properties are 
initialized. The `mounted` hook is called when all elements defined in
component are mounted The`destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose() {
        // created

        // DOM composition code

        // mounted

        this.runOnDestroy(() => {
            // destroyed
        });
    }
}
```

### Events

To send and handle custom events use props;

Syntax:

```typescript
import {App, AppOptions} from 'vasille';

interface Input extends AppOptions {
    onEvent ?: (x : number, y : number) => void;
}

class MyComponent extends App {
    compose({onEvent}) {
        // emit a event
        onEvent && onEvent(1, 2);
    }
}
```

### Watchers

A watcher is an anonymous function which will be called each time when a 
bound variable get changed. Call 
`watch<...Args>(expr: (args: ...Args), ...args: IValue<...Args>)` method
to define a watcher in `createWatchers` milestone.

Example:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        const x = this.ref(0);
        const y = this.ref(0);
        const visible = this.ref(false);
        
        this.watch((x, y) => {
            if (x < 0 && y < 0) {
                visible.$ = true;
            }
            else {
                visible.$ = false;
            }
        }, x, y);
    }
}
```


## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

An HTML tag is defined by 
`tag(tagName: string, callback: (createdNode: TagNode) => void)`
method in `compose` milestone:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        this.tag("div", {}, div => {
            div.tag("p", {}, p => {
                p.text("some text here");
            });
        });
    }
}
```

### Subcomponents

Subcomponents must be imported, after are defined by a call to
`create<T>(component: T, callback?: T.input.slot) : T.input.return` method.
```javascript
import { App } from 'vasille';
import { Component } from './Component';

class MyComponent extends App {
    compose () {
        this.create(new Component({}));
    }
}
```

### Attributes and properties

Attributes and properties are set using options parameter.

Example:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        const a = this.ref(0);
        const b = this.ref(0);
        
        this.tag("div", {
            "v:attr": {
                id: "id1",
                "data-class": "class",
                "data-sum": this.expr((a, b) => a + b, a, b)
            }
        });
        this.create(new Component({
            prop1: "string value",
            prop2: 100,
            prop3: a
        }));
    }
}
```

### Class directives

Classes are set using options parameter:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        const dynamicalClass = this.ref('dynamical-class');
        const condition = this.ref(false);
        
        this.tag("div", {
            class: [
                "static-classs",
                dynamicalClass,
                { conditionalClass: condition }
            ]
        });
    }
}
```

### Style directives

Style are set using options parameter:

Example:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        const reactive = this.ref(0);
        const composed = this.expr(reactive => `${reactive}px`, reactive);
        
        this.tag("div", {
            style: {
                width: '3px',
                // the next style values are equivalent
                margin: [reactive, 'px'],
                padding: composed,
            }
        });
    }
}
```

### Listen for events

Listeners to DOM events are set using options parameter:

```javascript
import { App } from 'vasille';
import {Component} from './Component'; 

class MyComponent extends App {
    compose () {
        this.tag("div", {
            'v:event': {
                mousedown: () => { /* code here */ },
                mousemove: event => event.target.click()
            }
        });
        this.create(new Component, {
            'onHover': () => { /* code here */ },
            'onClick': () => { /* code here */ }
        });
    }
}
```

### Setting inner HTML

Inner HTML are set/bound using options parameter:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        const html = this.ref('code');
        
        this.tag("p", {
            "v:set": {
                'innerHTML': 'code' // on define assigment
            },
            "v:bind": {
                'innerHTML': html // reactive assigment
            }
        });
    }
}
```

### Reference to node

Use variables and assign the result of `tag` function;

Examples:
```typescript
import { App } from 'vasille';
import MyComponent from './MyComponent';

class MyComponent extends App {
    compose () {
        const items : Set<HTMLElement> = new Set();
        
        const div = this.tag("div");
        this.create(new MyComponent({}), (node) => {
            items.add(node.tag('p', {}));
            items.add(node.tag('p', {}));
            items.add(node.tag('p', {}));
        });
    }
}
```

### Slots

Slots are functions which trigger the composition of subcomponent.

Example:

```typescript
import {App, Options, Fragment} from 'vasille';

interface Opts extends Options {
    slot1?: (node: Fragment) => void;
    slot2?: (node : Fragment, x : number, y : number) => void;
}

class MyComponent extends Fragment<Opts> {
    compose({slot1, slot2}) {
        // You can predefine slot content
        // Predefined content will be overritten
        // Create the content of first slot
        if (slot1) {
            slot1(this);
        }
        else {
            this.tag('div', {});
        }
        
        this.create(new MyComponent({}), node => {
            // Create the content of second slot in a children node
            slot2 && slot2(node, 1, 2);
        });

        this.create(new MyComponent({
            slot1: slot => {
                // Insert into slot1
                slot.tag("div");
            },
            slot2: (slot, arg1, arg2) => {
                // Insert into slot2
                slot.tag("div");
                // Prints: 1 2
                console.log(arg1, arg2);
            }
        }));

        // The easy way
        this.create(new MyComponent({}), node => {
            node.tag("div");
        });
    }
}
```

## Flow control

Flow can be controlled using methods:
* `if (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `elif (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `else (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `create<T> (nodeT : T, slot : (node : Fragment, ...) => void)`
  

### `if`

The `if` has one condition, and one callback which get executed when the condition
is true:
```javascript
import { App } from 'vasille';

class MyApp extends App {
    compose() {
        const condition = this.ref(false);
        
        this.if(condition, node => {
            // ..
        })
    }
}
```

### `if_else`

If-else is composed of a 'if' and 'else' calls:
```javascript
import { App } from 'vasille';

class MyApp extends App {
    compose() {
        const condition = this.ref(false);

        this.if(condition, () => {
            // ..
        });
        this.else(() => {
            // ..
        });
    }
}
```

### `if_else_if`

A switch accepts pairs of conditions and callback.
```typescript
import { App } from 'vasille';

class MyApp extends App {
    compose() {
        const condition = this.ref(false);
        
        this.if(condition, () => {
            // ..
        });
        this.elif(condition, () => {
            // ..
        });
    }
}
```

### `create`

A repeater will repeat a fragment, by a special rule. List of predefined repeaters:
* `ArrayView` - use `ArrayModel` as model.
* `ObjectView` - use `ObjectModel` as model.
* `SetView` - use `SetModel` as model.
* `MapView` - use `MapModel` as model.

```typescript
import {App, ArrayModel} from 'vasille';
import {} from "./array-model";

class MyApp extends App {
    compose() {
        const model = this.register(new ArrayModel());

        this.create(new ArrayView({ model }), (value) => {
            // ..
        });
    }
}
```

### Debugging comments

Use `debug` tag to define debug comments:
```javascript
import { App } from 'vasille';

class MyApp extends App {
    compose() {
        const condition = this.ref('false');

        // will create a comment in HTML if debug mode is enabled
        this.debug(condition);
    }
}
```

## Advanced

There are some advanced options, which can be coded using Vasille.js
language.

### Pointers

A pointer can be defined using a `point` method.

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {

        const x = this.ref('x');
        const y = this.ref('y');

        const pointer = this.point(x);

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
    }
}
```

### Watch for

"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```javascript
import { App } from 'vasille';

class MyApp extends App {
    compose() {
        const model = this.ref('false');

        this.create(new Watch({model}), (modelValue) => {
            // define some content here
        })
    }
}
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
