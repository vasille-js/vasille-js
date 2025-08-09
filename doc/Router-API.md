# 🌐 Vasille.JS Router API
**Powerful client-side routing for modern web applications**

Vasille router accepts several screens, which can be navigated.
Each screen has a URL path, fixed or dynamical.

> ✨ `v3.2+` | 🕹 Simple API | ⚡ Lightweight

## 🚀 Introduction
Vasille.JS Router provides seamless client-side navigation for single-page applications. Key features:
- Dynamic route matching
- Programmatic navigation
- Nested route support
- Lightweight

```typescript jsx
import { routerApp } from "vasille-web";

routerApp({
  routes: {
    "/": { screen: IndexScreen },
  },
});
```

## 🧩 Core Concepts

### Route Patterns
| Pattern     | Matches     | Parameters  |
|-------------|-------------|-------------|
| `/users`    | `/users`    | `{}`        |
| `/user/:id` | `/user/123` | `{id: 123}` |

### Lifecycle Flow

URL Change ➡️ Route Matching ➡️ Screen Composing ➡️ View Update

## 🔧 API Reference

### `routerApp(options)`

Create and mount an routed app. Options:
```typescript
type Options = {
  routes: { [k: string]: { screen: Screen } },
}
```

#### `routes`

Keys of `routes` are paths, the values contain `screen` to display.

## 🧪 Screens

The `screen` function compose a screen which can be used with router.

### `screen(fn: (props: ScreenProps) => Promise<void>)`

The `props: ScreenProps` object contains the next fields:
* `path` contains the full path.
* `params` contains the url params extracted from the path.
* `query` contains parsed search params.
* `hash` contains the URL hash value starting with `#`.

Example of screen without params:
```typescript jsx
import {screen} from "vasille-web";

const Screen = screen<"/">(async (props) => {
    <div>The path is {props.path}</div>;
});
```

Example of screen with params which fetches data from server:

```typescript jsx
import {screen} from "vasille-web";

const Screen = screen<"/user/:nickname">(async ({params}) => {
    const response = await fetch(`/api/user/${params.nikcname}`);
    const data = await response.json();

    <div class="name">{data.name}</div>;
})
```


## 🗺️ Navigation

### 📍 `router()`

Use `router()` function to get the current router instance,
which can be undefined when the component is mounted via `mount` function.

### 🧭 `router()?.navigate(route, params, mode)`

It starts a navigation to path `route`,
`params` are the parameters missing in route,
`mode` is one of navigation modes:
* `loading-screen` shows the loading screen until the next screen is loaded.
* `loading-overlay` shows the loading overlay until the next screen is loaded.
It is shown over the current page content.
* `silent` do the navigation in a silent mode.

Example:
```typescript jsx
const Component = compose(() => {
  function onClick() {
    if (Math.random() < 0.5) {
      router()?.navigate("/", {}, "loading-screen");
    }
    else {
      router()?.navigate("/user/:id", { id: 1 }, "silent");
    }
  }
  
  <button onclick={onClick}>Navigate</button>
})
```

### 📡 `router()?.reload()`

It reloads the current path, similar page refresh.

### 🛰️ `router()?.silentNavigate(route, params)`

It does a silent navigation.
The DOM will not be modified until the next page is loaded.
It returns a promise which can throw navigation errors and is resolved after the next screen mount.

### 😵 Unexisting path reaction

When is required an unexisting path and the fallback screen is not present
* `navigate` will show the error screen if present.
* `silentNavigate` will thrown an error.

Navigation to an unexisting path when a fallback screen is present is considered a successful one.

We recommend using enums to be sure that the paths are always correct. Example:
```typescript jsx
import {screen, routerApp, router} from "vasille-web";

enum Routes {
  Index = "/",
  UserPage = "/user/:id"
}

const IndexScreen = screen<Routes.Index>(async () => {
  function navigate() {
    router()?.navigate(Routes.User, {id: "1234"}, "silent");
  }
    
    <button onclick={navigate}>To user page</button>;
});

const UserScreen = screen<Routes.UserPage>(async () => {
  function navigate() {
    router()?.navigate(Routes.Index, {}, "silent");
  }

  <button onclick={navigate}>To index page</button>;
})

routerApp<Routes>({
  routes: {
    [Routes.Index]: { screen: IndexScreen },
    [Routes.UserPage]: { screen: UserScreen },
  },
});
```

## 💡 Best Practices

### ✋ Limit access to routes

Use `minAccessLevel` to limit access to a route, and `getAccessLevel` to deliver an access level to router.

```typescript jsx
import {routerApp} from "vasille-web";

enum AccessLevel {
  Guest,
  User,
}

routerApp({
  routes: {
    "/": { screen: IndexScreen },
    "/limited": { screen: LimitedScreen, minAccessLevel: Accesslevel.User },
  },
  async getAccessLevel() {
    return AccessLevel.Guest;
  },
});
```

### 🤷‍♂️ Show a 404 not found page

```typescript jsx
import {routerApp} from "vasille-web";

routerApp({
  routes: {},
  fallbackScreen({cause}) {
    <div>{cause === "not-found" ? "Error 404: not found" : "Error: 401"}</div>;
  },
});
```

### ⛔ Show an error page when navigation fails

```typescript jsx
import {routerApp} from "vasille-web";

routerApp({
  routes: {},
  errorScreen({error}) {
    <div>{error}</div>;
  },
});
```

### ⏳ Show a loading screen until first screen mount

```typescript jsx
import {routerApp} from "vasille-web";

routerApp({
  routes: {},
  loadingScreen() {
    <div>App is loading</div>;
  },
});
```

### ⌛ Show a loading overlay for smoother experience

```typescript jsx
import {routerApp} from "vasille-web";

routerApp({
  routes: {},
  loadingOverlay() {
    <div style="position: fixed; inset: 0">Screen is loading</div>;
  },
});
```

## ❓ FAQ

### Q: How to handle route parameters?
A: Access via screen argument:
```typescript jsx
import {screen} from "vasille-web";

const Screen = screen<"/user/:nickname">(async ({params}) => {
    console.log(params.nikcname);
})
```

### Q: Does this support lazy loading?
A: Yes! Components in screen can be lazily loaded:
```typescript jsx
import {screen} from "vasille-web";

const Screen = screen<"/user/:nickname">(async ({params}) => {
    const module = await import("../components/MyComponent");
});
```

<hr/>

📚 Next Steps:
* Explore [Vasille.JS Documentation](https://github.com/vasille-js/vasille-js/blob/v4/doc/V3-API.md)
* Report [Issues](https://github.com/vasille-js/vasille-js/issues)
