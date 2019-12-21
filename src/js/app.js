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
  errorMessage.classList.remove(parseError)
}

function cleanPaste(e) {
  e.preventDefault()
  var text = e.clipboardData.getData('text/plain')
  document.execCommand('insertText', false, text)
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

  let value = code.innerText

  try {
    const parsed = new Parser(value, options)
    parse.classList.add(success)
    code.textContent = parsed.stringified
  } catch (e) {
    code.textContent = e.stringified
    parse.classList.add(error)
    errorMessage.classList.add(parseError)
    errorMessage.innerHTML = ' '.repeat(e.pos) + '^--' + e.message
    errorMessage.style.top = `${15 * (e.line + 1) + 10}px`
    setTimeout(() => scrollIntoView(errorMessage), 0)
  }
}
