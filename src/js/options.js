
const length = Symbol('length')
const tabType = Symbol('tab-type')
const copyAsCrlf = Symbol('copy-as-crlf')

class Options {

  constructor () {
    this[copyAsCrlf] = window.localStorage.getItem('copy-as-crlf') || 'false'
    this[length] = window.localStorage.getItem('length') || 4
    this[tabType] = window.localStorage.getItem('tab-type') || 'spaces'
  }

  get copyAsCrLf () {
    return this[copyAsCrlf] === 'true'
  }

  set copyAsCrLf (value) {
    this[copyAsCrlf] = "" + value
    window.localStorage.setItem('copy-as-crlf', value)
  }

  get length () {
    return this[length]
  }

  set length (value) {
    window.localStorage.setItem('length', value)
    this[length] = value
  }

  get tabType () {
    return this[tabType] 
  }
  
  set tabType (value) { 
    window.localStorage.setItem('tab-type', value)
    this[tabType] = value
  }

}

export default new Options()
