# How bullet-proof web frontend frameworks are

The test is simple, it has a component called `Counter` which counts how many times it was clicked. And displays an external title and counter value in format `X has Y clicks`.

The `Counter` component is used 3 times, the 1st is named `Before`, the second will get an error instead of title and the last is named `After`.

All frameworks are scored in the next way:
- 1 point for each button present on screen.
- 1 point for each button if the counter value is displayed.
- 1 point for each button if the counter value is updated after click.
- 1 point bonus for excellence if all buttons are working.

| Name    | Version | Button | Counter | Updatable | Bonus | Total | Build size |
|---------|---------|--------|---------|-----------|-------|-------|------------|
| Angular | 20.3.9  | 3      | 0       | 0         | 0     | 3     | 134.40 kB  |
| Lit     | 3.3.1   | 0      | 0       | 0         | 0     | 0     | 17.63 kB   |
| Qwik    | 1.17.1  | 0      | 0       | 0         | 0     | 0     | 54.20 kB   |
| React   | 19.2.0  | 0      | 0       | 0         | 0     | 0     | 195.19 kB  |
| Solid   | 1.9.10  | 0      | 0       | 0         | 0     | 0     | 8.50 kB    |
| Svelte  | 5.43.2  | 0      | 0       | 0         | 0     | 0     | 26.28 kB   |
| Vasille | 4.3.1   | 3      | 3       | 3         | 1     | 10    | 13.26 kB   |
| Vue     | 3.5.22  | 2      | 2       | 2         | 0     | 6     | 60.39 kB   |


## Angular

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/angular/)

### Console Output

```
ERROR Error: now
    at _App.throwNow (main.ts:32:11)
    at App_Template (main.ts:27:12)
    at executeTemplate (debug_node.mjs:9040:9)
    at refreshView (debug_node.mjs:10076:13)
    at detectChangesInView (debug_node.mjs:10296:9)
    at detectChangesInViewIfAttached (debug_node.mjs:10256:5)
    at detectChangesInComponent (debug_node.mjs:10244:5)
    at detectChangesInChildComponents (debug_node.mjs:10322:9)
    at refreshView (debug_node.mjs:10131:13)
    at detectChangesInView (debug_node.mjs:10296:9)
```

## Lit

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/lit/)

### Output

```
Uncaught (in promise) Error: now
    at throwNow (my-element.ts:32:9)
    at MyElement.render (my-element.ts:46:21)
    at MyElement.update (lit-element.ts:166:24)
    at MyElement.performUpdate (reactive-element.ts:1504:14)
    at MyElement.scheduleUpdate (reactive-element.ts:1400:25)
    at MyElement.__enqueueUpdate (reactive-element.ts:1372:25)
```

## Qwik

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/qwik/)

### Output

```
QWIK ERROR now Error: now
    at throwNow (http://localhost:5173/src/app.tsx:10:11)
    at qrl.App_component_AkbU84a8zes [as resolved] (http://localhost:5173/src/app.tsx_App_component_AkbU84a8zes.js:16:27)
    at qrl.invokeApply (http://localhost:5173/node_modules/@builder.io/qwik/dist/core.prod.mjs?v=db9122e0:2706:46)
    at qrl.invoke (http://localhost:5173/node_modules/@builder.io/qwik/dist/core.prod.mjs?v=db9122e0:2699:24)
    at http://localhost:5173/node_modules/@builder.io/qwik/dist/core.prod.mjs?v=db9122e0:5515:27
    at async Promise.all (index 0)
    at async renderRoot (http://localhost:5173/node_modules/@builder.io/qwik/dist/core.prod.mjs?v=db9122e0:5651:9)
    at async render (http://localhost:5173/node_modules/@builder.io/qwik/dist/core.prod.mjs?v=db9122e0:5638:5)
```

## React

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/react/)

### Output

```
Uncaught Error: now
    at throwNow (App.tsx:12:9)
    at App (App.tsx:19:15)
    at Object.react_stack_bottom_frame (react-dom-client.development.js:25904:20)
    at renderWithHooks (react-dom-client.development.js:7662:22)
    at updateFunctionComponent (react-dom-client.development.js:10166:19)
    at beginWork (react-dom-client.development.js:11778:18)
    at runWithFiberInDEV (react-dom-client.development.js:871:30)
    at performUnitOfWork (react-dom-client.development.js:17641:22)
    at workLoopSync (react-dom-client.development.js:17469:41)
    at renderRootSync (react-dom-client.development.js:17450:11)
```

## Solid

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/solid/)

### Output

```
Uncaught Error: now
    at throwNow (App.tsx:4:9)
    at get children (App.tsx:18:15)
    at App.tsx:11:12
    at Object.fn (dev.js:334:58)
    at runComputation (dev.js:742:22)
    at updateComputation (dev.js:724:3)
    at createRenderEffect (dev.js:240:75)
    at insert (dev.js:334:3)
    at App.tsx:10:54
    at _$$component.location (App.tsx:11:32)
```

## Svelte

### Code

`lib/Counter.svelte`
```svelte
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
```svelte
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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/svelte/)

### Output

```
Uncaught Error: now

	in <unknown>
	in Counter.svelte
	in App.svelte

    at throwNow (App.svelte:4:31)
    at update_reaction (runtime.js:297:16)
    at execute_derived (deriveds.js:332:12)
    at update_derived (deriveds.js:356:14)
    at get (runtime.js:685:4)
    at Array.map (<anonymous>)
    at effects.js:372:51
    at update_reaction (runtime.js:297:16)
    at update_effect (runtime.js:477:18)
    at create_effect (effects.js:126:4)
```

## Vasille

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/vasille/)

### Output

```
Error: now
    at throwNow (index.tsx:5:9)
    at index.tsx:10:13
    at Slot (components.js:5:13)
    at Object.slot (Counter.tsx:11:5)
    at Tag2.compose (runner.js:57:22)
    at Fragment.tag (node.js:68:13)
    at Counter.tsx:10:3
    at compose.js:14:28
    at index.tsx:10:3
    at Module.<anonymous> (screen.js:9:15)
```

## Vue

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

### [Demo](https://vasille-js.gitlab.io/bullet-proof/vue/)

### Output

```
Uncaught Error: now
    at Proxy.throwNow (App.vue:5:9)
    at App.vue:11:15
    at renderFnWithContext (runtime-core.esm-bundler.js:695:13)
    at renderSlot (runtime-core.esm-bundler.js:3045:53)
    at Proxy._sfc_render (Counter.vue:9:5)
    at renderComponentRoot (runtime-core.esm-bundler.js:6590:16)
    at ReactiveEffect.componentUpdateFn [as fn] (runtime-core.esm-bundler.js:5390:46)
    at ReactiveEffect.run (reactivity.esm-bundler.js:237:19)
    at setupRenderEffect (runtime-core.esm-bundler.js:5525:5)
    at mountComponent (runtime-core.esm-bundler.js:5299:7)
```
