# vite-plugin-class-context-binding

this is a vite plugin to bind class member context.

## Motivation

In vue, We often got following error when using custom class with private properties:
```
Uncaught TypeError: Cannot read private member #XXX from an object whose class did not declare it
```

As in vue we usually use proxy to wrap the class instance, so the context is not bound to the class instance, but to the proxy object. So when we try to access the private property, the proxy object will throw error.

This plugin will transform the class methods/getters/setters to class properties, so the context will be bound to the class instance.

## Usage

this plugin have two config options:
- `forceMethodToClassProperty`: boolean, default is true. if true, the method will be transformed to class property (arrow function, so the context will be bound to the class instance).
- `bindGetterAndSetterForPrivateProperty`: boolean, default is false. if true, the getter/setter context will be bound for private properties visiting.

the plugin will be used in the following way:

install the plugin:

```bash
npm install --save-dev vite-plugin-class-context-binding
```

then add it to your vite config:

```javascript
import { defineConfig } from 'vite'
import classContextBinding from 'vite-plugin-class-context-binding'

export default defineConfig({
  plugins: [
    classContextBinding({
      forceMethodToClassProperty: true, 
      bindGetterForPrivateProperty: true 
    })],
})
```

## Transform method to class property

if `forceMethodToClassProperty` is true, the plugin will transform all methods to class properties:
```javascript
  method() {
    // code
  }
```
to:
```javascript
  method = () => {
    // code
  }
```

## Binding getter and setter for private property

if `bindGetterAndSetterForPrivateProperty` is true, the plugin will check all geeters/setters in class, if getter/setter has private property access or value setting, it will do following transform:

the getter should transform:
```javascript
  get name() {
    return this.#name
  }
```
to:
```javascript
  get name() {
    return this.__getterFn__name()
  }
  __getterFn__name = () => {
    return this.#name
  }
```


the setter should transform:
```javascript
  set name(value) {
    this.#name = value
  }
```
to:
```javascript
  set name(value) {
    this.__setterFn__name(value)
  }
  __setterFn__name = (value) => {
    this.#name = value
  }
```
