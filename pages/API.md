# Vasille.js API description

To define a Vasille.js component, create a file with extension `.vc.html` 
and the next structure:
```html
<script>
	// js code
</script>

<App>..</App> or <Component>..</Component> or <Fragment>..</Fragment>	

<style>
	/* styles go here */
</style>
```

A `App` is a root of a Vasille.js application, it will be bounded to 
an existing DOM node. `Component` defines a typical component, which root
is an HTML node created by Vasille.js. `Fragment` can contain any number of
nodes at top level.

## The script part

Component data, functions, events, slots and watcher are defined in the
`script` tag.

### Component data/state

Reactive component state is composed of javascript references defined in `script`
section using `ref`, `objectRef`, `mapRef`, `arrayRef` & `setRef` functions:
```html
<script>
    import { ref } from 'vcc';
    
    let foo = ref(2);
    let bar = ref('bar');
    
    // non reactive data
    let data = 3;
    // const data
    const pi = 3.14;
</script>
```

`ref` function returns a `Reference` object, value is referenced on variable use,
`objectRef` function returns a `Reference<Object>` value which can be used as 
javascript object, `mapRef` function returns a `Reference<Map>`, `arrayRef` 
function returns a `Reference<Array>`, `setRef` returns a `Reference<Set>` value. 

### Component properties

Component properties (assets) must be typed:
```javascript
import { asset } from 'vcc';

let foo = ref(0);
let bar = ref('default value');

// non reactive property
const nonReactive = asset(ObjectModel);
```

### Computed properties (expressions)

An expression is a state variable which default value is an expression. 
It's value will be automatically recalculated.

Syntax:
```javascript
import { ref, bind } from 'vcc';

let x = ref(2);
let y = ref(3);
let z = bind(x + y);

// multiline computed property
let multilineExpression = bind(() => {
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
    }

    return result;
});

// partial bind expression
let z1 = bind(x => x + y);   // update only on x change
let z2 = bind((y) => x + y); // update only on y change
```

### Methods (functions)

To declare a component method, just declare a function:

```javascript
function sum (a, b) {
    return a + b;
}
```

The methods are available outside of component.

### Components hooks

The Vasille.js components has 4 hooks. The `$created`
hook is called when the component is created and properties are
initialized. The `$mounted` hook is called when all elements defined in
component are mounted. The `$ready` hook is called when all elements
declared is component and installed to its slots are mounted. The
`$destroy` hook is called when component is destroyed.

To define a hook just define a function with its name.

```javascript
function $created () {
    // created hook
}
function $mounted () {
    // mounted hook
}
function $ready () {
    // ready hook
}
function $destroy () {
    // before destroy hook
}
```

### Events

An event can be handled outside of function, it can be declared like
a function with empty body, after call it to emit the defined event, 
the event arguments must be enumerated with names having syntax 
`<varName>_<typeName>`.

Syntax:
```javascript
function myEvent(x_Number, y_Number) {};

// emit a event
myEvent(x, y);
```

### Dependency track

All state variables used in a function are tracked, and function will
be called each time when an argument or state variable get changed:
```javascript
let x = ref(0), y = ref(1);

function sum (a) {
    return x + a;
}

// will be updated on x and y change
let expr = sum(y);
```

### Watchers

A watcher is a lambda based reference.

Example:
```javascript
import { ref, bind, watch } from 'vcc';

let x = ref(0), y = ref(0), visible = ref(true);

watch(() => {
    // depedency tracket based watcher
    if (x < 0 && y < 0) {
        visible = true;
    }
    else {
        visible = false;
    }
});

watch((x, y) => {
    // x & y only watcher
})
```

### Use global variable in Vasille.js components

Use `window` variable to access global variables:

```typescript
window.requestAnimationFrame(() => {
    // smoe code heres
});
```

## Style

A style tag which is present is each file, can be used to declare local
and global style rules. The operator `|` is used to combine a global
selector with a local one.

Examples:
```html
<style>
    /* Local selector example */
    p span {
        width: 100%;
    }

    /* Hybrid selector example */
    p | span {
        height: 100%;
    }
</style>
```

## HTML

HTML part is used to define the HTML nodes and subcomponents.

### Root tags

The root of template must be `App` or `Component` or `Fragment`.

`App` defines a root of an application or a page.
Attributes of `App` & `Fragment` nodes will be applied to
container node. Attributes of `Component` node will be applied to the
root of component.

Examples:
```html
<App>
    <!-- Root of a simple application -->
</App>

<Component>
    <!-- Here must be a child node which is a component or HTMl node -->
</Component>

<Fragment>
    <!-- Here can be any number of children, inclusive no children -->
</Fragment>
```

### HTML node/tag

An HTML tag is defined without any special rules:
```html
<App>
    <div class="text">
        <p>some text here</p>
    </div>
</App>
```

### Subcomponents

Subcomponents must be imported in `script` part, after used is HTML part 
like a tag which name is the component name:
```html
<script>
    import { Component } from './Component.vc';
</script>

<App>
    <Component />
</App>
```

### Attributes and properties

An HTML tag accepts values of its attributes, a Vasille.js component
accepts values of its properties. Values are declared like typical HTML 
attributes, use double-quoted string to use a value as string, and
single-quoted string to use a value as JavaScript expression.

Example:
```html
<App>
    <div
        id="id"
        class="class1 class2"
        data-mydata='sum(a, b)'
    ></div>
    <Component 
        prop1="string value"
        prop2='bind(x + y)'
    />
</App>
```

