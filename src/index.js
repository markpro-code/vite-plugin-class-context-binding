import { generate } from '@babel/generator'
import { parse } from '@babel/parser'
import _traverse from '@babel/traverse'
import * as t from '@babel/types'

const traverse = _traverse.default || _traverse

export default function classContextBinding(options = {}) {
  const {
    forceMethodToClassProperty = true,
    bindGetterAndSetterForPrivateProperty = false,
  } = options
  return {
    name: 'vite-plugin-class-context-binding',
    transform(src, id) {
      // Check if the file is a JavaScript file
      if (!id.endsWith('.js')) {
        return
      }

      // Parse the source code into an AST
      const ast = parse(src, {
        sourceType: 'module',
        plugins: ['classProperties', 'privateIn'],
      })

      // Traverse the AST and convert methods to class properties
      traverse(ast, {
        ClassMethod(path) {
          if (forceMethodToClassProperty && path.node.key.name !== 'constructor' && path.node.kind === 'method') {
            // Extract method name and body
            const methodName = path.node.key.name
            const methodBody = path.node.body

            // Create a class property with auto binding
            const classProperty = t.classProperty(
              t.identifier(methodName),
              t.arrowFunctionExpression(path.node.params, methodBody, path.node.async),
            )

            // Replace the method with the class property
            path.replaceWith(classProperty)
            return
          }

          if (bindGetterAndSetterForPrivateProperty && (path.node.kind === 'get' || path.node.kind === 'set')) {
            let hasPrivateProperty = false
            path.traverse({
              MemberExpression(memberPath) {
                if (t.isPrivateName(memberPath.node.property)) {
                  hasPrivateProperty = true
                }
              }
            })

            if (hasPrivateProperty) {
              const classBody = path.parentPath.node.body
              if (path.node.kind === 'get') {
                const getterName = path.node.key.name
                const newMethodName = `__getterFn__${getterName}`
                const newMethod = t.classProperty(
                  t.identifier(newMethodName),
                  t.arrowFunctionExpression([], path.node.body)
                )
                classBody.push(newMethod)
                path.get('body').replaceWith(
                  t.blockStatement([
                    t.returnStatement(
                      t.callExpression(
                        t.memberExpression(t.thisExpression(), t.identifier(newMethodName)),
                        []
                      )
                    )
                  ])
                )
              } else { // setter
                const setterName = path.node.key.name
                const newMethodName = `__setterFn__${setterName}`
                const newMethod = t.classProperty(
                  t.identifier(newMethodName),
                  t.arrowFunctionExpression(path.node.params, path.node.body)
                )
                classBody.push(newMethod)
                path.get('body').replaceWith(
                  t.blockStatement([
                    t.expressionStatement(
                      t.callExpression(
                        t.memberExpression(t.thisExpression(), t.identifier(newMethodName)),
                        path.node.params
                      )
                    )
                  ])
                )
              }
            }
          }
        },
      })

      // Generate the new code from the modified AST
      const output = generate(ast, {}, src)

      return {
        code: output.code,
        map: output.map,
      }
    },
  }
}