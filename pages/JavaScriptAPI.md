# Vassile.js JS API

To create a Vassile.js component, create a file with extension `.js` and 
define a ES6 class which extends `App`, `Component` or `Fragment`.

Example:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        super();
    }
}
```

A `App` is a root of a Vasille.js application, it will be bounded to
an existing DOM node. `Component` defines a typical component, which root
is an HTML node created by Vasille.js. `Fragment` can contain any number of
nodes at top level.

## Table of content
[[_TOC_]]

## Class fields and methods

Component data, functions, events, slots and watcher are defined as class
fields and methods.


### Component data/state

Component state is composed of private class fields, created by a call
to `$ref(initialValue: any): Reference<any>` method:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        super();
        
        this.foo = this.$ref(2);
        this.bar = this.$ref('bar');
        
        // non reactive data
        this.data = 3;
    }
}

// const data
const pi = 3.14;
```

### Component properties

Component properties are created by a call to 
`$private(type: Function, initialValue?: any): Reference<any>` method:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        super();
        
        this.foo = this.$prop(Number);
        this.bar = this.$prop(String, 'default value');
    }
}
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`$bind(expr: Function, ...args: IValue<any>): Expression` method:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        super();
        
        this.x = this.$ref(2);
        this.y = this.$ref(3);
        this.z = this.$bind((x, y) => x + y, this.x, this.y);
        
        // multiline computed expression
        this.multilineExpression = this.$bind((x, y, visible) => {
            let result;
            
            switch (x.$) {
                case 1:
                    result = x.$ + 2;
                    break;
                    
                case 2:
                    result = y.$ + 3;
                    break;

                default:
                    result = visible.$ ? x.$ - 2 : y.$ - 4;
                    break;
            }
            
            return result;
        }, this.x, this.y, this.visible);
        
        // partial bind expression
        this.z1 = this.$bind(x => x + this.y.$, this.x);
        this.z2 = this.$bind(y => this.x.$ + y, this.y);
    }
}
```

### Methods (functions)

To declare a component method, just declare a method:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    sum (a, b) {
        return a + b;
    }
}
```

Any method is available outside of component.

### Components hooks

The Vasille.js components has 4 hooks and some milestones. The `$created`
hook is called when the component is created and properties are 
initialized. The `$mounted` hook is called when all elements defined in
component are mounted. The `$ready` hook is called when all elements 
declared is component and installed to its slots are mounted. The
`$destroy` hook is called when component is destroyed.

