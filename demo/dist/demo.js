class Demo {
  #name = "Demo";
  constructor() {
  }
  get name() {
    return this.__getterFn__name();
  }
  set name(value) {
    this.__setterFn__name(value);
  }
  method = () => {
    return this.#name;
  };
  asyncMethod = async () => {
    return await Promise.resolve(this.#name);
  };
  __getterFn__name = () => {
    return this.#name;
  };
  __setterFn__name = (value) => {
    this.#name = value;
  };
}
const demo = new Demo();
const {
  method,
  asyncMethod,
  name
} = demo;
console.info("name", name);
console.info("method()", method());
console.info("asyncMethod()", asyncMethod());
demo.name = "new name";
console.info("new name", demo.name);
export {
  Demo as default
};
