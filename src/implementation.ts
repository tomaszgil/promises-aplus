enum Status {
  PENDING,
  FULFILLED,
  REJECTED,
}

type PromiseValue = any
type PromiseReason = any

type ResolveFunction = (value: PromiseValue) => void
type RejectFunction = (reason: PromiseReason) => void

interface Callback {
  promise: PromiseAplus
  resolve: ResolveFunction
  reject: RejectFunction
  onFulfilled?: Function
  onRejected?: Function
}

function resolvePromise(
  promise: PromiseAplus,
  x: any,
  resolve: ResolveFunction,
  reject: RejectFunction
) {
  if (promise === x) {
    reject(new TypeError())
  }

  if (x instanceof PromiseAplus) {
    if (x.status === Status.PENDING) {
      x.then(
        (value: PromiseValue) => resolve(value),
        (reason: PromiseReason) => reject(reason)
      )
    } else if (x.status === Status.FULFILLED) {
      resolve(x.value)
    } else if (x.status === Status.REJECTED) {
      reject(x.reason)
    }
  } else if (x instanceof Object) {
    let then

    try {
      then = x.then
    } catch (e) {
      reject(e)
    }

    if (typeof then === 'function') {
      x.then(
        (value: PromiseValue) => resolvePromise(promise, value, resolve, reject),
        (reason: PromiseReason) => reject(reason)
      )
    }
  } else {
    resolve(x)
  }
}

class PromiseAplus {
  status: Status = Status.PENDING
  value: PromiseValue
  reason: PromiseReason

  private callbacks: Callback[] = []

  static resolve(value: PromiseValue) {
    const promise = new PromiseAplus()
    promise.status = Status.FULFILLED
    promise.value = value
    return promise
  }

  static reject(reason: PromiseReason) {
    const promise = new PromiseAplus()
    promise.status = Status.REJECTED
    promise.reason = reason
    return promise
  }

  constructor(executor?: (resolve: ResolveFunction, reject: RejectFunction) => void) {
    executor?.(this.resolve.bind(this), this.reject.bind(this))
  }

  then(onFulfilled?: Function, onRejected?: Function) {
    if (this.status === Status.FULFILLED && typeof onFulfilled !== 'function') {
      return PromiseAplus.resolve(this.value)
    }

    if (this.status === Status.REJECTED && typeof onRejected !== 'function') {
      return PromiseAplus.reject(this.reason)
    }

    let res: ResolveFunction
    let rej: RejectFunction
    const promise = new PromiseAplus((resolve, reject) => {
      res = resolve
      rej = reject
    })

    const callback: Callback = {
      promise,
      resolve: res!,
      reject: rej!,
    }

    if (typeof onFulfilled === 'function') {
      callback.onFulfilled = onFulfilled
    }

    if (typeof onRejected === 'function') {
      callback.onRejected = onRejected
    }

    this.callbacks.push(callback)

    if (this.status !== Status.PENDING) {
      this.invokeCallbacks()
    }

    return callback.promise
  }

  private resolve(value: PromiseValue) {
    if (this.status === Status.PENDING) {
      this.status = Status.FULFILLED
      this.value = value
      this.invokeCallbacks()
    }
  }

  private reject(reason: PromiseReason) {
    if (this.status === Status.PENDING) {
      this.status = Status.REJECTED
      this.reason = reason
      this.invokeCallbacks()
    }
  }

  private invokeCallbacks() {
    for (let { onFulfilled, onRejected, promise, reject, resolve } of this.callbacks) {
      const statusToCallbackFn = {
        [Status.PENDING]: undefined,
        [Status.FULFILLED]: onFulfilled,
        [Status.REJECTED]: onRejected,
      }
      const statusToArgument = {
        [Status.PENDING]: undefined,
        [Status.FULFILLED]: this.value,
        [Status.REJECTED]: this.reason,
      }
      const callbackFn = statusToCallbackFn[this.status]
      const argument = statusToArgument[this.status]

      setImmediate(() => {
        if (!callbackFn) {
          return
        }

        try {
          const x = callbackFn(argument)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      })
    }

    this.callbacks = []
  }
}

export default PromiseAplus
