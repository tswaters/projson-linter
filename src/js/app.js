import { Parser } from './pretty'
import './about'
import './options-form'
import options from './options'
import { error, success, form, button } from '../styles/app.css'
import buttonToggle from './button-toggle'

import * as offline from 'offline-plugin/runtime'

offline.install({
  onUpdateReady() {
    offline.applyUpdate()
  },
  onUpdated() {
    window.location.reload()
  }
})

let clear = null
let parse = null
let code = null
let errorMessage = null

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('options').classList.add(form)
  document.getElementById('about').classList.add(form)

  buttonToggle.register('clear')
  buttonToggle.register('parse')

  clear = document.getElementById('clear')
  clear.classList.add(button)
  clear.addEventListener('click', clearCode)

  parse = document.getElementById('parse')
  parse.classList.add(button)
  parse.addEventListener('click', parseCode)

  errorMessage = document.getElementById('parse-error')

  code = document.getElementById('src')
  code.addEventListener('paste', cleanPaste)
  code.addEventListener('input', removeErrorMessage)
  code.addEventListener('click', removeErrorMessage)
  code.addEventListener('keydown', handleParseCode)
  code.addEventListener('keydown', handleInsertText)
  code.focus()
})

function scrollIntoView(element) {
  const elementRect = element.getBoundingClientRect()
  const absoluteElementTop = elementRect.top
  const middleDiff = elementRect.height / 2
  const scrollTopOfElement = absoluteElementTop + middleDiff
  const scrollY = scrollTopOfElement - window.innerHeight / 2
  window.scrollTo(0, scrollY)
}

function removeErrorMessage() {
  errorMessage.classList.remove(error)
}

function cleanPaste(e) {
  e.preventDefault()
  document.execCommand(
    'insertText',
    false,
    e.clipboardData.getData('text/plain')
  )
  parseCode()
}

function clearCode() {
  errorMessage.classList.remove(error)
  parse.classList.remove(error)
  parse.classList.remove(success)
  code.innerHTML = ''
}

function handleParseCode(e) {
  if (e.ctrlKey && (e.keyCode === 13 || e.keyCode === 10)) return parseCode()
}

function handleInsertText(e) {
  // this length-check tries to figure a simple key press
  // it is is probably not good long-term - may special keys in the future have 1-char lengths?
  if (e.key.length === 1 && !(e.ctrlKey || e.metaKey || e.altKey)) {
    e.preventDefault()
    document.execCommand('insertText', false, e.key)
  }
}

function parseCode() {
  parse.classList.remove(error)
  parse.classList.remove(success)
  errorMessage.classList.remove(error)

  let value = null
  let err = null

  try {
    const parsed = new Parser(code.innerText, options)
    parse.classList.add(success)
    value = parsed.stringified
  } catch (e) {
    err = e
    value = e.stringified
  }

  const sel = window.getSelection()
  const range = document.createRange()
  sel.removeAllRanges()
  range.selectNodeContents(code)
  sel.addRange(range)
  document.execCommand('insertText', false, value)

  if (err) {
    parse.classList.add(error)
    errorMessage.classList.add(error)
    errorMessage.innerHTML = ' '.repeat(err.pos) + '^--' + err.message
    errorMessage.style.top = `${15 * (err.line + 1) + 10}px`
    setTimeout(() => scrollIntoView(errorMessage), 0)
  }
}
