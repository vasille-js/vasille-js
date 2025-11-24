# How bullet-proof web frontend frameworks are

The test is simple, it has a component called `Counter` which counts how many times it was clicked. And displays an external title and counter value in format `X has Y clicks`.

The `Counter` component is used 3 times, the 1st is named `Before`, the second will get an error instead of title and the last is named `After`.

All frameworks are scored in the next way:
- 1 point for each button present on screen.
- 1 point for each button if the counter value is displayed.
- 1 point for each button if the counter value is updated after click.
- 1 point bonus for excellence if all buttons are working.

| Name    | Version | Button | Counter | Updatable | Bonus | Total | Bandle size |
|---------|---------|--------|---------|-----------|-------|-------|-------------|
| Alpine  | 3.15.2  | 3      | 3       | 3         | 1     | 10    | 44.9 kB     |
| Angular | 20.3.9  | 3      | 0       | 0         | 0     | 3     | 131.2 kB    |
| Aurelia | 2.0.0b  | 2      | 2       | 2         | 0     | 6     | 252.9 kB    |
| Ember   | 6.8.0   | 2      | 1       | 0         | 0     | 3     | 1013.8 kB   |
| Lit     | 3.3.1   | 0      | 0       | 0         | 0     | 0     | 17.2 kB     |
| Marko   | 6.0.114 | 0      | 0       | 0         | 0     | 0     | 2.4kB       |
| Mithril | 2.3.7   | 0      | 0       | 0         | 0     | 0     | 20.6 kB     |
| Preact  | 10.26.9 | 0      | 0       | 0         | 0     | 0     | 13.7 kB     |
| Stencil | 4.22.2  | 0      | 0       | 0         | 0     | 0     | 21.9 kB     |
| Qwik    | 1.17.1  | 0      | 0       | 0         | 0     | 0     | 52.9 kB     |
| React   | 19.2.0  | 0      | 0       | 0         | 0     | 0     | 190.2 kB    |
| Ripple  | 0.2.176 | 0      | 0       | 0         | 0     | 0     | 14.4kB      |
| Solid   | 1.9.10  | 0      | 0       | 0         | 0     | 0     | 8.3 kB      |
| Svelte  | 5.43.2  | 0      | 0       | 0         | 0     | 0     | 25.7 kB     |
| Vasille | 4.3.1   | 3      | 3       | 3         | 1     | 10    | 8.4 kB      |
| Vue     | 3.5.22  | 2      | 2       | 2         | 0     | 6     | 59.0 kB     |


## Alpine

