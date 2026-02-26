# Steel Frame

![Vasille.js logo](https://raw.githubusercontent.com/vasille-js/vasille-js/refs/heads/v5/doc/img/logo.png)

`SteelFrameKit` is a front-end development kit, which is developed to provide bulletproof frontends.

[![npm](https://img.shields.io/npm/v/vasille?style=flat-square)](https://www.npmjs.com/package/vasille)

## Table of content

- [Steel Frame](#steel-frame)
  - [Table of content](#table-of-content)
  - [Installation](#installation)
  - [How to use SteelFramekit](#how-to-use-steelframekit)
    - [Full documentation:](#full-documentation)
    - [Examples](#examples)
  - [How SAFE is SteelFrameKit](#how-safe-is-steelframekit)
  - [How INTUITIVE is SteelFrameKit](#how-intuitive-is-steelframekit)
  - [How POWERFUL is SteelFrameKit](#how-powerful-is-steelframekit)
  - [Road map](#road-map)
  - [Change log](#change-log)
    - [5.0.0](#500)
    - [4.3.0](#430)
    - [4.2.0](#420)
    - [4.1.0](#410)
    - [4.0.0](#400)
  - [Questions](#questions)


<hr>

## Installation

```
npm install steel-frame --save
```

## How to use SteelFramekit

Create an app from a template

```bash
$ npm create steel-frame
```

### Full documentation:
* [Learn `SteelFrameKit` in 5 minutes](https://github.com/vasille-js/vasille-js/blob/v5/doc/V4-API.md)
* [Router Documentation](https://github.com/vasille-js/vasille-js/blob/v5/doc/Router-API.md)
* [Compostion functions](https://github.com/vasille-js/vasille-js/blob/v5/doc/Compositions.md)
* [Dependency injection](https://github.com/vasille-js/vasille-js/blob/v5/doc/Context.md)

### Examples
* [TypeScript Example](https://github.com/vasille-js/example-typescript)
* [JavaScript Example](https://github.com/vasille-js/example-javascript)

<hr>

## How SAFE is SteelFrameKit

The safe of your application is ensured by
* `100%` coverage of code by unit tests.
  Each function, each branch is working as designed.
* OOP, DRY, KISS and SOLID principles are applied.
* `strong typing` makes your javascript/typescript code safe as C++ code.
All entities of `SteelFrameKit` core library are strongly typed, including:
  * data fields & properties.
  * computed properties (function parameters and result).
  * methods.
  * events (defined handlers & event emit).
  * DOM events & DOM operation (attributing, styling, etc.).
  * slots of components.
  * references to children.
* No asynchronous code, when the line of code is executed, the DOM and reactive things are already synced.

## How INTUITIVE is SteelFrameKit

There is the "Hello World":
```typescript jsx
import { compose, mount } from "steel-frame";

const App = compose(() => {
  <p>Hello world</p>;
});

mount(document.body, App, {});
```

## How POWERFUL is SteelFrameKit

All of these are supported:
* Components.
* Reactive values (observables).
* Inline computed values.
* Multiline computed values.
* HTML & SVG tags.
* Component custom slots.
* 2-way data binding in components.
* Logic block (if, else).
* Loops (array, map, set).
* Dependency injection.

<hr>

## Road map

* [x] Update the `core` library to version 3.0.
* [x] `100%` Test Coverage for core Library v3.
* [x] Develop the `JSX` library.
* [x] `100%` Test Coverage for the JSX library.
* [x] Develop the `Babel Plugin`.
* [x] `100%` Test Coverage fot babel plugin.
* [x] Add CSS support (define styles in components).
* [x] Add router.
* [x] Add SSG (static site generation).
* [ ] Develop tools extension for debugging (WIP).
* [ ] Add SSR (server side rendering).

## Change log

### 5.0.0

Add support for context and dependencies injection.

### 4.3.0

Add new function `safe` which make functions safe, errors are reported automatically.

### 4.2.0

Add support for inlined conditions in JSX, binary `&&` and ternary `?:` operator.

### 4.1.0

Added SSG (static site generation) as build option `sf build static`.

### 4.0.0

Initial version of the framework with file based routing and building scripts (`sf dev` and `sf build spa`).

## Questions

If you have questions, feel free to contact the maintainer of the project:

* [Author's Email](mailto:vas.lixcode@gmail.com)
