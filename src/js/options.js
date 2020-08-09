import { darkMode, lightMode } from '../styles/app.css'

const length = Symbol('length')
const tabType = Symbol('tab-type')
const theme = Symbol('theme')

const updateTheme = (theme) => {
  const bodyClass = theme === 'dark' ? darkMode : lightMode
  document.body.classList.remove(darkMode, lightMode)
  document.body.classList.add(bodyClass)
}

class Options {
  constructor() {
    this[length] = window.localStorage.getItem('length') || 4
    this[tabType] = window.localStorage.getItem('tab-type') || 'spaces'
    this[theme] =
      window.localStorage.getItem('theme') ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light')
    updateTheme(this[theme])
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

  get theme() {
    return this[theme]
  }

  set theme(value) {
    window.localStorage.setItem('theme', value)
    updateTheme(value)
    this[theme] = value
  }
}

export default new Options()
