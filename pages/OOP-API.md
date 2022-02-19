# Vassile - Low Level Object-Oriented Programming Documentation

To create a Vassile.js component, create a file with extension `.js` and 
define a ES6 class which extends `App`, `Component`, `Extension` or `Fragment`.

Example:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {
        super();
    }
}
```

A `App` is a root of a Vasille.js application, it will be bounded to
an existing DOM node. `Component` defines a typical component, which root
is an HTML node created by Vasille.js. `Fragment` can contain any number of
nodes at top level. `Extension` are used to extend a component.

## Table of content
[[_TOC_]]

## Class fields and methods

Component data, functions, events, slots and watcher are defined as class
fields and methods.


### Component data/state

Component state is composed of private class fields, created by a call
to `ref<T>(initialValue: T): Reference<T>` method:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {
        super();
        
        this.foo = this.ref(2);
        this.bar = this.ref('bar');
        
        // non reactive data
        this.data = 3;
    }
}

// const data
const pi = 3.14;
```

### Component properties

Component properties are created by a call to 
`prop<T>(initialValue?: T): Reference<T>` method:

```typescript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {
        super();
        
        this.foo = this.ref<number>(0);
        this.bar = this.ref<string>('default value');
    }
}
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`bind<T, ...Args>(expr: (args: ...Args) => T, ...args: IValue<...Args>): Expression<T>` method:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {
        super();
        
        this.x = this.ref(2);
        this.y = this.ref(3);
        this.z = this.bind((x, y) => x + y, this.x, this.y);
        
        // multiline computed expression
        this.multilineExpression = this.bind((x, y, visible) => {
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
        this.z1 = this.bind(x => x + this.y.$, this.x);
        this.z2 = this.bind(y => this.x.$ + y, this.y);
    }
}
```

### Methods (functions)

To declare a component method, just declare a method:

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    sum (a, b) {
        return a + b;
    }
}
```

Any method is available outside of component.

### Components hooks

The Vasille.js components has 4 hooks and some milestones. The `created`
hook is called when the component is created and properties are 
initialized. The `mounted` hook is called when all elements defined in
component are mounted. The `ready` hook is called when all elements 
declared is component and installed to its slots are mounted. The
`destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    created () {
        super.created();
        // created hook
    }
    mounted () {
        super.mounted();
        // mounted hook
    }
    ready () {
        super.ready();
        // ready hook
    }
    destroy () {
        // before destroy hook
        super.destroy();
        // after destroy hook
    }
}
```

### Events

To send and handle custom events use
class `Signal<...Args>`, it contain next methods:
* `emit(args: ...Args)`.
* `subscribe(handler: (args: ...Args) => void)`.
* `unsubscribe(handler: (args: ...Args) => void)`.

Syntax:
```typescript
import { App } from 'vasille';

class MyComponent extends App {
    myEvent = new Signal<number, number>;
    