To define a hook just overwrite the method with its name.

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    $created () {
        super.$created();
        // created hook
    }
    $mounted () {
        super.$mounted();
        // mounted hook
    }
    $ready () {
        super.$ready();
        // ready hook
    }
    $destroy () {
        // before destroy hook
        super.$destroy();
        // after destroy hook
    }
}
```

### Events

An event can be handled outside of function, events are defined in
`$createSignals` milestone, to define an event use
`$defSignal(name: string, ...paramsTypes: Function)` method, after call
`$emit(name: string, ...args: any)` to emit the defined event.

Syntax:
```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createSignals () {
        this.$defSignal("myEvent", Number, Number);
    }
    
    $mounted () {
        // emit a event
        this.$emit('myEvent', x, y);
    }
}
```

### Dependency track

Dependencies are not tracked, each update path must be programmed
individually.

### Watchers

A watcher is an anonymous function which will be called each time when a 
bound variable get changed. Call 
`$defWatcher(expr: Function, ...args: IValue<any>)` method
to define a watcher in `$createWatchers` milestone.

Example:

```typescript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        super();
        
        this.x = this.$ref(0);
        this.y = this.$ref(0);
        this.visible = this.$ref(false);
    }
    
    $createWatchers () {
        this.$defWatcher((x, y) => {
            if (x < 0 && y < 0) {
                this.visible.$ = true;
            } else {
                this.visible.$ = false;
            }
        }, this.x, this.y);
    }
}
```

## Style

A style tag which is present is each file, can be used to declare local
and global style rules. The operator `|` is used to combine a global
selector with a local one.

Examples:
```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $stylePack () {
        return [
            /* Local selector example */
            this.$local('p span', {
                width: '100%'
            }),
            /* Hybrid selector example */
            this.$hybrid('p', 'span', {
                height: '100%'
            })
        ]
    }
}
```

## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

An HTML tag is defined by 
`$defTag(tagName: string, callback: (createdNode: TagNode) => void)`
method in `$createDom` milestone:
```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createDom () {
        this.$defTag("div", div => {
            this.$defTag("p", p => {
                p.$defText("some text here");
            });
        });
    }
}
```

### Subcomponents

Subcomponents must be imported, after are defined by a call to
`$defElement<T>(element: T, props: (T) => void, callback: (T) => void`
method. `props` handler is used to set up component properties.
```javascript
import {App} from 'vasille-js';
import {Component} from './Component';

class MyComponent extends App {
    $createDom () {
        this.$defElement(new Component, $ => {});
    }
}
```

### Attributes and properties

Properties of components are set upped in `props` handler.
Attributes are set upped by calls next methods:
* `$defAttr (name: string, value: string | IValue<any>)`.
* `$defAttrs (obj: { [key: string]: string | IValue<any> })`.
* `$bindAttr (name: string, expr: Function, ...values: IValue<any>)`.
* `$setAttr (name: string, value: string)`.
* `$setAttrs (data: { [key: string]: string })`.

`$set*` methods are used to set up static values.
`$def*` methods are used to set up dynamical values.
`$bind*` methods are used to bind expressions.

Example:
```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createDom () {
        this.$defTag("div", div => {
            div.$setAttrs({
                id: "id",
                class: "class1 class2"
            });
            div.$bindAttr((a, b) => {
                return this.sum(a, b);
            }, this.a, this.b);
        });
        this.$defElement(new Component, $ => {
            $.prop1 = "string value";
            $.prop2 = $.bind((x, y) => x + y, this.x, this.y);
        });
    }
}
```

### Class directives

Class directives are used to define dynamical and conditional classes.
The next methods is used to set up classes:
* `$addClass (cl: string)`.
* `$addClasses (...cl: string)`.
* `$bindClass (cl: ?string, value: string | IValue<boolean | string>)`.

```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createDom () {
        this.$defTag("div", div => {
            div.$addClass("static class");
            div.$bindClass(null, this.dynamicalClass);
            div.$bindClass("conditionalClass", this.condition);
        });
    }
}
```

### Style directives

Style can be defined static and dynamical. The next methods are used to
set up style:
* `$defStyle (name: string, value: string | IValue<string>)`.
* `$defStyles (obj: { [key: string]: string | IValue<any> })`.
* `$bindStyle (name: string, calculator: Function, ...values: IValue<any>)`.
* `$setStyle (prop: string, value: string)`.
* `$setStyles (data: { [key: string]: string })`.

Example:
```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createDom () {
        this.$defTag("div", div => {
            div.$setStyle("width", "3px");
            div.$bindStyle("width", (w) => w + 'px', this.width);
        });
    }
}
```

### Listen for events

To listen for default DOM events, use `$listen` method or one of `$listen*`
methods. To listen to component events use `$on` method.

Examples:
```javascript
import {App} from 'vasille-js';
import {Component} from './Component'; 

class MyComponent extends App {
    $createDom () {
        this.$defTag("div", div => {
            div.$onmousedown(() => { /* code here */ });
            div.$onmousemove(ev => this.x.$ = ev.clientX);
        });
        this.$defElement(new Component, $ => {}, component => {
            component.$on("eventName", () => { /* code here */ });
            component.$on("hover", () => this.hover.$ = true);
        });
    }
}
```

### Setting inner HTML

Use `$bindHtml` method to set inner HTML:
```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    $createDom () {
        this.$defTag("p", p => {
            p.$bindHtml(this.innerHtml);
        });
    }
}
```

### Reference to node or subcomponents

Use field to define a reference, assign value to it make a reference
available outside of `$createDom` milestone.

References are available in `$mounted` hook.

Examples:
```javascript
import {App} from 'vasille-js';
import MyComponent from './MyComponent';

class MyComponent extends App {
    constructor () {
        super();
        
        this.div = null;        
        this.sub = null;        
        this.items = new Set();
    }
    
