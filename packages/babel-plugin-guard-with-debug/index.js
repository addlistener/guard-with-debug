"use strict";

const babel = require('@babel/core');

module.exports = function ({types: t}) {
  return {
    name: "babel-plugin-guard-with-debug",
    visitor: {
      Program: {
        enter: (path, state) => {
          const opts = state.opts || {};

          if (!opts.getModuleName) {
            throw new Error('opts.getModuleName must be a function: ({absFileName: string}) => string');
          }

          let parsed = babel.parse("const debug = require('debug');\n", { filename: '' });

          if (parsed.program.body.length > 1) {
            throw new Error('The prepend value must contain one single statement');
          }

          path.node.body.unshift(parsed.program.body[0]);
        }
      },

      CallExpression(path, state) {
        const callee = path.get("callee");
        const opts = state.opts || {};

        let getModuleName = opts.getModuleName;
        if (!getModuleName && opts.rootPath) {
          getModuleName = (absFilename) => {
            const a = absFilename.split(opts.rootPath)[1];
            console.log(111, absFilename, opts.rootPath, a);
            return a;
          }
        }

        if (!callee.isMemberExpression()) return;

        if (isIncludedConsole(callee, state.opts.exclude)) {
          // console.log()
          if (path.parentPath.isExpressionStatement()) {
            const consequent = t.blockStatement([t.cloneDeep(path.container)]);

            let args = [
              t.stringLiteral(getModuleName({absFileName: state.file.opts.filename})),
              // t.identifier('__filename')
            ];
            const condition = t.callExpression(
              t.identifier('debug.enabled'),
              args);
            const guarded = t.ifStatement(condition, consequent);
            path.replaceWith(guarded);
          } else {
            // path.replaceWith(createVoid0());
          }
        } else if (isIncludedConsoleBind(callee, state.opts.exclude)) {
          // console.log.bind()
          // path.replaceWith(createNoop());
        }
      },
      MemberExpression: {
        exit(path, state) {
          if (
            isIncludedConsole(path, state.opts.exclude) &&
            !path.parentPath.isMemberExpression()
          ) {
            if (
              path.parentPath.isAssignmentExpression() &&
              path.parentKey === "left"
            ) {
              path.parentPath.get("right").replaceWith(createNoop());
            } else {
              // path.replaceWith(createNoop());
            }
          }
        }
      }
    }
  };

  function isGlobalConsoleId(id) {
    const name = "console";
    return (
      id.isIdentifier({name}) &&
      !id.scope.getBinding(name) &&
      id.scope.hasGlobal(name)
    );
  }

  function isExcluded(property, excludeArray) {
    return (
      excludeArray && excludeArray.some(name => property.isIdentifier({name}))
    );
  }

  function isIncludedConsole(memberExpr, excludeArray) {
    const object = memberExpr.get("object");
    const property = memberExpr.get("property");

    if (isExcluded(property, excludeArray)) return false;

    if (isGlobalConsoleId(object)) return true;

    return (
      isGlobalConsoleId(object.get("object")) &&
      (property.isIdentifier({name: "call"}) ||
        property.isIdentifier({name: "apply"}))
    );
  }

  function isIncludedConsoleBind(memberExpr, excludeArray) {
    const object = memberExpr.get("object");

    if (!object.isMemberExpression()) return false;
    if (isExcluded(object.get("property"), excludeArray)) return false;

    return (
      isGlobalConsoleId(object.get("object")) &&
      memberExpr.get("property").isIdentifier({name: "bind"})
    );
  }

  function createNoop() {
    return t.functionExpression(null, [], t.blockStatement([]));
  }

  function createVoid0() {
    return t.unaryExpression("void", t.numericLiteral(0));
  }
};
