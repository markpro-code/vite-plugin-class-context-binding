import { describe, it, expect } from 'vitest'
import { ref } from 'vue'
import classContextBinding from '../src/index.js'

describe('vite-plugin-class-context-binding', () => {
  it('should transform class methods to class properties by default', () => {
    const plugin = classContextBinding()
    const transform = plugin.transform
    const code = `
      class MyClass {
        constructor() {}
        myMethod() {
          return this;
        }
      }
    `
    const expected = `class MyClass {
  constructor() {}
  myMethod = () => {
    return this;
  };
}`

    const result = transform(code, 'test.js')
    expect(result.code.trim()).toBe(expected.trim())
  })

  it('should not transform class methods when forceMethodToClassProperty is false', () => {
    const plugin = classContextBinding({ forceMethodToClassProperty: false })
    const transform = plugin.transform
    const code = `
      class MyClass {
        constructor() {}
        myMethod() {
          return this;
        }
      }
    `
    const expected = `class MyClass {
  constructor() {}
  myMethod() {
    return this;
  }
}`

    const result = transform(code, 'test.js')
    expect(result.code.trim()).toBe(expected.trim())
  })

  it('should not transform getters and setters by default', () => {
    const plugin = classContextBinding()
    const transform = plugin.transform
    const code = `
      class MyClass {
        #name = "test"
        get name() {
          return this.#name;
        }
        set name(value) {
          this.#name = value;
        }
      }
    `
    const expected = `class MyClass {
  #name = "test";
  get name() {
    return this.#name;
  }
  set name(value) {
    this.#name = value;
  }
}`
    const result = transform(code, 'test.js')
    expect(result.code.trim()).toBe(expected.trim())
  })

  it('should transform getters and setters when bindGetterAndSetterForPrivateProperty is true', () => {
    const plugin = classContextBinding({ bindGetterAndSetterForPrivateProperty: true })
    const transform = plugin.transform
    const code = `
      class MyClass {
        #name = "test"
        get name() {
          return this.#name;
        }
        set name(value) {
          this.#name = value;
        }
      }
    `
    const expected = `class MyClass {
  #name = "test";
  get name() {
    return this.__getterFn__name();
  }
  set name(value) {
    this.__setterFn__name(value);
  }
  __getterFn__name = () => {
    return this.#name;
  };
  __setterFn__name = value => {
    this.#name = value;
  };
}`
    const result = transform(code, 'test.js')
    expect(result.code.trim()).toBe(expected.trim())
  })

  it('should transform both methods and getters/setters when both options are true', () => {
    const plugin = classContextBinding({ forceMethodToClassProperty: true, bindGetterAndSetterForPrivateProperty: true })
    const transform = plugin.transform
    const code = `
      class MyClass {
        #name = "test"
        myMethod() {
          return this;
        }
        get name() {
          return this.#name;
        }
        set name(value) {
          this.#name = value;
        }
      }
    `
    const expected = `class MyClass {
  #name = "test";
  myMethod = () => {
    return this;
  };
  get name() {
    return this.__getterFn__name();
  }
  set name(value) {
    this.__setterFn__name(value);
  }
  __getterFn__name = () => {
    return this.#name;
  };
  __setterFn__name = value => {
    this.#name = value;
  };
}`
    const result = transform(code, 'test.js')
    expect(result.code.trim()).toBe(expected.trim())
  })

  it('should bind the context of the method to the class instance', () => {
    const plugin = classContextBinding()
    const transform = plugin.transform
    const code = `
      class MyClass {
        myMethod() {
          return this;
        }
      }
    `
    const result = transform(code, 'test.js')
    const MyClass = eval(`(${result.code})`)
    const instance = new MyClass()
    expect(instance.myMethod.call(null)).toBe(instance)
  })

  it('should work with proxy objects', () => {
    const plugin = classContextBinding({ bindGetterAndSetterForPrivateProperty: true })
    const transform = plugin.transform
    const code = `
      class MyClass {
        #name = 'Mark'
        get name() {
          return this.#name
        }
      }
    `
    const result = transform(code, 'test.js')
    const MyClass = eval(`(${result.code})`)
    const instance = new MyClass()
    const proxy = new Proxy(instance, {})
    expect(proxy.name).toBe('Mark')
  })

  it('should work with vue refs', () => {
    const plugin = classContextBinding({ forceMethodToClassProperty: true, bindGetterAndSetterForPrivateProperty: true })
    const transform = plugin.transform
    const code = `
      class MyClass {
        #name = 'Mark'
        get name() {
          return this.#name
        }
        set name(value) {
          this.#name = value
        }
        method() {
          return this.#name
        }
      }
    `

    const MyClassNoTransform = eval(`(${code})`)
    const instanceNoTransform = new MyClassNoTransform()
    const refNoTransform = ref(instanceNoTransform)
    // should throw error if not transform
    expect(() => refNoTransform.value.name).toThrow()
    expect(() => refNoTransform.value.method()).toThrow()
    expect(() => refNoTransform.value.name = 'new name').toThrow() 

    const result = transform(code, 'test.js')
    const MyClass = eval(`(${result.code})`)
    const instance = new MyClass()
    const refInstance = ref(instance)
    expect(refInstance.value.name).toBe('Mark')
    expect(refInstance.value.method()).toBe('Mark')
    refInstance.value.name = 'new name'
    expect(refInstance.value.name).toBe('new name')
  })
})