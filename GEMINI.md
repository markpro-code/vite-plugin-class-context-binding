this is a vite plugin to bind class context to the component.

this plugin have two config options:
- `forceMethodToClassProperty`: boolean, default is true. if true, the method will be transformed to class property (arrow function, so the context will be bound to the class instance).
- `bindGetterAndSetterForPrivateProperty`: boolean, default is false. if true, the getters/setters context will be bound for private properties visiting.

the plugin will be used in the following way:

```javascript
import { defineConfig } from 'vite'
import classContextBinding from 'vite-plugin-class-context-binding'

export default defineConfig({
  plugins: [classContextBinding({ forceMethodToClassProperty: true, bindGetterForPrivateProperty: true })],
})
```

this plugin don't need to build with vite, using source code in lib/index.js directly.
