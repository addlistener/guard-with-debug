# Guard with debug

During babel transform we will turn `console.log(...)` into
```
if (debug.enabled("path/to/file.js") console.log(...)
```

For those who
- Want to turn on / off `console.log` using [debug.js](https://github.com/debug-js/debug) based on file name. No need to `require('debug')('make:up:a:module:name')` any more.
- Need browser native click go to source support for [debug.js](https://github.com/debug-js/debug), which is not possible when you substitute `console.log = debug("a:b:c")`

## Roadmap
- console.warn/info/error... support
- examples
- swc support

## Setup
```bash
# npm
npm install @super-console/babel-plugin-guard-with-debug debug

# yarn
yarn add @super-console/babel-plugin-guard-with-debug debug
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
        "getDebugModuleName": ({absFileName}) => absFileName.split(root)[1]
      }
    ]
  ]
};
```

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
