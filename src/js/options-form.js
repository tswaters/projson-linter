import options from './options'
import buttonToggle from './button-toggle'

window.addEventListener('DOMContentLoaded', () => {
  buttonToggle.register('options-button', 'options')

  const spaces = document.getElementById('tab-type[spaces]')
  spaces.checked = options.tabType === 'spaces'
  spaces.addEventListener('change', e => (options.tabType = e.target.value))

  const tabs = document.getElementById('tab-type[tabs]')
  tabs.checked = options.tabType === 'tabs'
  tabs.addEventListener('change', e => (options.tabType = e.target.value))

  const length = document.getElementById('length')
  length.value = options.length
  length.addEventListener('change', e => (options.length = e.target.value))
})
