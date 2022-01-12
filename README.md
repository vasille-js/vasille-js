# Vasille

![Vasille.js logo](https://gitlab.com/vasille-js/vasille-js/-/raw/master/img/logo.png)

`Vasille` core library is frontend solution for `safe`, `fast` & `powerful` applications.

## Table of content
[[_TOC_]]


## Installation

```
npm install vasille --save
```

### Getting ready be example
* JavaScript Example
* TypeScript Example
* Flow.js Example

### Flow.js typedef
Add the next line to `[libs]` section in your `.flowconfig` file
```
node_modules/vasille/flow-typed
```

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

The result of test (less is better) are demonstrated in figures 1-4. There are 2 version: 
the initial one which matches the design and an optimized one which works as fast as possible.

<hr>

![results 1](https://gitlab.com/vasille-js/vasille-js/-/raw/master/img/scores-wo.png)
Figure 1: Initial version (linear scale)

<hr>

![results 1](https://gitlab.com/vasille-js/vasille-js/-/raw/master/img/scores-wo-log.png)
Figure 2: Initial version (logarithmic scale)

<hr>

![results 2](https://gitlab.com/vasille-js/vasille-js/-/raw/master/img/scores-o.png)
Figure 3: Optimized version (linear scale)

<hr>

![results 2](https://gitlab.com/vasille-js/vasille-js/-/raw/master/img/scores-o-log.png)
Figure 4: Optimized version (logarithmic scale)

## How POWERFUL is Vasille



## API documentation

There are some 

Currently, the [API](pages/API.md) is in development, 
but the [JavaScript API](pages/JavaScriptAPI.md)
is available.

* [API Documentation](https://gitlab.com/vasille-js/vasille-js/-/blob/master/pages/API.md)
* [JS API Documentation](https://gitlab.com/vasille-js/vasille-js/-/blob/master/pages/JavaScriptAPI.md)

## Questions

If you have questions, fell free to contact the maintainer of project:

* [Author's Email](mailto:lixcode@vivaldi.net)
* [Project Discord Server](https://discord.gg/SNcXNZxz)
* [Author's Telegram](https://t.me/lixcode)
* [Author's VK](https://vk.com/lixcode)

