class Demo {
  #name = 'Demo'
  constructor() {}

  get name() {
    return this.#name
  }

  set name(value) {
    this.#name = value
  }

  method() {
    return this.#name
  }

  async asyncMethod() {
    return await Promise.resolve(this.#name)
  }
}

const demo = new Demo()

const { method, asyncMethod, name } = demo

console.info('name', name)
console.info('method()', method())
console.info('asyncMethod()', asyncMethod())

demo.name = 'new name'

console.info('new name', demo.name)


export default Demo
