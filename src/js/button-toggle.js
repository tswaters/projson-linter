import {
  showing as showButton,
  hiding as hideButton
} from '../styles/button.less'
import { showing as showForm, hiding as hideForm } from '../styles/app.less'

class ButtonToggle {
  constructor() {
    this.buttons = []
    this.src = document.getElementById('src')
    this.closeButtons = Array.from(
      document.getElementsByClassName('close-button')
    )
    this.closeButtons.forEach(button =>
      button.addEventListener('click', () => {
        this.toggleForm(false)
        this.toggleButtons(true)
      })
    )
  }

  register(id, element) {
    this.buttons.push({ id, element })
    if (element) {
      document.getElementById(id).addEventListener('click', () => {
        this.toggleForm(true, id)
        this.toggleButtons(false, id)
      })
    }
  }

  toggleForm(shouldShow, id) {
    if (!shouldShow) {
      document.body.classList.remove(hideForm)
      this.buttons.forEach(button => {
        button.element &&
          document.getElementById(button.element).classList.remove(showForm)
      })
    } else {
      document.body.classList.add(hideForm)
      const current = this.buttons.find(button => button.id === id)
      current.element &&
        document.getElementById(current.element).classList.add(showForm)
    }
  }

  toggleButtons(shouldShow) {
    const operation = shouldShow ? 'remove' : 'add'
    this.closeButtons.forEach(button => button.classList[operation](showButton))
    this.src.classList[operation](hideForm)
    this.buttons.forEach(button => {
      document.getElementById(button.id).classList[operation](hideButton)
    })
  }
}

export default new ButtonToggle()
