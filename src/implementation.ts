enum Status {
  PENDING,
  FULFILLED,
  REJECTED,
}

class PromiseAplus {
  status: Status = Status.PENDING
  value: any
  reason: any

  private onFulfilledCallbacks: Function[] = []
  private onRejectedCallbacks: Function[] = []

  constructor(
    executor: (
      resolve: (value: any) => void,
      reject: (value: any) => void
    ) => void
  ) {
    executor(this.resolve.bind(this), this.reject.bind(this))
  }

  then(onFulfilled?: Function, onRejected?: Function) {
    if (typeof onFulfilled === 'function') {
      this.onFulfilledCallbacks.push(onFulfilled)
    }

    if (typeof onRejected === 'function') {
      this.onRejectedCallbacks.push(onRejected)
    }

    if (this.status === Status.FULFILLED) {
      this.handleFulfilled()
    }

    if (this.status === Status.REJECTED) {
      this.handleRejected()
    }

    return this
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
    this.onFulfilledCallbacks.forEach((callback) => {
      setImmediate(() => {
        callback(this.value)
      })
    })
    this.onFulfilledCallbacks = []
  }

  private handleRejected() {
    this.onRejectedCallbacks.forEach((callback) => {
      setImmediate(() => {
        callback(this.reason)
      })
    })
    this.onRejectedCallbacks = []
  }
}

export default PromiseAplus
