"use strict"

const F      = require("../bin/flowless")
const assert = require("assert")

Object.defineProperty(Promise.prototype, 'end', {
  value(done) { this.then(() => done(), done) }
})

describe("compose", () => {

  it("Simple function, pass in parameters", () => {
    const sum = (a, b) => a + b 
    const result = F.compose(sum)(3, 5)
    assert.strictEqual(result, 8)
  })

  it("Single function, wait for parameters", done => {
    const sum = (a, b) => a + b 
    F.compose(sum)(3, Promise.resolve(5))
    .then(result => assert.strictEqual(result, 8))
    .end(done)
  })

  it("Chain forward multiple functions", () => {
    const sum = a => b => a + b
    const mul = a => b => a * b
    const result = F.compose(sum(10), mul(2), sum(3))(10)
    assert.strictEqual(result, 43)
  })

  it("Chain forward multiple functions, promise arguments", done => {
    const sum = a => b => a + b
    const mul = a => b => a * b
    F.compose(sum(10), mul(2), sum(3))(Promise.resolve(10))
    .then(result => assert.strictEqual(result, 43))
    .end(done)
  })

  it("Chain forward multiple functions, promise function result", done => {
    const sum = a => b => a + b
    const mul = a => b => Promise.resolve(a * b)
    F.compose(sum(10), mul(2), sum(3))(10)
    .then(result => assert.strictEqual(result, 43))
    .end(done)
  })

  it("Catcher function should catch synchronous errors.", () => {
    const object = { }
    const result = F.compose(result => { if (isNaN(result)) throw object },
                             x => -x,
                             F.catch(err => err))("not a number")
    assert.strictEqual(result, object)
  })

  it("Catcher function should catch asynchronous errors.", () => {
    const object = { }
    F.compose(result => { if (isNaN(result)) throw object },
              x => -x,
              F.catch(err => err))(Promise.resolve("not a number"))
    .then(err => assert.strictEqual(result, object))
  })

})

describe("curry", () => {

  it("synchronous arguments", () => {
    const addMul = F.curry((a, b, c) => {
      return (a + b) * c
    })
    const result = addMul(2)(3)(5)
    assert.strictEqual(result, 25)
  })

  it("asynchronous arguments - detect and await, return promise", done => {
    const addMul = F.curry((a, b, c) => {
      return (a + b) * c
    })
    addMul(2, Promise.resolve(3))(5)
    .then(result => assert.strictEqual(result, 25))
    .end(done)
  })

})

describe("range", () => {
  it("single parameter > 0 => range from 0 ascending", () => {
    const result = [ ]
    for (const i of F.range(5)) {
      result.push(i)
    }
    assert.deepEqual(result, [0, 1, 2, 3, 4, 5])
  })
  it("single parameter < 0 => range from 0 descending", () => {
    const result = [ ]
    for (const i of F.range(-5)) {
      result.push(i)
    }
    assert.deepEqual(result, [0, -1, -2, -3, -4, -5])
  })
  it("two parameters, range from min to max ascending", () => {
    const result = [ ]
    for (const i of F.range(5, 10)) {
      result.push(i)
    }
    assert.deepEqual(result, [5, 6, 7, 8, 9, 10])
  })
  it("two parameters, range from max to min descending", () => {
    const result = [ ]
    for (const i of F.range(10, 5)) {
      result.push(i)
    }
    assert.deepEqual(result, [10, 9, 8, 7, 6, 5])
  })
})

describe("forEach", () => {
  it("iterate over an array", () => {
    const arr    = [7, 6, 8, 9]
    const result = [ ]
    F.forEach((value, i, arr) => result.push({ value, i, arr}), arr)
    assert.deepEqual(result, [
      { value: 7, i: 0, arr },
      { value: 6, i: 1, arr },
      { value: 8, i: 2, arr },
      { value: 9, i: 3, arr }
    ])
  })
  it("iterate over a range", () => {
    const range  = F.range(5, 1)
    const result = [ ]
    F.forEach((value, i, range) => result.push({ value, i, range}), range)
    assert.deepEqual(result, [
      { value: 5, i: 0, range },
      { value: 4, i: 1, range },
      { value: 3, i: 2, range },
      { value: 2, i: 3, range },
      { value: 1, i: 4, range }
    ])
  })
  it("iterate over an object", () => {
    const object = { one: "Uno", two: "Dos", three: "Tres" }
    const result = [ ]
    F.forEach((value, key, object) => result.push({ value, key, object}), object)
    assert.deepEqual(result, [
      { value: "Uno",  key: "one",   object },
      { value: "Dos",  key: "two",   object },
      { value: "Tres", key: "three", object },
    ])
  })
})
