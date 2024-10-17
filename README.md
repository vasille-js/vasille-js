# Vasille

![Vasille.js logo](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/doc/img/logo.png)

`Vasille` core library is frontend solution for `safe`, `performant` & `powerful` applications.

[![npm](https://img.shields.io/npm/v/vasille?style=flat-square)](https://www.npmjs.com/package/vasille)

## Table of content

* [Installation](#installation)
* [How to use Vasille](#how-to-use-vasille)
* [How SAFE is Vasille](#how-safe-is-vasille)
* [How SIMPLE is Vasille](#how-fast-is-vasille)
* [How POWERFUL is Vasille](#how-powerful-is-vasille)
* [Best Practices](#best-practices)


<hr>

## Installation

```
npm install vasille --save
npm install vasille-less --save
npm install vasille-magic --save
```

## How to use Vasille

There are several modes to use Vasille.

### Documentation for beginners (how to create the first project step by step):
* [`Vasille Magic` - perfect for you - `highest-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/magic/GetStarted.md)
* [`Vasille Less Library` - no transcriber usage - `high-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/less/GetStarted.md)
* [`Vasille Core Library` - the hard way - `low-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/core/GetStarted.md)

### Full documentation:
* [`Vasille Magic API`- compiler writes for you - `highest-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/magic/Vasille-Magic-API.md)
* [`Vasille Less Library API`- write less do more - `high-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/less/Vasille-Less-Library-API.md)
* [`Vasille Core Library API`- write anything - `low-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/doc/core/Vasille-Core-Library-API.md)

### Getting ready be example
* [TypeScript Example](https://gitlab.com/vasille-js/learning/vasille-ts-example)
* [JavaScript Example (Vasille Magic not supported)](https://gitlab.com/vasille-js/learning/vasille-js-example)

<hr>

## How SAFE is Vasille

The safe of your application is ensured by
* `100%` coverage of `vasille` code by unit tests.
  Each function, each branch is working as designed.
* `strong typing` makes your javascript/typescript code safe as C++ code.
All entities of `vasille` core library are strongly typed, including:
  * data fields & properties.
  * computed properties (function parameters & result).
  * methods.
  * events (defined handlers & event emit).
  * DOM events & DOM operation (attributing, styling, etc.).
  * slots of component.
  * references to children.
* What you write is what you get. There are no hidden operations, you can control everything.
* No asynchronous code, when the line of code is executed, the DOM and reactive things are already synced.

## How SIMPLE is Vasille

Can you detect the correct order of console logs in the next code snippet:
```javascript
import logo from './logo.svg';
import './App.css';
import {useEffect} from 'react';

function C1 ({children}) {
  console.log(1);

  useEffect(() => {
    console.log(2);
  });

  return <div>{children}</div>;
}

function C2 () {
  console.log(3);

  useEffect(() => {
    console.log(4);
  });

  return <div></div>;
}

function App() {
  return <C1>
    <C2/>
  </C1>;
}

export default App;
```

So let's see the same example using Vasille:
```typescript jsx
interface Options extends FragmentOptions {
    slot?: () => void;
}

const C1 : VFragment<Options> = ({slot}) => {
  console.log(1);
  
  <div>
    <vxSlot model={slot} />
  </div>;
  
  console.log(2);
}

const C2: VFragment = () => {
  console.log(3);
  
  <div></div>;
    
  console.log(4);
}

const App: VApp = () => {
  <C1>
    <C2/>
  </C1>
}
```

The `C2` function is sent to `C1` as function,
so it will be called after `console.log(1)` and before `console.log(2)`.
No return is present in this case,
then construction like `for` & `if` can be used in place of `[].map()` and ternary operator.
The component function is called once, no recalls on component update.

## How POWERFUL is Vasille

The secret of `Vasille` is a good task decomposition. The core library is composed of
an effective reactive module and a DOM generation engine based on it.

<hr>

### Reactivity Module

Reactivity module is used to create a model of data. It can contain self-updating values,
forward-only shared data. Reactivity of objects/fields can be disabled/enabled manually.

![Reactivity Module](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/doc/img/reactive.png)

* `Destroyable` is an entity which has a custom destructor.
* `IValue<T>` is a common interface for any value container, with next members:
  * `get $` gets the encapsulated value.
  * `set $` manually update the encapsulated value, if enabled triggers updating of all linked data.
* `Reference<T>` contains a value of type `T`.
* `Mirror<T>` syncs self value with another `IValue` container, can be used to share a value forward-only.
* `Pointer<T>` same as `Mirror`, but it can switch between `IValue` target anytime.
* `Expression<ReturnType, Args...>` is a self-updating value.
* `Reactive` is a reactive object which can have multiple reactive fields, emit/receive events/signals.

<hr>

### DOM Generation Engine

DOM Generation Engine is used to describe a virtual DOM of reactive fragments, 
which will be reflected into a browser DOM and keep up to date it.

![DOM Generation Engine](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/doc/img/nodes.png)

* `Fragment` describes a virtual DOM node, which has siblings, children, parent & slots.
* `TextNode` reflects a `Text` node.
* `INode` reflects a `Element` node.
* `Tag` reflect a self created `Element` node.
* `Extension` reflects an existing `Element` node.
* `Component` reflects a `Element` node created by a `Tag` child.
* `AppNode` is root of a `Vasille` application, can be used to create applications in application.
* `App` is root of a definitive `Vasille` application.
* `DebugNode` reflects a `Comment` node, useful for debug.
* `Watch` recompose children nodes on model value change.
* `RepeatNode` creates multiples children nodes using the same code multiple time.
* `BaseView` represent a view in context of MVC (Model-View-Controller).
* `ObjectView` repeats slot content for each value of `ObjectModel`.
* `MapView` repeats slot content for each `MapModel` value.
* `SetView` repeats slot content for each `SetModel` value.
* `ArrayView` repeats slot content for each `ArrayModel` value respecting its order.

<hr>

### CDN

```html
<script src="https://unpkg.com/vasille"></script>
```

## Best Practices applicable to Vasille Core Library

* [Reactive Object Practice](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/reactive-object.ts)
* [Application](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application.ts)
* [Application in Application (Micro frontends)](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application-in-application.ts)
* [Signaling](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/signaling.ts)
* [Forward Only Data Exchange](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/forward-only.ts)
* [Absolute, Relative & Auto Values](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/auto-value.ts)
* [Signaling Intercepting](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/singaling-intercepting.ts)
* [Debugging](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/debugging.ts)
* [Fragment vs Component](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/fragment-component.ts)
* [Extensions](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/extension.ts)
* [Model-View-Controller](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/model-view-controller.ts)

## Questions

If you have questions, feel free to contact the maintainer of the project:

* [Author's Email](mailto:vas.lixcode@gmail.com)
* [Author's Telegram](https://t.me/lixcode)

