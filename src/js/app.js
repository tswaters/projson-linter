import { Parser } from './pretty'
import './about'
import './options-form'
import options from './options'
import { error as parseError } from '../styles/app.less'
import { error, success } from '../styles/button.less'
import buttonToggle from './button-toggle'

let clear = null
let parse = null
let code = null
let errorMessage = null
let position = null

window.addEventListener('DOMContentLoaded', () => {
  buttonToggle.register('clear')
  buttonToggle.register('parse')

  clear = document.getElementById('clear')
  clear.addEventListener('click', clearCode)

  parse = document.getElementById('parse')
  parse.addEventListener('click', parseCode)

  errorMessage = document.getElementById('parse-error')

  code = document.getElementById('src')
  code.addEventListener('paste', cleanPaste)
  code.addEventListener('input', removeErrorMessage)
  code.addEventListener('click', removeErrorMessage)
  code.addEventListener('keypress', keyPress)
  code.addEventListener('mousedown', saveCursorPosition)
  code.addEventListener('mouseup', saveCursorPosition)
  code.addEventListener('keydown', saveCursorPosition)
  code.addEventListener('keyup', saveCursorPosition)
  code.focus()
})

function saveCursorPosition() {
  const sel = window.getSelection()
  if (sel.rangeCount) {
    const range = sel.getRangeAt(0)
    position = range.startOffset
  }
}

function scrollIntoView(element) {
  const elementRect = element.getBoundingClientRect()
  const absoluteElementTop = elementRect.top
  const middleDiff = elementRect.height / 2
  const scrollTopOfElement = absoluteElementTop + middleDiff
  const scrollY = scrollTopOfElement - window.innerHeight / 2
  window.scrollTo(0, scrollY)
}

function removeErrorMessage() {
  errorMessage.classList.remove(parseError)
}

function cleanPaste(e) {
  e.preventDefault()
  saveCursorPosition()
  document.execCommand(
    'insertText',
    false,
    e.clipboardData.getData('text/plain')
  )
  parseCode()
}

function clearCode() {
  errorMessage.classList.remove(parseError)
  parse.classList.remove(error)
  parse.classList.remove(success)
  code.innerHTML = ''
}

function keyPress(e) {
  e.ctrlKey && (e.keyCode === 13 || e.keyCode === 10) && parseCode()
}

function parseCode() {
  parse.classList.remove(error)
  parse.classList.remove(success)
  errorMessage.classList.remove(parseError)

  let value = null

  try {
    const parsed = new Parser(code.innerText, options)
    parse.classList.add(success)
    value = parsed.stringified
  } catch (e) {
    value = e.stringified
    parse.classList.add(error)
    errorMessage.classList.add(parseError)
    errorMessage.innerHTML = ' '.repeat(e.pos) + '^--' + e.message
    errorMessage.style.top = `${15 * (e.line + 1) + 10}px`
    setTimeout(() => scrollIntoView(errorMessage), 0)
  }

  code.textContent = value

  // restore cursor position if we found one
  if (position != null) {
    const sel = window.getSelection()
    const range = document.createRange()
    range.setStart(code.firstChild, position)
    sel.removeAllRanges()
    sel.addRange(range)
  }
}
