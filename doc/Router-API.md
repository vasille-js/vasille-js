# Vasille Router Docs

Vasille router accepts several screens, which can be navigated.
Each screen has a URL path, fixed or dynamical.

## Screens

Use `screen<path>` function to define a screen,
the screen argument is a async function with a param `props`.

The `props` object contains the next fields:
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

## Router App

Use `routerApp` to initialize routes and start routing.
This function has two parameters:
* `init` is an object containing routing data with the next fields:
  * `routes` is an object, keys of it describe the screen path,
  values are objects with fields:
    * `screen` contains a screen compatible with the path.
    * `minAccessLevel` (*optional*) contains a number describing the minimum role
    necessary to access the screen.
  * `getAccessLevel` (*optional*) returns a promise with the current user access level.
  * `fallbackScreen` (*optional*) is a component which is mounted
  when route is not found or not allowed by access level.
  The `cause` property of component describe the cause: `not-found` or `no-access`.
  * `errorScreen` (*optional*) is a component which is mounted
  when an error is thrown in a screen.
  The `error` property will contain the thrown error.
  * `loadingScreen` (*optional*) describes a loading screen, see `navigate` method.
  * `loadingOverlay` (*optional*) describes a loading overlay, see `navigate` method.
* `element` (*optional*) is HTML element used to mount the app.
The document body is used when missing.

There is an example of router app:
```typescript jsx
import {routerApp} from "vasille-web";

routerApp({
  routes: {
    "/": IndexScreen,
    "/about": AboutScreen,
  },
  fallbackScreen({cause}) {
    <div>{cause === "not-found" ? "Error 404: not found" : "Error: 401"}</div>;
  },
});
```

## Navigation

Use `router()` function to get the current router instance,
which can be undefined when the component is mounted via `mount` function.

A router has the next methods:
* `navigate(route, params, mode): void` starts a navigation to path `route`,
`params` are the parameters missing in route,
`mode` is one of navigation modes:
  * `loading-screen` shows the loading screen until the next screen is loaded.
  * `loading-overlay` shows the loading overlay until the next screen is loaded.
  * `silent` do the navigation in a silent mode.
* `reload(): void` reloads the current path, similar page refresh.
* `silentNavigate(route, params): Promise<void>` do a silent navigation.
The DOM will not be modified until the next page is loaded.
The returned promise can throw navigation errors and is resolved after the next screen mount.

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

const IndexScreen = screen(async () => {
  function navigate() {
    router()?.navigate(Routes.User, {id: "1234"}, "silent");
  }
    
    <button onclick={navigate}>To user page</button>;
});

const UserScreen = screen(async () => {
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
