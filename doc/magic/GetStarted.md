# Get Started with Vasille Magic

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

* Install `vasille-magic` as dependency;
* Install `webpack`, `webpack-cli`, `webpack-dev-server`, `ttypescript` & `ts-loader` 
as development dependencies;

All terminal commands:
```shell
npm install --save vasille-magic;
npm install --save-dev webpack webpack-cli webpack-dev-server ttypescript ts-loader;
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
                        options: {
                            compiler: 'ttypescript'
                        }
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
    "sourceMap": true,
    "plugins": [
      {
        "transform": "vasille-magic"
      }
    ]
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

### Step 5: Create `main.ts` file

Create `src/main.ts` with the next content:
```javascript
const MyComponent : VApp = () => {
    // create a div node
    <div>
        Welcome to Vasille demo
    </div>
};

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

Create `src/Page.ts` file with the next content:

```javascript
import {VComponent} from 'vasille-magic';

const Page : VComponent = () => {
    // create a div node
    <div>
        Welcome to Vasille demo
    </div>
}
```

### Step 2: Update `main.js`

```javascript
import {VApp} from 'vasille-magic';
import {Page} from "./Page.js";

const MyApp : VApp = () => {
    Page({});
};
```

## Sending data to component

### Required non-reactive data

Component:

```typescript
import {VComponent, TagOptions} from 'vasille-magic';

interface Options extends TagOptions {
    data: string
}

const Page: VComponent<Options> = ({data}) => {
    console.log(data);
}
```

Parent:
```javascript
import {VApp} from 'vasille-magic';
import {Page} from "./Page.js";

const MyApp : VApp = () => {
    Page({ data: 'data' });
}
```

### Optional non-reactive data

Component:
```javascript
import {VComponent} from 'vasille-magic';

interface Options extends TagOptions {
    data ?: string
}

const Page : VComponent = (options) => {
    const data = options.data || 'default';
    
    console.log(data);
}
```

Parent:
```javascript
import {VApp} from 'vasille-magic';
import {Page} from "./Page.js";

const MyApp : VApp = () => {
    Page({ data: 'data' });
}
```

## Reactive data

How to make the text of example page reactive:
1. Create a reference to data;
2. Send the reference to child, like previous examples;
3. Use the reference in the child component;

Component:
```javascript
import {TagOptions, VComponent} from 'vasille-magic';

interface Options extends TagOptions {
    data : IValue<string>
}

// Declare a custom component
export const Page : VComponent<Options> = () => {
    <div>
        {data}
    </div>
}
```

<hr>

Parent:
```javascript
import {VApp, ref} from 'vasille-magic';
import {Page} from "./Page.js";

const MyApp : VApp = () => {
    const [data, setData] = ref('Hello world');
    
    // send reactive reference to child
    <Page data={data}/>;

    // Change the text after ten seconds
    setTimeout(() => {
        // setter changes value of reference
        setData("Welcome to Vasille demo");
    }, 10 * 1000);
}
```

## Wrapper Component

A common case is to create an element which wrap some content.
So let's do it.

Wrapper Component:
```javascript
import {TagOptions, VComponent} from 'vasille-magic';

interface Opts extends TagOptions<"div"> {
    // declare a slot
    slot ?: () => void
}

export const Wrapper : VComponent<Opts> = ({slot}) => {
    // create a div
    <div>
        <!-- insert the slot content to it -->
        <vxSlot model={slot} />
    </div>
}
```

<hr>

Parent:
```javascript
import {VApp} from 'vasille-magic';
import {Wrapper} from "./Wrapper";

const MyApp : VApp = () => {
    // create wrapper
    <Wrapper>
        <!-- this text will be inserted in div node -->
        Wellcome to Vasille demo
    </Wrapper>
}
```


##  Extend a component

Vasille doesn't have any mixins, because mixins are evil,
OOP methodology defines 2 methods to extend a class:
inheritance and composition. The Vasille Magic
extends components using composition. Let's take a look.

```javascript
import {VExtension, VComponent, VFragment, tag} from 'vasille-magic';

const MyExtension : VExtension = () => {
    <v-extend class={'extension-class'} />
}

const Component : VComponent = ({slot}) => {
    <div class="component-class">
        {slot && slot()}
    </div>
}

const compose : VFragment = () => {
    // create the component first
    <Component>
        <!-- compose component with extension -->
        <MyExtension />
    </Component>
    // the HTML will be <div class="component-class extension-class" />
}
```

Extensions can be used to add additional classes, styles, attributes,
events handlers and logic to your component. Fragments cannot be extended
using extensions, but a fragment can be extended by another fragment.
