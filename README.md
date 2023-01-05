# Guard with debug

During babel transform we will turn `console.log(...)` into
```
if (debug.enabled("path/to/file.js") console.log(...)
```

For those who want
- To turn on / off `console.log` using [debug.js](https://github.com/debug-js/debug) based on file name. No need to `require('debug')('make:up:a:module:name')` any more.
- Browser native click go to source support for [debug.js](https://github.com/debug-js/debug), which is not possible when you substitute `console.log = debug("a:b:c")`
- To remove console.xxx in production.

## Usage

```javascript
// Turn on in browser
localStorage.setItem('debug', 'src/folderA/*');

// src/folderA/*.js
console.log(...); // will be logged

// src/folderB/*.js
console.log(...); // will not be logged

// Turn off in browser
localStorage.setItem('debug', '');

// Multiple rules in browser
// For specific rules check https://github.com/debug-js/debug
localStorage.setItem('debug', [
  '-src/disable-me/*',
  'src/enable-me/*',
  'src/*'
].join(','));
```

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
- examples
- swc support