    $createDom () {
        this.$defTag("div", div => {
            this.div = div;
        });
        this.$defElement(new MyComponent, $ => {}, mc => {
            this.sub = mc;
            
            mc.$defTag("p", p => this.items.add(p));
            mc.$defTag("p", p => this.items.add(p));
            mc.$defTag("p", p => this.items.add(p));
        });
    }
}
```

### Slots

Use `$makeSlot` method to define a slot, and `$slot` method to get 
a concrete slot.

Example:
```javascript
import {App, Fragment} from 'vasille-js';
import MyComponent from './MyComponent';

class MyComponent extends App {
    $createDom () {
        <!-- Default slot -->
        this.$defElement(new Fragment, $ => {}, s => s.$makeSlot("default"));
        <!-- Named slot -->
        this.$defElement(new Fragment, $ => {}, s => s.$makeSlot("slotName"));
        
        this.$defElement(new MyComponent, $ => {}, node => {
            <!-- Paste to default slot -->
            node.$defTag("div");
            <!-- Paste to named slot -->
            node.$slot("slotName").$defTag("div");
        });
    }
}
```

## Flow control

Flow can be controlled using methods:
* `$defIf (cond: any, cb: (node: RepeatNodeItem) => void)`.
* `$defIfElse ( ifCond: any,
    ifCb: (node: RepeatNodeItem) => void, 
    elseCb: (node : RepeatNodeItem) => void)`.
* `$defSwitch (...cases : Array<{ cond: IValue<boolean> | boolean, 
  cb: (node: RepeatNodeItem) => void }>)`.
* `$defRepeater<T> ( nodeT : T, props : ($ : T) => void,
  cb : (node : RepeatNodeItem, item: any, key: any) => void)`
  

### `$defIf`

The if has one condition, and one callback which get executed when the condition
is true:
```javascript
this.$defIf(booleanCondition, (node) => {
    // ..
});
```

### `$defIfElse`

If-else has a condition and 2 callbacks, the first will be released when the
condition is true, the second will be released when the condition is false.
```javascript
this.$defIfElse(condition, trueNode => {
    // ..
}, falseNode => {
    // ..
});
```

### `$defSwitch`

A switch accepts pairs of conditions and callback.
```javascript
this.$defSwitch(
    this.$case(condition, fragment => {
        // create DOM here
    }),
    this.$case(condition, fragment => {
        // create DOM here
    }),
    this.$default(fragment => {
        // create DOM here
    })
);
```

### `$defRepeater`

A repeater will repeat a fragment, by a special rule. List of predefined repeaters:
* `RepeatNode` - repeat a fragment x times.
* `ArrayView` - use `ArrayModel` as model.
* `ObjectView` - use `ObjectModel` as model.
* `SetView` - use `SetModel` as model.
* `MapView` - use `MapModel` as model.
 
```javascript
this.$defRepeater(new ArrayView, $ => $.model = new ArrayModel, (node, item, index) => {
    // create some nodes here
});
```

### Debugging comments

Use `$defDebug` tag to define debug comments:
```html
this.$defDebug(stringValueOrBind);
```

## Advanced

There are some advanced options, which can be coded using Vasille.js
language.

### Executors

An executor is a class which releases all changes in DOM, the default
executor is `InstantExecutor`, it applies all changes immediately.

Example how to apply a custom executor:
```javascript
import {App} from 'vasille-js';
import {MyExecutor} from "./MyExecutor";

class MyComponent extends App {
    constructor() {
        super(node, {});
        
        this.$run = new MyExecutor();
    }
}
```

### Pointers

A pointer can be defined using a `$point` method.

```javascript
import {App} from 'vasille-js';

class MyComponent extends App {
    constructor() {
        this.pointer = this.$point(String);
        this.pointer = 'default value';
        
        this.x = this.$ref('x');
        this.y = this.$ref('y');

        // change pointer value
        this.pointer.$ = x;

        // change pointed value;
        this.pointer.$ = y.$;
        // equivalent to
        this.pointer.$ = 'y';

        console.log(this.x.$, this.y.$);
    }
}
```

### Watch for

"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```javascript
this.$defRepeater(new Watch, $ => $.model = variable, node => {
    // defines some node here
});
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
