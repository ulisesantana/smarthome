export function mockFunction<Return, Params extends any[]> (fn?: (...args: Params) => Return) {
  return fn ? jest.fn<Return, Params>(fn) : jest.fn<Return, Params>()
}
