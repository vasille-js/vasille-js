# Composition functions

Composition function declares abstract modules of Vasille apps.
Commonly frontend frameworks provides methods to declares components.
But Vasille provides more abstractions.

## Client and server usage abstractions

### Component

A component is a small part of app, for example: a button, an input.
Components have input data (props) and output data which is returned to parent.
To create a component ypu can use `component` or `compose` function.

Example of a minimal component:
```typescript jsx
import {component} from "vasille-web";

const MyComponent = component(() => {
  <div>Hello worls</div>;
});
```

Example of component with props:
```typescript jsx
import {component} from "vasille-web";

interface Props {
  $name: string;
}

const MyComponent = component(({$name}: Props) => {
  <div>{$name}</div>;
});
```

Example of component which return something:
```typescript jsx
const CreateCanvas = component(() => {
  let canvas: HTMLCanvasElement|null = null;
  
  <canvas callback={element => canvas = element}/>
});

const UseCanvas = compoent(() => {
  
  <CreateCanvas callback={canvas => {
    if (!canvsas) {
      return;
    }
    
    const ctx = canvas.getContext("2d");
    
    // draw code ..
  }}/>;
});
```

### View

View is similar to a component, but you can use this abstraction to declare something
larger, like a list of items or a profile page.

### Screen/Page

Screens and pages are created by Vasille router.
A screen or page has the next props:
* `path` contains the full path.
* `params` contains the url params extracted from the path.
* `query` contains parsed search params.
* `hash` contains the URL hash value starting with `#`.

## Client side only helpers

### Store

To create a store constructor use `store` function,
the return object can contain reactive data, static data and dispatch function.

In stores, you can use same reactive states, expressions and watches.

```typescript jsx
const userStore = store(() => {
    let $name = name;
    let $nickname = nickname;
    
    return {
        $name,
        $nickname,
        changeName(name: string) {
            $name = name;
        }
    }
});

const MyComponent = component(() => {
  <div>{userStore.$name}</div>;
});
```

You can load/save the store data to local storage.
The parameter can be omitted and the result can be immediately called.

```typescript
const auth = store(() => {
    const storageKey = "token";
    let $token = localStorage.getItem(storageKey);
    
    watch(() => {
        localStorage.setItem(storageKey, $token);
    });
    
    return {
        $token,
        updateToken(token: string) {
            $token = token;
        }
    }
});
```

### Model

You can ues `model` function to create linked reactive data without defining a component.
It is like an component by without JSX.

Usage example:
```typescript jsx

interface ModelProps {
  name: string;
}

const userModel = model(({name}: ModelProps) => {
  let $name = name;
  
  return {
    $name,
    updateName(name: string) {
      $name = name;
    }
  };
});

const MyComponent = component(() => {
  const model = userModel({name: "Initial name"});
  
  <button onclick={() => model.updateName("New name")}>Click me, {name}!</button>;
  
  onDestroy(() => {
    model.destroy();
  });
})
```

### Modal

You can use `modal` function to declare modals. A modal is similar to a component
which returns void, but the html code will be inserted in the end of body,
position `fixed` or `absolute` can be used to set the position of the modal.

### Prompt

You can use `propmt` function to declare prompts. A prompt is similar to a modal,
but it is not used in JSX code, but directly in event handlers and these type of modals
can be used to return data to caller.

Example of usage:
```typescript jsx
const promptName = prompt(({resolve, reject}: PromptProps<string>) => {
  let name = "";
  
  <input oninput={ev => name = ev.target.value }/>
  <button onclick={() => resolve(name)}>Send</button>
});

const MyComponent = component(() => {
  let $name = "No name";
  
  <button onclick={async () => $name = await promptName({})}>Update name</button>;
})
```

## Server side only

### Service

A service is information provider component, you can use await in it to wait for data.
Reactive states are restricted here and can not be used on server side.

Example of service:
```typescript jsx
interface Props {
  name: string;
}

const MyService = service(async ({name}: Props) => {
  const item = await db.items.findOne({name});
  
  <div>
    <button>{item.type}</button>
  </div>;
});
```