[Demo](https://vasille-js.gitlab.io/bullet-proof/alpine/)

### Code

```html
<html>
<head>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
</head>
<body>
    <button x-data="{ count: 0 }" x-on:click="count++">
        Before clicked
        <span x-text="count"></span>
        times
    </button>
    <button x-data="{ count: 0 }" x-on:click="count++">
        <span x-text="throwNow()"></span>
        clicked
        <span x-text="count"></span>
        times
    </button>
    <button x-data="{ count: 0 }" x-on:click="count++">
        After clicked
        <span x-text="count"></span>
        times
    </button>
</body>
<script>
    function throwNow() {
        throw new Error("now");
    }
</script>
</html>
```

## Angular

[Demo](https://vasille-js.gitlab.io/bullet-proof/angular/)

### Code

`main.ts`
```typescript
import { Component } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';

@Component({
    selector: 'counter',
    imports: [],
    template: `
    <button (click)="increment()">
      <ng-content></ng-content> has {{counter}} clicks
    </button>`
})
export class Counter {
    public counter: number = 0;

    public increment() {
        this.counter++;
        return this.counter;
    }
}


@Component({
    selector: 'app-root',
    imports: [Counter],
    template: `
  <counter>First</counter>
  <counter>{{throwNow()}}</counter>
  <counter>Second</counter>`
})
export class App {
    public throwNow(): string {
        throw new Error("now");
    }
}


bootstrapApplication(App)
    .catch((err) => console.error(err));
```

## Aurelia

[Demo](https://vasille-js.gitlab.io/bullet-proof/aurelia/)

### Code

`counter.html`
```html
<template>
    <button class="btn btn-increment" click.trigger="increment()">
        <au-slot></au-slot> has ${count} clicks
    </button>
</template>
```

`counter.ts`
```typescript
export class Counter {
  count: number = 0;

  increment() {
    this.count++;
  }
}
```

`my-app.html`
```html
<import from="./counter"></import>

<counter>Before</counter>
<counter>${throwNow()}</counter>
<counter>After</counter>
```

`my-app.ts`
```typescript
export class MyApp {
  public throwNow() {
    throw new Error("now");
  }
}
```

## Ember

[Demo](https://vasille-js.gitlab.io/bullet-proof/ember/)

`counter.gjs`
```jsx
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';

export default class Counter extends Component {
  @tracked count = 0;

  increment = () => {
    this.count++;
  };

  <template>
    <button type="button" {{on "click" this.increment}}>
        {{yield}} has {{this.count}} clicks
    </button>
  </template>
}
```
`application.gjs`
```jsx
import Component from '@glimmer/component';
import Counter from "./counter";

export default class App extends Component {
  throwNow = () => {
    throw new Error("now")
  }

  <template>
    <Counter>Before</Counter>
    <Counter>{{this.throwNow}}</Counter>
    <Counter>After</Counter>
  </template>
}
```

## Lit

### [Demo](https://vasille-js.gitlab.io/bullet-proof/lit/)

### Code

`my-element.ts`
```typescript
import { LitElement, html } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-counter')
export class Counter extends LitElement {
  /**
   * The number of times the button has been clicked.
   */
  @property({ type: Number })
  count = 0

  render() {
    return html`
      <button @click=${this._onClick} part="button">
        <slot></slot> has ${this.count} clicks
      </button>
    `
  }

  private _onClick() {
    this.count++
  }
}

function throwNow(): string {
  throw new Error("now");
}

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('my-element')
export class MyElement extends LitElement {
  render() {
    return html`
      <my-counter>Before</my-counter>
      <my-counter>${throwNow()}</my-counter>
      <my-counter>After</my-counter>
    `
  }
}
```

## Marko

Demo need server side script.

### Code

`+page.marko`
```html
<const/throwNow=() => "s".unexisting()>
<div class="container">
  <counter>Before</counter>
  <counter>${throwNow()}</counter>
  <counter>After</counter>
</div>
```

`counter.marko`
```html
<let/count=0>
<button onClick() { count++ }>
  <${input.content}/> clicked ${count} times
</button>
```

## Mithril

[Demo](https://vasille-js.gitlab.io/bullet-proof/mithril/)

### Code

```html
<body>
	<script src="https://unpkg.com/mithril/mithril.js"></script>
	<script>
	var root = document.body

    function Counter(initialVnode) {
        var count = 0

        function increment() {
            count += 1
        }

        return {
            view: function(vnode) {
                return m("button", {
                    onclick: increment
                }, [
                    vnode.children, 
                    ` has ${count} clicks`
                ]);
            }
        }
    }

    function throwNow() {
        throw new Error("now");
    }

	m.mount(root, {
        view: function() {
            return m("main", [
                m(Counter, "First"),
                m(Counter, throwNow()),
                m(Counter, "After"),
            ])
        }
    })
	</script>
</body>
```

## Preact

[Demo](https://vasille-js.gitlab.io/bullet-proof/preact/)

### Code

```typescript jsx
import { render } from 'preact';
import { useState } from 'preact/hooks';

function Counter({ children }: { children: any }) {
	const [count, setCount] = useState(0);

	return <button onClick={() => setCount(count + 1)}>
		{children} has {count} clicks
	</button>;
}

function throwNow() {
	throw new Error("now");
}

export function App() {
	return (
		<>
			<Counter>Before</Counter>
			<Counter>{throwNow()}</Counter>
			<Counter>After</Counter>
		</>
	);
}


render(<App />, document.getElementById('app'));
```

## Qwik

[Demo](https://vasille-js.gitlab.io/bullet-proof/qwik/)

### Code

`app.tsx`
```typescript jsx
import { component$, useSignal, Slot } from '@builder.io/qwik'

export const Counter = component$(() => {
  const count = useSignal(0)

  return (
    <button onClick$={() => count.value++}>
      <Slot /> has {count.value} clicks
    </button>
  );
});

function throwNow(): string {
  throw new Error("now");
}

export const App = component$(() => {
  return (
    <>
      <Counter>Before</Counter>
      <Counter>{throwNow()}</Counter>
      <Counter>After</Counter>
    </>
  )
})
```

## React

[Demo](https://vasille-js.gitlab.io/bullet-proof/react/)

### Code

`App.tsx`
```typescript jsx
import { useState } from 'react'

function Counter ({children}: {children: string}) {
  const [count, setCount] = useState(0);

  return <button onClick={() => setCount(count + 1)}>
    {children} has {count} clicks
  </button>;
}

function throwNow(): string {
  throw new Error("now");
}

function App() {
  
  return <>
    <Counter>Before</Counter>
    <Counter>{throwNow()}</Counter>
    <Counter>After</Counter>
  </>
}

export default App
```

## Ripple

[Demo](https://vasille-js.gitlab.io/bullet-proof/ripple/)

### Code

```
import { track } from "ripple";

export component Counter({ children }) {
  let count = track(0);

  function incrementCount() {
    @count++;
  }

  <button onClick={incrementCount}><children /> {`clicked ${@count} times`}</button>
}

export component App() {
  function throwNow() {
    throw new Error("now");
  }

  <div class="app">
    <Counter>{"Before "}</Counter>
    <Counter>{throwNow()}</Counter>
    <Counter>{"After "}</Counter>
  </div>
}
```

## Stencil

[Demo](https://vasille-js.gitlab.io/bullet-proof/stencil/)

### Code

`app-root.tsx`
```typescript jsx
import { Component, h } from '@stencil/core';

@Component({
  tag: 'app-root',
  shadow: true,
})
export class AppRoot {
  render() {
    function throwNow(): string {
      throw new Error("now");
    }

    return (
      <div>
        <my-counter>Before</my-counter>
        <my-counter>{throwNow()}</my-counter>
        <my-counter>After</my-counter>
      </div>
    );
  }
}
```

`counter.tsx`
```typescript jsx
import { Component, State, h } from '@stencil/core';

@Component({
  tag: 'my-counter',
  shadow: true,
})
export class MyCounter {
  @State() count: number = 0;

  private increment = () => {
    this.count++;
  }

  render() {
    return (
      <button class="btn btn-increment" onClick={this.increment}>
        <slot /> has {this.count} clicks
      </button>
    );
  }
}
```

## Solid

[Demo](https://vasille-js.gitlab.io/bullet-proof/solid/)

### Code

`App.tsx`
```typescript jsx
import { createSignal, type ParentComponent } from 'solid-js'

function throwNow(): string {
  throw new Error("now");
}

const Counter: ParentComponent =  (props) => {
  const [count, setCount] = createSignal(0)
  
  return <button onClick={() => setCount(count() + 1)}>
    {props.children} has {count()} clicks
  </button>
}

function App() {
  return <>
    <Counter>Before</Counter>
    <Counter>{throwNow()}</Counter>
    <Counter>After</Counter>
  </>
}

export default App
```

## Svelte

[Demo](https://vasille-js.gitlab.io/bullet-proof/svelte/)

### Code

`lib/Counter.svelte`
```html
<script lang="ts">
  let { children }: { children: Snippet | undefined } = $props();
  let count: number = $state(0)
  const increment = () => {
    count += 1
  }
</script>

<button onclick={increment}>
  {@render children?.()} has {count} clicks
</button>
```

`App.svelte`
```html
<script lang="ts">
  import Counter from './lib/Counter.svelte'

  function throwNow(): string {
    throw new Error("now");
  }
</script>

<main>
    <Counter>Before</Counter>
    <Counter>{throwNow()}</Counter>
    <Counter>After</Counter>
</main>
```

## Vasille

[Demo](https://vasille-js.gitlab.io/bullet-proof/vasille/)

### Code

`components/Counter.tsx`
```typescript jsx
import { component, Slot } from "vasille-web";

interface Props {
  slot?(): void;
}

export const Counter = component(({slot}: Props) => {
  let $count = 0;

  <button onclick={() => $count++}>
    <Slot model={slot}/> has {$count} clicks
  </button>
})
```

`pages/index.tsx`
```typescript jsx
import { page } from "vasille-web";
import { Counter } from "../components/Counter.jsx";

function throwNow(): string {
  throw new Error("now");
}

export default page(async () => {
  <Counter>Before</Counter>;
  <Counter>{throwNow()}</Counter>;
  <Counter>After</Counter>;
});
```

## Vue

[Demo](https://vasille-js.gitlab.io/bullet-proof/vue/)

### Code

`components/Counte.vue`
```vue
<script setup lang="ts">
import { ref } from 'vue'

const count = ref(0)
</script>

<template>
  <button v-on:click="count++">
    <slot></slot> has {{ count }} clicks
  </button>
</template>
```

`App.vue`
```vue
<script setup lang="ts">
import Counter from './components/Counter.vue'

function throwNow(): string {
  throw new Error("now");
}
</script>

<template>
  <Counter>Before</Counter>
  <Counter>{{ throwNow() }}</Counter>
  <Counter>After</Counter>
</template>
```
