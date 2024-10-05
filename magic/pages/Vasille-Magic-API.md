# Vassile Less Library - High Level Functional Programming Documentation

To create a Vasille Less component, create a file with extension `.ts` and
define a constant of type `VApp`, `VComponent`, `VExtension` or `VFragment`.

Example:

```typescript
import { VApp, v } from 'vasille-magic';

const MyComponent : VApp = () => {
    // ..
}
```

A `VApp` is a root of a Vasille.js application, it will be bounded to
an existing DOM node. `VComponent` defines a typical component, which root
is an HTML node created by Vasille.js. `VFragment` can contain any number of
nodes at top level. `VExtension` are used to extend a component.

## Table of content
[[_TOC_]]

### Component data/state

Component state is composed of private class fields, created by a call
to `ref<T>(initialValue: T): [IValue<T>, (v : T) => void]` method:

```typescript
const MyComponent : VApp = () => {
    // reactive data
    const [foo, setFoo] = ref(2);
    const [bar, setBar] = ref('bar');

    // non reactive data
    const data = 3;
}
```

### Component properties

Component properties are declared in an interface type which
extends `AppOptions` for `VApp`, `FragmentOptions` for `VFragment` or
`TagOptions` for others:

```typescript
interface Options extends AppOptions<"div"> {
    x?: number; // non reactive prop
    y: IValue<number>; // reactive prop
}
const MyComponent : VApp = ({x, y}) => {
    console.log(x, y);
}
```

### Computed properties (expressions)

An expression is a state variable which is created by a call to
`expr<T>(expr: T | () => T): IValue<T>` method:

```typescript
const MyApp : VApp = () => {
    const x = ref(2);
    const y = ref(3);
    const z = expr(x + y);
    const visible = ref(true);

    // multiline computed expression
    const multilineExpression = expr(() => {
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
    });

    // partial bind expression
    const z1 = expr(x + y.$); // bind only to x
    const z2 = expr(x.$ + y); // bind only to y
}
```

### Methods (functions)