### Class directives

Class directives are used to define dynamical and conditional classes.
Use directive `class='classNameVariable'` to add a dynamical class and 
`class.className='condition'` to add a conditional class.

```html
<App>
    <div
        class="staticClass"
        class='dynamicalClass'
        class.conditionalClass='condition'
    ></div>
</App>
```

### Style directives

Style can be defined static, dynamical and dynamical with units. Use 
directive `style.property="static style"` to define static style, use
`style.property='variable'` to define dynamical one and 
`style.property.unit='value'` to define dynamical with unit.

Example:
```html
<App>
    <div 
        style.width="3px"
        style.width='3 + "px"'
        style.width.px='3'
    />
</App>
```

### Text expressions in HTML

Use curly bracket to add text of state variables.

Example:
```sveltehtml
<p>{x} + {y} = {x + y}</p>
```

### Listen for events

To listen for default DOM events, use `onmousedown` or other HTML
standard attributes. To listen to component events use `on.eventName`,
events accept as value functions names, expressions and
lambda-functions.

Examples:
```html
<App>
    <div
        onmousedown='functionName'
        onmouseup="functionName"
        onmousemove="(ev) => x = ev.clientX"
    ></div>
    <Component
        on.eventName="functionName"
        on.hover='hovered = true'
    />
</App>
```

### Setting inner HTML

Use `:html` directive to set inner HTML:
```html
<p :html="variable"></p>
```

### Reference to node or subcomponents

To make a reference to a component or element or a set of elements,
at first is necessary to create a local variable using function `tag`, 
or `tags`, at second is necessary to link that variable to 
element/component using `:ref` directive. 

References are available in `$mounted` hook.

Examples:
```html
<script>
    import { tag, tags } from 'vcc';
    import MyComponent from './MyComponent.vc';
    
    let div   = tag(HTMLDivElement); // refer to <div>
    let sub   = tag(MyComponent);    // refer to <MyComponent>
    let items = tags(Element);       // refer to Set([<p>, <p>, <p>])
</script>

<Fragment>
    <div :ref='div' />
    <MyComponent :ref="sub">
        <p :ref="items"/>
        <p :ref="items"/>
        <p :ref="items"/>
    </MyComponent>
</Fragment>
```

### Slots

Use `slot` tag to define a slot, and `slot` directive to put a fragment
to a slot. Also, you can share slot data from children to parent node using
`share` and `shared` directives.

Example:
```html
<App>
    <!-- Default slot -->
    <slot />
    <!-- Named slot -->
    <slot name="slotName" :share="var1, var2">
        <!-- Some default slot content -->
        <div></div>
    </slot>
    
    <Compoent>
        <!-- Paste to default slot -->
        <div />
        <!-- Paste to named slot -->
        <Fragment :slot="slotName" :shared="var1, var2">
            <!-- var1 & var2 are available here -->
        </Fragment>
        <div/>
    </Compoent>
</App>
```

## Flow control

Flow can be controlled using `if`, `if-else`, `if-else-if` and loops.

### `if`

To define an if node, use `if` node or `:if` directive:
```html
<if cond='boolean expression'>..</if>
<!-- Alternative -->
<div :if='boolean expression'>..</div>
```

### `if-else`

To define an if-else flow, use `if` & `else` nodes, or `:if` & `:else`
directives:
```html
<if cond=''>..</if>
<else>..</else>
<!-- Alternative -->
<div :if='expression'>..</div>
<div :else>..</div>
```

### `if-else-if`

To define an if-else-if flow, use a combination between `if` & `else` nodes,
or `:if` & `:else` directives:
```html
<if cond='expression'>..</if>
<else if='expression'>..</else>
<!-- Alternative -->
<div :if='expression'>..</div>
<div :else :if='expression'>..</div>
```

### Loops

Loops can iterate arrays, objects, sets and maps. A loops can be defined
using `for` tag or `:let`, `:of` & `:index` directives:
```html
<for let='identifier' index='index' of='iterable'>..</for>
<!-- Alternative -->
<div :let='identifier' :index='index' :of='iterable'></div>
```

### Debugging comments

Use `debug` tag to define debug comments:
```html
<debug>{expression}</debug>
<!-- Some expressions -->
<debug>{expression 1}, {expression 2}</debug>
```

## Advanced

### Executors

An executor is a class which releases all changes in DOM, the default
executor is `InstantExecutor`, it applies all changes immediately. To 
create an own executor use JavaScript API.

Example how to apply a custom executor:
```html
<App executor='MyExecutor'>
    <!-- App children -->
</App>

<script>
    import {MyExecutor} from "./MyExecutor";
</script>
```

### Pointers

A pointer can be defined using `point` function.

```javascript
import { point, ref } from 'vcc';

let pointer  = point();
let pointer1 = point('default value');
let x = ref('x'), y = ref('y');

// change pointer value
pointer = 0&x;
// equivalent to
pointer = x;

// change pointed value;
pointer = 0*y;
// equivalent to
pointer = 'y'

console.log(x, y);
// will print y y
```

### Watch for

"Watch for" updates the children node on each value change (must cause 
performance issues), DOM is updated automatically, this is a solution
requested in special cases only.

Syntax:
```html
<Watch for="variable">
    <!-- Code to be updated -->
</Watch>
```

## Questions

If you have questions fell free to contact the maintainer of project:

* mail: lixcode@vivaldi.net
* discord: lixcode
* telegram: https://t.me/lixcode
* vk: https://vk.com/lixcode
