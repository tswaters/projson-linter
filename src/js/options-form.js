import options from './options'
import buttonToggle from './button-toggle'

window.addEventListener('DOMContentLoaded', () => {
  buttonToggle.register('options-button', 'options')

  const spaces = document.getElementById('tab-type[spaces]')
  spaces.checked = options.tabType === 'spaces'
  spaces.addEventListener('change', (e) => (options.tabType = e.target.value))

  const tabs = document.getElementById('tab-type[tabs]')
  tabs.checked = options.tabType === 'tabs'
  tabs.addEventListener('change', (e) => (options.tabType = e.target.value))

  const darkMode = document.getElementById('theme[dark]')
  darkMode.checked = options.theme === 'dark'
  darkMode.addEventListener('change', (e) => (options.theme = e.target.value))

  const lightMode = document.getElementById('theme[light]')
  lightMode.checked = options.theme === 'light'
  lightMode.addEventListener('change', (e) => (options.theme = e.target.value))

  const length = document.getElementById('length')
  length.value = options.length
  length.addEventListener('change', (e) => (options.length = e.target.value))
})
