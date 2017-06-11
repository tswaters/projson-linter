
import jsonParse from './parser'
import './about'
import {
  showing,
  finished,
  error,
  success
} from '../styles/app.less'


let clear = null
let parse = null
let code = null
let errorMessage = null

window.addEventListener('DOMContentLoaded', () => {

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

function removeErrorMessage () {
  errorMessage.classList.remove(error)
}

function cleanPaste (e) {
  e.preventDefault();
  var text = e.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, text);
}

function clearCode () {
  errorMessage.classList.remove(error)
  parse.classList.remove(error)
  parse.classList.remove(success)
  code.innerHTML = ''
}

function keyPress (e) {
  e.ctrlKey && e.keyCode === 13 && parseCode()
}

function parseCode (e) {
  parse.classList.remove(error)
  parse.classList.remove(success)
  errorMessage.classList.remove(error)

  let value = code.innerText
  let err = null
  let obj = null

  try {
    obj = jsonParse(value)
    value = JSON.stringify(obj, null, 4)
    parse.classList.add(success)
    code.innerHTML = value
  } catch (e) {
    parse.classList.add(error)
    errorMessage.classList.add(error)
    errorMessage.innerHTML = " ".repeat(e.pos) + "^--" + e.message
    errorMessage.style.top = `${15 * (e.line + 1) + 10}px`
    errorMessage.scrollIntoView()
  }
}
