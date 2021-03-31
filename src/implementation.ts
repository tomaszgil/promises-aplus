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
    x.then(
      (value: PromiseValue) => resolve(value),
      (reason: PromiseReason) => reject(reason)
    )
  } else if (x && (typeof x === 'object' || typeof x === 'function')) {
    let then

    try {
      then = x.then
    } catch (e) {
      reject(e)
    }

    if (typeof then === 'function') {
      then.call(
        x,
        (value: PromiseValue) => resolvePromise(promise, value, resolve, reject),
        (reason: PromiseReason) => reject(reason)
      )
    }
  } else {
    resolve(x)
  }
}

class PromiseAplus {
  private status: Status = Status.PENDING
  private value: PromiseValue
  private reason: PromiseReason

  private callbacks: Callback[] = []

  constructor(executor?: (resolve: ResolveFunction, reject: RejectFunction) => void) {
    executor?.(this.resolve.bind(this), this.reject.bind(this))
  }

  then(onFulfilled?: Function, onRejected?: Function) {
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

  private resolve(value?: PromiseValue) {
    if (this.status === Status.PENDING) {
      this.status = Status.FULFILLED
      this.value = value
      this.invokeCallbacks()
    }
  }

  private reject(reason?: PromiseReason) {
    if (this.status === Status.PENDING) {
      this.status = Status.REJECTED
      this.reason = reason
      this.invokeCallbacks()
    }
  }

  private invokeCallbacks() {
    setImmediate((callbacks) => {
      for (let { onFulfilled, onRejected, promise, reject, resolve } of callbacks) {
        const statusToCallbackFn = {
          [Status.PENDING]: undefined,
          [Status.FULFILLED]: onFulfilled,
          [Status.REJECTED]: onRejected,
        }
        const statusToFallbackFn = {
          [Status.PENDING]: undefined,
          [Status.FULFILLED]: resolve,
          [Status.REJECTED]: reject,
        }
        const statusToArgument = {
          [Status.PENDING]: undefined,
          [Status.FULFILLED]: this.value,
          [Status.REJECTED]: this.reason,
        }
        const callbackFn = statusToCallbackFn[this.status]
        const argument = statusToArgument[this.status]

        if (!callbackFn) {
          const fallbackFn = statusToFallbackFn[this.status]
          return fallbackFn?.(argument)
        }

        try {
          const x = callbackFn?.(argument)
          resolvePromise(promise, x, resolve, reject)
        } catch (e) {
          reject(e)
        }
      }
    }, this.callbacks)

    this.callbacks = []
  }
}

export default PromiseAplus
