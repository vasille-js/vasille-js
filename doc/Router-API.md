# 🌐 Vasille.JS Router API
**Powerful client-side routing for modern web applications**

Vasille router accepts several pages, which can be navigated.
Each page has a URL path, fixed or dynamical.

> ✨ `v4.0+` | 🕹 Simple API | ⚡ Lightweight

## 🚀 Introduction
Vasille.JS Router provides seamless client-side navigation for single-page applications. Key features:
- Dynamic route matching
- Programmatic navigation
- Nested route support
- Build-in into Vasille Web Framework

## 🧩 Core Concepts

The pages must be placed in `src/pages` folder.
If a folder or file name match the pattern `(.*)` the name will be interpreted as a path param.


| File path                     |     URL path     |    Example     |     Params      |
|:------------------------------|:----------------:|:--------------:|:---------------:|
| `src/pages/index.tsx`         |       `/`        |      `/`       |      `{}`       |
| `src/pages/page/(number).tsx` | `/page/(number)` |   `/page/1`    | `{number: "1"}` |
| `src/pages/(id)/summary.tsx`  |  `/(id)/summary`   | `/123/summary` |  `{id: "123"}`  |

## 🧪 Pages

Each page file must export default the result of `page` function.

### `page(fn: (props: ScreenProps) => Promise<void>)`

The `props: ScreenProps` object contains the next fields:
* `path` contains the full path.
* `params` contains the url params extracted from the path.
* `query` contains parsed search params.
* `hash` contains the URL hash value starting with `#`.

Example of page (path is `src/pages/index.jsx`) without params:
```typescript jsx
import { page } from "vasille-web";

export default page<"/">(async (props) => {
    <div>The path is {props.path}</div>;
});
```

Example of page (path `src/pages/user/(nickname).tsx`) with params which fetches data from server:

```typescript jsx
import { page } from "vasille-web";

export default page<"/user/(nickname)">(async ({params}) => {
    const response = await fetch(`/api/user/${params.nickname}`);
    const data = await response.json();

    <div class="name">{data.name}</div>;
})
```


## 🗺️ Navigation

### 📍 `router()`

Use `router()` function to get the current router instance,
which can be undefined when the component is mounted via `mount` function.

### 🧭 `router()?.goTo(path)`

It starts a navigation to path `path`. Loading screen will be shown if present.
If you want a smoother experience use `router()?.ajax(path)`,
which will keep the current page content until the next page mount showing the loading overlay.

Example:
```typescript jsx
const Component = compose(() => {
  function onClick() {
    if (Math.random() < 0.5) {
      router()?.goTo("/");
    }
    else {
      router()?.ajax("/user/1");
    }
  }
  
  <button onclick={onClick}>Navigate</button>
})
```

### 🛰️ `router()?.load(path)`

It does a silent navigation.
The DOM will not be modified until the next page is loaded.
It returns a promise which can throw navigation errors and is resolved after the next page mount.

### 📡 `router()?.reload()`

It reloads the current path, similar page refresh.

### 😵 Unexisting path reaction

When is required an unexisting path and the fallback screen is not present
* `goTo` will show the error screen if present.
* `load` will thrown an error.

Navigation to an unexisting path when a fallback screen is present is considered a successful one.

## 💡 Best Practices

### ✋ Limit access to routes

Add a file with path `src/router/checkAccess.ts`, which exports a function which check the user access to a path:

```typescript jsx
export default async function (path: string) {
  // check the path here
  return true;
}
```

### 🤷‍♂️ Show a 404 not found page

Add a file with path `src/router/fallbackScreen.tsx`, which exports a component to render when the page is not found:

```typescript jsx
import { component, FallbackScreenProps } from "vasille-web";

export default component((props: FallbackScreenProps) => {
  <div>Not found</div>
});
```

### ⛔ Show an error page when navigation fails

Add a file with path `src/router/errorScreen.tsx`, which exports a component to render when navigation fails:

```typescript jsx
import { component, ErrorScreenProps } from "vasille-web";

export default component((props: ErrorScreenProps) => {
  <div>Error: {props.error}</div>
});
```

### ⏳ Show a loading screen until first screen mount

Add a file with path `src/router/loadingScreen.tsx`, which exports a component to render when until first page mount:

```typescript jsx
import { component } from "vasille-web";

export default component(() => {
  <div>Loading...</div>
});
```

### ⌛ Show a loading overlay for smoother experience

Add a file with path `src/router/loadingOverlay.tsx`, which exports a component to render when the page is switched via `router()?.ajax(path)`:

```typescript jsx
import { component } from "vasille-web";

export default component(() => {
  <div style={{position: "fixed"}}>Loading...</div>
});
```

## ❓ FAQ

### Q: How to handle route parameters?
A: Access via page argument:
```typescript jsx
import {screen} from "vasille-web";

export default page<"/user/(nickname)">(async ({params}) => {
    console.log(params.nikcname);
})
```

### Q: Does this support lazy loading?
A: Yes! All pages are lazy loaded by default.

<hr/>

📚 Next Steps:
* Explore [Vasille.JS Documentation](https://github.com/vasille-js/vasille-js/blob/v4/doc/V4-API.md)
* Report [Issues](https://github.com/vasille-js/vasille-js/issues)
