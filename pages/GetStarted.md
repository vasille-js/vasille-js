# Get Started with Vasille Core Library

This instruction is dedicated for beginners, it describes how to create a Vasille based project step by step.

## Minimal JavaScript Example

To keep it simple, this example will use pure JavaScript without any translators.

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

* Install `vasille` as dependency;
* Install `webpack`, `webpack-cli` & `webpack-dev-server` as development dependencies;

All terminal commands:
```shell
npm install --save vasille;
npm install --save-dev webpack webpack-cli webpack-dev-server;
```

### Step 3: Configure WebPack

Create `webpack.config.js` file with the next content:
```javascript
const path = require ("path");

module.exports = {
    mode : "development",
    entry : "./src/main.js",
    output : {
        filename : "app.js",
        path : path.resolve (__dirname, "dist")
    },
    stats : {
        colors : true
    },
    devtool : "source-map",
    optimization : {
        minimize : false
    },
    watch : true,
    watchOptions : {
        ignored : /node_modules/,
        aggregateTimeout : 10000
    },
    devServer : {
        contentBase : path.join (__dirname, 'dist'),
        port : 3000
    }
};
```

This configuration will compile `src/main.js` to `dist/app.js` and server content from `dist` folder.

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
import { App } from "vasille";

// declare a Vasille App
class MyApp extends App {
    
    constructor () {
        // set the mount point here, document body is a good choise
        super(document.body);
    }
    
    // declare component composition logic
    compose () {
        // create a div node
        this.tag("div", div => {
            // write some text to it
            div.text('Welcome to Vasille demo');
        });
    }
}

// Construct and initialize Vasille App
new MyApp().init();
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
import { Component } from "vasille";

// Declare a custom component
export class Page extends Component {
    // declare component composition logic
    compose () {
        // create a div node
        this.tag("div", div => {
            // write some text to it
            div.text('Welcome to Vasille demo');
        });
    }
}
```

### Step 2: Update `main.js`

```javascript
import { App } from "vasille";
import { Page } from "./Page.js";

// declare a Vasille App
class MyApp extends App {
    
    constructor () {
        // set the mount point here, document body is a good choise
        super(document.body);
    }
    
    // declare component composition logic
    compose () {
        // use the page compoent
        this.create(new Page);
    }
}
```

## Sending data to component

### Required non-reactive data

Component:
```javascript
import { Component } from "vasille";

export class Page extends Component {
    constructor(data) {
        this.data = data;
    }
}
```

Parent:
```javascript
import { App } from "vasille";
import { Page } from "./Page.js";

class MyApp extends App {
    
    compose () {
        this.create(new Page('data'));
    }
}
```

### Optional non-reactive data

Component:
```javascript
import { Component } from "vasille";

export class Page extends Component {
    constructor() {
        super();
        this.data = 'default data';
    }
}
```

Parent:
```javascript
import { App } from "vasille";
import { Page } from "./Page.js";

class MyApp extends App {
    
    compose () {
        this.create(new Page, $ => $.data = 'data');
    }
}
```

## Reactive data

How to make the text of example page reactive:
1. Create a reference to data;
2. Send the reference to child, like previous examples;
3. Use the reference in the child component;

Component:
```javascript
import { Component } from "vasille";

// Declare a custom component
export class Page extends Component {
    constructor() {
        super();
        this.data = this.ref('default value');
    }
    
    // declare component composition logic
    compose () {
        // create a div node
        this.tag("div", div => {
            // write reactive text to it
            div.text(this.data);
        });
    }
}
```

<hr>

Parent:
```javascript
import { App } from "vasille";
import { Page } from "./Page.js";

class MyApp extends App {
    
    constructor () {
        super(document.body);
        // declare a reference
        this.data = this.ref('');
    }
    
    compose () {
        // send reactive reference to child
        this.create(new Page, $ => $.data = this.data);
        
        // Change the text after ten seconds
        setTimeout(() => {
            // .$ is used to get and change value of reference
            this.data.$ = "Welcome to Vasille demo";
        }, 10 * 1000);
    }
}
```

## Component slots

This example describe how to create the `div` tag in `Page` component,
but the text to it will be generated in `MyApp` component.

Component:
```javascript
import { Component, Slot } from "vasille";

export class Page extends Component {
    constructor() {
        super();
        // declare a slot
        this.slot = new Slot;
    }
    
    compose () {
        this.tag("div", div => {
            // insert the slot content here
            slot.release(div);
        });
    }
}
```

<hr>

Parent:
```javascript
import { App } from "vasille";
import { Page } from "./Page.js";

class MyApp extends App {
    
    constructor () {
        super(document.body);
    }
    
    compose () {
        // insert custom content to slot
        this.create(new Page, $ => $.slot.insert((node) => {
            // this text will be inserted in div node
            node.text('Welcome to Vasille demo');
        }));
    }
}
```
