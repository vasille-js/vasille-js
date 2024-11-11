# Vasille

![Vasille.js logo](https://gitlab.com/vasille-js/vasille-js/-/raw/v2/doc/img/logo.png)

`Vasille Web` is a front-end framework, which is developed to provide the best `developer experience` ever. **Our goal is to keep is as simple as possible.** Developing web applications using Vasille must be *as fast as possible*.

[![npm](https://img.shields.io/npm/v/vasille?style=flat-square)](https://www.npmjs.com/package/vasille)

## Table of content

* [Installation](#installation)
* [How to use Vasille](#how-to-use-vasille)
* [How SAFE is Vasille](#how-safe-is-vasille)
* [How SIMPLE is Vasille](#how-simple-is-vasille)
* [How POWERFUL is Vasille](#how-powerful-is-vasille)
* [Road Map](#road-map)


<hr>

## Installation

```
npm install vasille-web --save
```

## How to use Vasille

Create an app from a template

```bash
$ npm create vasille
```

Alternative method to create a TypeScript app.
```bash
$ npx degit vasille-js/example-typescript my-project
```

Alternative method to create a JavaScript app.
```bash
$ npx degit vasille-js/example-javascript my-project
```

### Full documentation:
* [Learn `Vasille` in 5 minutes](https://github.com/vasille-js/vasille-js/blob/v3/doc/V3-API.md)

### Examples
* [TypeScript Example](https://github.com/vasille-js/example-typescript)
* [JavaScript Example](https://github.com/vas[README.md](..%2Ftest%2Fmy-app%2FREADME.md)ille-js/example-javascript)

<hr>

## How SAFE is Vasille

The safe of your application is ensured by
* `100%` coverage of code by unit tests.
  Each function, each branch is working as designed.
* OOP, DRY, KISS and SOLID principles are applied.
* `strong typing` makes your javascript/typescript code safe as C++ code.
All entities of `vasille` core library are strongly typed, including:
  * data fields & properties.
  * computed properties (function parameters & result).
  * methods.
  * events (defined handlers & event emit).
  * DOM events & DOM operation (attributing, styling, etc.).
  * slots of components.
  * references to children.
* No asynchronous code, when the line of code is executed, the DOM and reactive things are already synced.

## How SIMPLE is Vasille

There is the "Hello World":
```typescript jsx
import { compose, mount } from "vasille-dx";

const App = compose(() => {
  <p>Hello world</p>;
});

mount(document.body, App, {});
```

## How POWERFUL is Vasille

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

<hr>

## Road map

* [x] Update the `Vasille Core` library to version 3.0.
* [x] `100%` Test Coverage for core Library v3.
* [x] Develop the `Vasille JSX` library.
* [x] `100%` Test Coverage for the JSX library.
* [x] Develop the `Vasille Babel Plugin`.
* [ ] `100%` Test Coverage fot babel plugin.
* [ ] Add CSS support (define styles in components).
* [ ] Add custom `<input/>` components with 2-way value binding.
* [ ] Add router.
* [ ] Develop dev-tools extension for debugging.
* [ ] Develop a lot of libraries for the framework.

## Questions

If you have questions, feel free to contact the maintainer of the project:

* [Author's Email](mailto:vas.lixcode@gmail.com)
* [Author's Telegram](https://t.me/lixcode)

<hr>

**Made in Moldova** 🇲🇩