To declare a component method, just declare a function
(it's private by default, but you can return it):

```typescript
import { VApp, app } from 'vasille-magic';

const MyApp : VApp = app(() => {
    function sum (a, b) {
        return a + b;
    }
})
```

### Components hooks

The`destroy` hook is called when component is destroyed. No more hooks available.


```javascript
import { VApp, app, v } from 'vasille-magic';

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
interface Input extends AppOptions {
    onEvent ?: (x : number, y : number) => void;
}

const MyComponent : VApp<Input> = ({onEvent}) => {
    // emit a event
    onEvent?.(1, 2);
}
```

### Watchers

A watcher is an anonymous function which will be called each time when a
bound variable get changed. Call
`watch<...Args>(expr: (args: ...Args), ...args: IValue<...Args>)` method
to define a watcher in `createWatchers` milestone.

Example:

```javascript
import { App } from 'vasille-magic';

const MyComponent : VApp = () => {
    const [x] = ref(0);
    const [y] = ref(0);
    const [visible, setVisible] = ref(false);
    
    watch((x, y) => {
        if (x < 0 && y < 0) {
            setVisible(true);
        }
        else {
            setVisible(false);
        }
    });
}
```


## HTML

HTML part is used to define the HTML nodes and subcomponents.

### HTML node/tag

HTML nodes are defined by JSX code.

```javascript
import { App } from 'vasille-magic';

const MyComponent : VApp = () => {
    <div>
        <p>
            some text here
        </p>
    </div>;
}
```

### Subcomponents

Use the Subcomponent name as tag name.

```javascript
import { App } from 'vasille-magic';
import { Component } from './Component';

const MyComponent : VApp = () => {
    <Component />;
}
```

### Attributes and properties

Attributes and properties are set using options parameter.

Example:
```javascript
import { SubComponent } from './SubComponent';

const MyComponent : VApp = () => {
    const [a] = ref(0);
    const [b] = ref(0);
    
    <>
        <div
            id={"id1"}
            data-class="class"
            data-sum={a + b}
        />
        <SubComponent 
            prop1={"string value"}
            prop2={100}
            prop3={a}
        />
    </>;
}
```

### Class directives

Classes are set using options parameter:

```javascript
const MyComponent : VApp = () => {
    const [dynamicalClass] = ref('dynamical-class');
    const [condition] = ref(false);
    
    
    <div 
        class={[
            "static-classs",
            dynamicalClass,
            { conditionalClass: condition }
        ]} 
        class:conditionalClass2={condition}
    />
}
```

### Style directives

Style are set using style attribute:

Example:
```javascript
const MyComponent : VApp = () => {
    const [reactive] = ref(0);
    const [composed] = expr(`${reactive}px`);
    
    <div style={({
        width: '3px',
        margin: [reactive, 'px'],
        padding: composed,
    })} />
}
```

### Listen for events

Listeners to DOM events are set using on* attributes:

```javascript
import {Component} from './Component'; 

const MyComponent : VApp = () => {
    <>
        <div
            onmousedown={() => { /* code here */ }}
            onmousemove={() => { /* code here */ }}
        />
        <Component
            onHover={() => { /* code here */ }}
            onClick={() => { /* code here */ }}
        />
    </>;
}
```

### Setting inner HTML

`set:innerHTML` will set the innerHTML one time,
`bind:innerHTML` will bind a value to it.

```javascript
const MyComponent : VApp = () => {
    const [html] = ref('code');
    
    // assing value at creation
    <p set:innerHTML={'code'}/>;
    // bind value to be updated on value change
    <p bind:innerHTML={html} />;
}
```

### Reference to node

Use variables and `returns:node` attribute;

Examples:
```typescript jsx
import MyComponent from './MyComponent';

const OtherComponent : VApp = () => {
    let div !: HTMLDivElement;
    let p !: HTMLParagraphElement;

    <div returns:node={div}>
        <MyComponent>
            <p returns:node={p} />
        </MyComponent>
    </div>
}
```

### Slots

Slots are functions which trigger the composition of subcomponent.

Example:

```javascript
interface Optoins extends FragmentOptions {
    slot?: () => void;
    slot2?: ({x: number, y: number}) => void;
}

const MyComponent : VFragment<Options> = ({slot, slot2}) => {
    <>
        <!-- Create the content of first slot -->
        <vxSlot model={slot}>
            <!-- Predefined content will be overritten -->
            <div />
        </vxSlot>
        
        <MyComponent>
            <!-- Create the content of second slot in MyComponent default slot -->
            <vxSlot model={slot2} x={1} y={2} />
        </MyComponent>
        
        <MyComponent 
            slot={() => <div /> /* Insert into slot1 */} 
            slot2={({x, y}) => {
                // Insert into slot2
                <div />
                // Prints: 1 2
                console.log(x, y);
            }}
        />
        
        <!-- The easy way -->
        <MyComponent>
            <div />
        </MyComponent>
    </>
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
const MyApp : VApp = () => {
    const [condition] = ref(false);
    
    <v-if model={condition}>
        True here
    </v-if>
}
```

### `if else`

If-else is composed of a 'if' and 'else' calls:
```javascript
const MyApp : VApp = () => {
    const [condition] = ref(false);

    <>
        <v-if model={condition}>
            True here
        </v-if>
        <v-else>
            False here
        </v-else>
    </>
}
```

### `if else if`

A switch accepts pairs of conditions and callback.
```typescript jsx
const MyApp : VApp = () => {
    const [condition] = ref(false);

    <>
        <v-if model={condition}>
            ..
        </v-if>
        <v-elif model={condition}>
            ..
        </v-elif>
        <v-else>
            ..
        </v-else>
    </>
}
```

### `For loop`

`VxFor` repeats a fragment using a special model, created by special functions.
* `arrayModel` function creates array like model.
* `objectModel` function creates object based model.
* `setModel` function creates `Set` based model.
* `mapModel` function creates `Map` based model.

```typescript jsx
const MyApp : VApp = () => {
    const model = arrayModel();

    <VxFor model={model} slot={(value, index) => {
        <li>{value}</li>
    }} />
}
```

### Debugging comments

Use `debug` tag to define debug comments:
```javascript
const MyApp : VApp = () => {
    const condition = ref('false');

    // will create a comment in HTML if debug mode is enabled
    <v-debug model={condition}/>
}
```

## Advanced

There are some advanced options, which can be coded using Vasille Framework.

### Pointers

A pointer can be defined using a `point` method.

```javascript
const MyComponent : VApp = () => {
    const [x] = ref('x');
    const [y] = ref('y');

    const pointer = point(x);

    // prints `x y x`
    console.log(x, y, pointer);
    
    // change pointer value
    pointer.$$ = y;

    // prints `x y y`
    console.log(x, y, pointer);

    // change pointed value;
    pointer.$ = 'z';

    // prints `y z z`
    console.log(x, y, pointer);
}
```

### Watch for

"Watch for" updates the children node on each value change (must cause
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Example:
```javascript
const MyApp : VApp = () => {
    const [model] = this.ref ('false');

    <VxWatch model={model} slot={(modelValue) => {
        console.log(modelValue)
    }} />
}
```

## Portals (new in 2.3.7)

Portals are used to create elements somewhere else. Using portals you can
add popups in the end of the body.

Example:
```javascript
import { VApp, v } from 'vasille-less';

const MyApp: VApp = app(() => {
    <v-portal model={document.body}>
        // define some content here
        // will be inserted a the end of document.body
    </v-portal>
});
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
