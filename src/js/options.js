const length = Symbol('length')
const tabType = Symbol('tab-type')

class Options {
  constructor() {
    this[length] = window.localStorage.getItem('length') || 4
    this[tabType] = window.localStorage.getItem('tab-type') || 'spaces'
  }

  get length() {
    return this[length]
  }

  set length(value) {
    window.localStorage.setItem('length', value)
    this[length] = value
  }

  get tabType() {
    return this[tabType]
  }

  set tabType(value) {
    window.localStorage.setItem('tab-type', value)
    this[tabType] = value
  }
}

export default new Options()