    mounted () {
        // emit a event
        this.myEvent.emit(1, 2);
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
    constructor() {
        super();
        
        this.x = this.ref(0);
        this.y = this.ref(0);
        this.visible = this.ref(false);
    }
    
    createWatchers () {
        this.watch((x, y) => {
            if (x < 0 && y < 0) {
                this.visible.$ = true;
            } else {
                this.visible.$ = false;
            }
        }, this.x, this.y);
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
        this.tag("div", div => {
            div.tag("p", p => {
                p.text("some text here");
            });
        });
    }
}
```

### Subcomponents

Subcomponents must be imported, after are defined by a call to
`create<T>(component: T, callback?: (T) => void, callback?: (T) => void`
method. `props` handler is used to set up component properties.
```javascript
import { App } from 'vasille';
import {Component} from './Component';

class MyComponent extends App {
    compose () {
        this.create(new Component, $ => {});
    }
}
```

### Attributes and properties

Properties of components are set upped in `props` handler.
Attributes are set upped by calls next methods:
* `bindAttr<...Args> (name: string, expr: (args: ...Args) => string, ...values: IValue<...Args>)`.
* `defAttr (name: string, value: IValue<string>)`.
* `setAttr (name: string, value: string)`.

`set*` methods are used to set up static values.
`*` methods are used to set up dynamical values.
`bind*` methods are used to bind expressions.

Example:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        this.tag("div", div => {
            div.setAttr("id", "id1");
            div.setAttr("class", "class1 class2");
            div.bindAttr("data-sum", (a, b) => {
                return this.sum(a, b);
            }, this.a, this.b);
        });
        this.create(new Component, $ => {
            $.prop1 = "string value";
            $.prop2 = $.bind((x, y) => x + y, this.x, this.y);
        });
    }
}
```

### Class directives

Class directives are used to define dynamical and conditional classes.
The next methods is used to set up classes:
* `addClass (cl: string)`.
* `addClasses (...cl: string)`.
* `bindClass (cl: IValue<string>)`.
* `floatingClass (value: IValue<boolean>, cl: string)`.

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        this.tag("div", div => {
            div.addClass("static class");
            div.bindClass(this.ref('dynamical class'));
            div.floatingClass(this.condition, "conditionalClass");
        });
    }
}
```

### Style directives

Style can be defined static and dynamical. The next methods are used to
set up style:
* `defStyle (name: string, value: string | IValue<string>)`.
* `bindStyle<...Args> (name: string, calculator: (args: ...Args), ...values: IValue<...Args>)`.
* `setStyle (prop: string, value: string)`.

Example:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        this.tag("div", div => {
            div.setStyle("width", "3px");
            div.bindStyle("width", (w) => w + 'px', this.width);
        });
    }
}
```

### Listen for events

To listen for default DOM events, use `listen` method or one of `on*`
methods. To listen to component events use `on` method.

Examples:
```javascript
import { App } from 'vasille';
import {Component} from './Component'; 

class MyComponent extends App {
    compose () {
        this.tag("div", div => {
            div.onmousedown(() => { /* code here */ });
            div.onmousemove(ev => this.x.$ = ev.clientX);
        });
        this.defElement(new Component, component => {
            component.eventName.subscribe(() => { /* code here */ });
            component.hover.subscribe(() => this.hover.$ = true);
        });
    }
}
```

### Setting inner HTML

Use `html` method to set inner HTML:
```javascript
import { App } from 'vasille';

class MyComponent extends App {
    compose () {
        this.tag("p", p => {
            p.html(htmlCode);
        });
    }
}
```

### Reference to node or subcomponents

Use field to define a reference, assign value to it make a reference
available outside of `compose` milestone.

References are available in `mounted` hook.

Examples:
```typescript
import { App } from 'vasille';
import MyComponent from './MyComponent';

class MyComponent extends App {
    div: HTMLElement;
    sub: MyComponent;
    items: Set<HTMLElement> = new Set();
    
    compose () {
        this.tag("div", (vElement, element) => {
            this.div = element;
        });
        this.create(new MyComponent, $ => {
            this.sub = $;
            
            $.slot.insert(node => {
                node.tag("p", (v, p) => this.items.add(p));
                node.tag("p", (v, p) => this.items.add(p));
                node.tag("p", (v, p) => this.items.add(p));
            })
        });
    }
}
```

### Slots

Use `Slot` constructor to define a slot, and use `release` or `predefine` method to create the
slot content. To insert data to child slot use `insert` method.

