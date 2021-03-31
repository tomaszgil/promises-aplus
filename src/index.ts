import PromiseAplus from './implementation'

export function resolved(value?: any) {
  return new PromiseAplus((resolve) => resolve(value))
}

export function rejected(reason?: any) {
  return new PromiseAplus((resolve, reject) => reject(reason))
}

export function deferred() {
  let resolve, reject
  const promise = new PromiseAplus((res, rej) => {
    resolve = res
    reject = rej
  })

  return {
    promise,
    resolve,
    reject,
  }
}
