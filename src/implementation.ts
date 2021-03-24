enum Status {
  PENDING,
  FULFILLED,
  REJECTED,
}

interface Callback {
  resolve?: Function
  reject?: Function
  onFulfilled?: Function
  onRejected?: Function
}

class PromiseAplus {
  status: Status = Status.PENDING
  value: any
  reason: any

  private callbacks: Callback[] = []

  static resolve(value: any) {
    const promise = new PromiseAplus()
    promise.status = Status.FULFILLED
    promise.value = value
    return promise
  }

  static reject(reason: any) {
    const promise = new PromiseAplus()
    promise.status = Status.REJECTED
    promise.reason = reason
    return promise
  }

  constructor(
    executor?: (
      resolve: (value: any) => void,
      reject: (value: any) => void
    ) => void
  ) {
    executor?.(this.resolve.bind(this), this.reject.bind(this))
  }

  then(onFulfilled?: Function, onRejected?: Function) {
    if (this.status === Status.FULFILLED && typeof onFulfilled !== 'function') {
      return PromiseAplus.resolve(this.value)
    }

    if (this.status === Status.REJECTED && typeof onRejected !== 'function') {
      return PromiseAplus.reject(this.reason)
    }

    const callback: Callback = {}
    const promise = new PromiseAplus((resolve, reject) => {
      callback.resolve = resolve
      callback.reject = reject
    })

    if (typeof onFulfilled === 'function') {
      callback.onFulfilled = onFulfilled
    }

    if (typeof onRejected === 'function') {
      callback.onRejected = onRejected
    }

    this.callbacks.push(callback)

    if (this.status === Status.FULFILLED) {
      this.handleFulfilled()
    }

    if (this.status === Status.REJECTED) {
      this.handleRejected()
    }

    return promise
  }

  private resolve(value: any) {
    if (this.status === Status.PENDING) {
      this.status = Status.FULFILLED
      this.value = value
      this.handleFulfilled()
    }
  }

  private reject(reason: any) {
    if (this.status === Status.PENDING) {
      this.status = Status.REJECTED
      this.reason = reason
      this.handleRejected()
    }
  }

  private handleFulfilled() {
    for (let { onFulfilled, reject, resolve } of this.callbacks) {
      setImmediate(() => {
        try {
          const ret = onFulfilled?.(this.value)
          resolve?.(ret)
        } catch (e) {
          reject?.(e)
        }
      })
    }

    this.callbacks = []
  }

  private handleRejected() {
    for (let { onRejected, reject, resolve } of this.callbacks) {
      setImmediate(() => {
        try {
          const ret = onRejected?.(this.value)
          resolve?.(ret)
        } catch (e) {
          reject?.(e)
        }
      })
    }

    this.callbacks = []
  }
}

export default PromiseAplus
