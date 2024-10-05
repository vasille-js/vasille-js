# Vasille Core Library

![Vasille.js logo](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/logo.png)

`Vasille` core library is frontend solution for `safe`, `fast` & `powerful` applications.

[![build](https://gitlab.com/vasille-js/vasille-js/badges/v2/pipeline.svg)](https://gitlab.com/vasille-js/vasille-js)
[![npm](https://img.shields.io/npm/v/vasille?style=flat-square)](https://www.npmjs.com/package/vasille)

## Table of content

* [Installation](#installation)
* [How to use Vasille](#how-to-use-vasille)
* [How SAFE is Vasille](#how-safe-is-vasille)
* [How FAST is Vasille](#how-fast-is-vasille)
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
* [`Vasille Core Library` - the hard way - `low-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/pages/GetStarted.md)
* [`Vasille Less Library` - perfect for me - `high-level`](https://gitlab.com/vasille-js/vasille-less/-/blob/v2/pages/GetStarted.md)
* [`Vasille Magic` - perfect for you - `highest-level`](https://gitlab.com/vasille-js/vasille-magic/-/blob/master/pages/GetStarted.md)

### Full documentation:
* [`Vasille Core Library API`- write anything - `low-level`](https://gitlab.com/vasille-js/vasille-js/-/blob/v2/pages/Vasille-Core-Library-API.md)
* [`Vasille Less Library API`- write less do more - `high-level`](https://gitlab.com/vasille-js/vasille-less/-/blob/v2/pages/Vasille-Less-Library-API.md)
* [`Vasille Magic API`- compiler writes for you - `highest-level`](https://gitlab.com/vasille-js/vasille-magic/-/blob/master/pages/Vasille-Magic-API.md)

### Getting ready be example
* [TypeScript Example](https://gitlab.com/vasille-js/learning/vasille-ts-example)
* [JavaScript Example (Vasille Magic not supported)](https://gitlab.com/vasille-js/learning/vasille-js-example)
* [Flow.js Example (Vasille Magic not supported)](https://gitlab.com/vasille-js/learning/vasille-flow-js-example)

<hr>

## How SAFE is Vasille

The safe of your application is ensured by
* `100%` coverage of `vasille` code by unit tests.
  Each function, each branch are working as designed.
* `strong typing` makes your javascript/typescript code safe as C++ code.
All entities of `vasille` core library are strong typed, including:
  * data fields & properties.
  * computed properties (function parameters & result).
  * methods.
  * events (defined handlers & event emit).
  * DOM events & DOM operation (attributing, styling, etc.).
  * slots of component.
  * references to children.
* What you write is what you get - there is no hidden operations, you can control everything.
* No asynchronous code, when the line of code is executed, the DOM and reactive things are already synced.

## How FAST is Vasille

The test project was coded using the next frameworks:
* Angular /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/angular/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/angular/).
* React /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/react/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/react/).
* Vue 2 /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/vue-2/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/vue-2/).
* Vue 3 /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/vue-3/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/vue-3/).
* Svelte /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/svelte/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/svelte/).
* Vasille /
  [Try Initial](https://vasille-js.gitlab.io/project-x32/vasille-js/) /
  [Try Optimized](https://vasille-js.gitlab.io/project-x32-if/vasille-js/).

The result of test are demonstrated in figures 1 & 2.
The test result are measured in FPS (frames per second), which is calculated as `1000 / ft`,
where `ft` is an average frame time in ms of 20 frames. All values are absolute. Higher is better.

The initial version is updating all the page content in each frame.
The page reactivity connections are very complex, and we get poor results in Angular, React, Vue & Svelte.

The optimized version disables the offscreen & non-actual content, which simplifies the
reactivity complexity in time. Angular & Svelte give result similar to Vasille.
React & Vue continue to be slow in the beginning of test.

**Conclusion:** The reactivity system of Vasille is very fast
and its complexity is not slowing down the application.

<hr>

&nbsp;

Figure 1: Initial version

![results 1](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/scores-wo.png)

<hr>

&nbsp;

Figure 2: Optimized version

![results 2](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/scores-o.png)

<hr>

## How POWERFUL is Vasille

The secret of `Vasille` is a good task decomposition. The core library is composed of
an effective reactive module and a DOM generation engine based on it.

<hr>

### Reactivity Module

Reactivity module is used to create a model of data. It can contain self-updating values,
forward-only shared data. Reactivity of objects/fields can be disabled/enabled manually.

![Reactivity Module](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/reactive.png)

* `Destroyable` is an entity which has a custom destructor.
* `IValue<T>` is a common interface for any value container, with next members:
  * `get $` gets the encapsulated value.
  * `set $` manually update the encapsulated value, if enabled triggers updating of all linked data.
  * `disable` disables the reactivity.
  * `enable` enables the reactivity and triggers updating of all linked data.
* `Reference<T>` contains a value of type `T`.
* `Mirror<T>` syncs self value with another `IValue` container, can be used to share a value forward-only.
* `Pointer<T>` same as `Mirror`, but it can switch between `IValue` target anytime.
* `Expression<ReturnType, Args...>` is a self-updating value.
* `Reactive` is a reactive object which can have multiple reactive fields, emit/receive events/signals.

<hr>

### DOM Generation Engine

DOM Generation Engine is used to describe a virtual DOM of reactive fragments, 
which will be reflected into a browser DOM and keep up to date it.

![DOM Generation Engine](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/img/nodes.png)

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
ES2015 version
<script src="https://unpkg.com/vasille"></script>
ES5 Compatible version
<script src="https://unpkg.com/vasille/cdn/es5.js"></script>
```

### Flow.js typedef
Add the next lines to `[libs]` section in your `.flowconfig` file
```
node_modules/vasille/flow-typed
node_modules/vasille-less/flow-typed
node_modules/vasille-magic/flow-typed
```

## Best Practices applicable to Vasille Core Library

* [Reactive Object Practice](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/reactive-object.ts)
* [Application](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application.ts)
* [Application in Application](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/application-in-application.ts)
* [Signaling](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/signaling.ts)
* [Forward Only Data Exchange](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/forward-only.ts)
* [Absolute, Relative & Auto Values](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/auto-value.ts)
* [Signaling Intercepting](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/singaling-intercepting.ts)
* [Debugging](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/debugging.ts)
* [Fragment vs Component](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/fragment-component.ts)
* [Extensions](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/extension.ts)
* [Model-View-Controller](https://gitlab.com/vasille-js/vasille-practices/-/blob/main/practices/model-view-controller.ts)

## Questions

If you have questions, fell free to contact the maintainer of project:

* [Author's Email](mailto:lixcode@vivaldi.net)
* [Project Discord Server](https://discord.gg/SNcXNZxz)
* [Author's Telegram](https://t.me/lixcode)
* [Author's VK](https://vk.com/lixcode)