Example (it is recursively, don't try to run this code):
```typescript
import {App, Fragment, Slot} from 'vasille';

class MyComponent extends App {
    // The first declared slot is a default one
    slot1 = new Slot<>();
    slot2 = new Slot<number, number>();
    
    compose () {
        // You can predefine slot content
        // Predefined content will be overritten
        // Create the content of first slot
        this.slot1.predefine(node => {
            node.tag("div");
        }, this);
        
        this.create(new MyComponent, $ => $.slot.insert((node) => {
            // Create the content of second slot in a children node
            this.slot2.release(node, 1, 2);
        }));
        
        this.create(new MyComponent, $ => {
            $.slot1.insert(slot => {
                // Insert into slot1
                slot.tag("div");
            });
            
            $.slot2.insert((slot, arg1, arg2) => {
                // Insert into slot2
                slot.tag("div");
                // Prints: 1 2
                console.log(arg1, arg2);
            });
        });

        // The easy way
        this.create(new MyComponent, $ => $.slot.insert((node) => {
            node.tag("div");
        }));
    }
}
```

## Flow control

Flow can be controlled using methods:
* `if (cond: IValue<boolean>, cb: (node: RepeatNodeItem) => void)`.
* `if_else ( ifCond: IValue<boolean>,
    ifCb: (node: RepeatNodeItem) => void, 
    elseCb: (node : RepeatNodeItem) => void)`.
* `switch (...cases : Array<{ cond: IValue<boolean> | boolean, 
  cb: (node: RepeatNodeItem) => void }>)`.
* `create<T> ( nodeT : T, props : ($ : T) => void)`
  

### `if`

The `if` has one condition, and one callback which get executed when the condition
is true:
```javascript
this.if(booleanCondition, (node) => {
    // ..
});
```

### `if_else`

If-else has a condition and 2 callbacks, the first will be released when the
condition is true, the second will be released when the condition is false.
```javascript
this.if_else(condition, trueNode => {
    // ..
}, falseNode => {
    // ..
});
```

### `switch`

A switch accepts pairs of conditions and callback.
```javascript
this.switch(
    this.case(condition, fragment => {
        // create DOM here
    }),
    this.case(condition, fragment => {
        // create DOM here
    }),
    this.default(fragment => {
        // create DOM here
    })
);
```

### `create`

A repeater will repeat a fragment, by a special rule. List of predefined repeaters:
* `RepeatNode` - repeat a fragment x times.
* `ArrayView` - use `ArrayModel` as model.
* `ObjectView` - use `ObjectModel` as model.
* `SetView` - use `SetModel` as model.
* `MapView` - use `MapModel` as model.
 
```typescript
this.create(new MapView, $ => {
    $.model = new MapModel<int, string>;
    $.slot.insert((node: Fragment, item: string, index: number) => {
        // create items here
    });
});
```

### Debugging comments

Use `debug` tag to define debug comments:
```html
this.debug(stringValueOrBind);
```

## Advanced

There are some advanced options, which can be coded using Vasille.js
language.

### Executors

An executor is a class which releases all changes in DOM, the default
executor is `InstantExecutor`, it applies all changes immediately.

Example how to apply a custom executor:
```javascript
import { App } from 'vasille';
import { MyExecutor } from "./MyExecutor";

class MyComponent extends App {
    constructor() {
        super(node, {
            freezeUi: false
        });
    }
    
    compose() {
        this.create(new ArrayView, $ => {
            $.freezeUi = false;
            $.slot.insert((node, value, index) => {
                //
            })
        });
    }
}
```

### Pointers

A pointer can be defined using a `point` method.

```javascript
import { App } from 'vasille';

class MyComponent extends App {
    constructor() {
        this.pointer = this.point<string>('');
        this.pointer = 'default-value';

        this.x = this.ref('x');
        this.y = this.ref('y');

        // prints `x y default-value`
        console.log(this.x.$, this.y.$, this.pointer.$);
        
        // change pointer value
        this.pointer.point(x);

        // prints `x y x`
        console.log(this.x.$, this.y.$, this.pointer.$);

        // change pointed value;
        this.pointer.$ = y.$;
        // equivalent to
        this.pointer.$ = 'y';

        // prints `y y y`
        console.log(this.x.$, this.y.$, this.pointer.$);
    }
}
```

### Watch for

"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```javascript
this.create(new Watch, $ => {
    $.model = variable;
    $.slot.insert(node => {
        // defines some node here
    });
});
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
