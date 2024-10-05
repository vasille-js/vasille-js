# Get Started with Vasille Less Library

This instruction is dedicated for beginners, it describes how to create a Vasille based project step by step.

## Minimal Example

### Step 1: Create a NPM project

* Create a directory `test-project`;
* Open a terminal in it;
* Init NPM by `npm init`.

All terminal commands:
```shell
mkdir test-project;
cd test-project;
npm init;
```

### Step 2: Install dependencies

* Install `vasille-less` as dependency;
* Install `webpack`, `webpack-cli`, `webpack-dev-server`, `typescript` & `ts-loader` 
* as development dependencies;

All terminal commands:
```shell
npm install --save vasille-less;
npm install --save-dev webpack webpack-cli webpack-dev-server;
```

### Step 3: Configure WebPack

Create `webpack.config.js` file with the next content:
```javascript
const path = require ("path");

module.exports = {
    mode : "development",
    entry : "./src/main.ts",
    output : {
        filename : "app.js",
        path : path.resolve (__dirname, "dist")
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'ts-loader',
                    }
                ]
            }
        ],
    },
    resolve: {
        extensions: ['.tsx', '.ts', '.js'],
    },
    stats : {
        colors : true
    },
    devtool : "source-map",
    optimization : {
        minimize : false,
        usedExports : false,
        sideEffects: false
    },
    watch : false,
    watchOptions : {
        ignored : /node_modules/,
        aggregateTimeout : 10000
    },
    devServer : {
        static : path.join (__dirname, 'dist'),
        port : 3000
    }
};
```

Create `ts.config.json` file with the next content:
```json
{
  "include": ["src/**/*"],

  "compilerOptions": {
    "allowJs": true,
    "declaration": false,
    "moduleResolution": "node",
    "outDir": "dist",
    "lib": ["ES2016", "DOM"],
    "target": "ES2015",
    "module": "ES6",
    "types": [
    ],
    "jsx": "preserve",
    "jsxFactory": "v.tag",
    "sourceMap": true
  }
}
```

This configuration will compile `src/main.ts` to `dist/app.js` and server content from `dist` folder.

### Step 4: Web Page

To mount out JavaScript application is necessary an HTML web page.
Create `dist/index.html` with the next content:
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <title>Vasille Example</title>
</head>
<body>
<script src="app.js"></script>
<noscript>
    This page require enabled javascript :(
</noscript>
</body>
</html>
```

### Step 5: Create `main.js` file

Create `src/main.js` with the next content:
```javascript
import {VApp, app, tag, text} from 'vasille-less';

const MyComponent : VApp = app(() => {
    // create a div node
    tag("div", {}, () => {
        // write some text to it
        text('Welcome to Vasille demo');
    });
});

// Construct and initialize Vasille App
MyApp(document.body, {});
```

### Step 6: Start dev server and open the page

1. Add `serve` script with command `webpack serve` to package.json.
2. Run `serve` script by `npm run serve`;
3. Open `localhost:3000` in browser.

The browser will show you the text `Welcome to Vasille demo`.

## Adding style

### Step 1: Create a `.css` file

Create `dist/main.css` with the following content:
```css
div {
    width: 100vw;
    height: 100vh;
    background: dodgerblue;
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 64px;
    font-family: "Noto Sans", Helvetica, sans-serif;
}

body {
    padding: 0;
    margin: 0;
}
```

### Step 2: Connect `.css` file in html code

Add the next line to `index.html` head:
```html
<link rel="stylesheet" href="main.css">
```

## Custom components

### Step 1: Create component file

Create `src/Page.js` file with the next content:

```javascript
import {VComponent, component, tag, text} from 'vasille-less';

const Page : VComponent = component(() => {
    // create a div node
    tag("div", {}, () => {
        // write some text to it
        text('Welcome to Vasille demo');
    });
})
```

### Step 2: Update `main.js`

```javascript
import {Vapp, app} from 'vasille-less';
import {Page} from "./Page.js";

const MyApp : VApp = app(() => {
    Page({});
});
```

## Sending data to component

### Required non-reactive data

Component:

```typescript
import {VComponent, component, TagOptions} from 'vasille-less';

interface Options extends TagOptions {
    data: string
}

const Page: VComponent<Options> = component(({data}) => {
    console.log(data);
})
```

Parent:
```javascript
import {Vapp, app} from 'vasille-less';
import {Page} from "./Page.js";

const MyApp : VApp = app(() => {
    Page({ data: 'data' });
})
```

### Optional non-reactive data

Component:
```javascript
import {VComponent, component} from 'vasille-less';

interface Options extends TagOptions {
    data ?: string
}

const Page : VComponent = component((options) => {
    const data = options.data || 'default';
    
    console.log(data);
})
```

Parent:
```javascript
import {VApp, app} from 'vasille-less';
import {Page} from "./Page.js";

const MyApp : VApp = app(() => {
    Page({ data: 'data' });
})
```

## Reactive data

How to make the text of example page reactive:
1. Create a reference to data;
2. Send the reference to child, like previous examples;
3. Use the reference in the child component;

Component:
```javascript
import {TagOptions, VComponent, component, tag, text} from 'vasille-less';

interface Options extends TagOptions {
    data : IValue<string>
}

// Declare a custom component
export const Page : VComponent<Options> = component(() => {
    tag('div', {}, () => {
        text(data)
    })
})
```

<hr>

Parent:
```javascript
import {VApp, app, ref} from 'vasille-less';
import {Page} from "./Page.js";

const MyApp : VApp = app(() => {
    const data = ref('Hello world');
    
    // send reactive reference to child
    Page({data});

    // Change the text after ten seconds
    setTimeout(() => {
        // .$ is used to get and change value of reference
        data.$ = "Welcome to Vasille demo";
    }, 10 * 1000);
})
```

## Wrapper Component

A common case is to create an element which wrap some content.
So let's do it.

Wrapper Component:
```javascript
import {TagOptions, VComponent, component, tag} from 'vasille-less';

interface Opts extends TagOptions<"div"> {
    // declare a slot
    slot ?: () => void
}

export const Wrapper : VComponent<Opts> = component(({slot}) => {
    // create a div and insert the slot content to it
    tag("div", {}, slot);
});
```

<hr>

Parent:
```javascript
import {VApp, app, text} from 'vasille-less';
import {Wrapper} from "./Wrapper";

const MyApp : VApp = app(() => {
    // insert custom content to slot
    Wrapper({}, () => {
        // this text will be inserted in div node
        text('Welcome to Vasille demo');
    });
})
```


##  Extend a component

Vasille doesn't have any mixins, because mixins are evil, 
OOP methodology defines 2 methods to extend a class:
inheritance and composition. The Vasille Less Library 
extends components using composition. Let's take a look.

```javascript
import {VExtension, extension, VComponent, component, VFragment, fragment, tag, extend} from 'vasille-less';

const MyExtension : VExtension = extension(() => {
    extend<'div'>({
        class: ['extension-class']
    })
})

const Component : VComponent = component(({slot}) => {
    tag('div', {class: ['component-class']}, slot);
})

const Compose : VFragment = fragment(() => {
    // create the component first
    Component({}, () => {
        // compose component with extension
        MyExtension({})
    })
    // the HTML will be <div class="component-class extension-class" />
})
```

Extensions can be used to add additional classes, styles, attributes,
events handlers and logic to your component. Fragments cannot be extended
using extensions, but a fragment can be extended by another fragment.
