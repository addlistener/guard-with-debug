# Guard with debug

During babel transform we will turn `console.log(...)` into
```
if (debug.enabled("path/to/file.js") console.log(...)
```

For those who want
- To turn on / off `console.log` using [debug.js](https://github.com/debug-js/debug) based on file name. No need to `require('debug')('make:up:a:module:name')` any more.
- Browser native click go to source support for [debug.js](https://github.com/debug-js/debug), which is not possible when you substitute `console.log = debug("a:b:c")`
- To remove console.xxx in production.

Solves this problem specifically [How to disable console.log messages based on criteria from specific javascript source (method, file) or message contents](https://stackoverflow.com/questions/39634926/how-to-disable-console-log-messages-based-on-criteria-from-specific-javascript-s/75031674#75031674) Please kindly let me know if it's useful.

And I have found that this plugin actually encourages me to write more modular code that I can turn on / off together with the same rule. 


## Usage

```javascript
// Turn on in browser
localStorage.setItem('debug', 'src/folderA/*');

// src/folderA/*.js
console.log(...); // will be logged

// src/folderB/*.js
console.log(...); // will not be logged

// The preset way, based on multiple module you will access in a single execution.
// Register in localStorage as below.
const myDebugPreset = [
  'src/first-function/*',
  'src/second-function/*',
  'src/third-function/*',
];

// Multiple rules in browser
// For specific rules check https://github.com/debug-js/debug
localStorage.setItem('debug', [
  '-src/disable-me/*',
  'src/enable-me/*',
  ...myDebugPreset,
  'src/*'
].join(','));
```

If you transform your node.js files with babel you can also do the following 

```bash
# Turn on in Node.js
DEBUG="src/folderA/*" node server.js

// src/folderA/*.js
console.log(...); // will be logged

// src/folderB/*.js
console.log(...); // will not be logged

# Turn off in Node.js
DEBUG="" node server.js
```

If you don't transform your node.js files with babel, please submit an issue and let me know. I have a non-transform version, but I am not sure how many people need it.

## Setup
```bash
# npm
npm install --save debug
npm install --save-dev babel-plugin-guard-with-debug 

# yarn
yarn add debug
yarn add -D babel-plugin-guard-with-debug
```

```javascript
// .babelrc.js
const path = require('path');

// the root folder as you want
const root = path.resolve('./') + '/';

module.exports = {
    ...
    "plugins": [
      ...,
      [
        "guard-with-debug",
        {
          // transform your '/path/to/repo/module/file.js' to 'module/file.js'
          // so that we can do `if (debug.enabled('module/file.js')) console.log(...)`
          "getDebugModuleName": ({absFileName}) => absFileName.split(root)[1],

          // remove all console.log(...) in production
          // will override "getDebugModuleName"
          "shouldRemove": ({absFileName}) => process.env.NODE_ENV === 'production',
          
          // do not "guard with debug" or "remove" these functions
          // by default all the console.xxx functions will be processed
          "exclude": ["error", "warn"]
        }
      ]
    ]
};
```

## Roadmap
- unit tests
- examples
- swc support
