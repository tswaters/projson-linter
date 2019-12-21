import { showing, hiding, button, closeButton } from '../styles/app.css'

class ButtonToggle {
  constructor() {
    this.buttons = []
    this.src = document.getElementById('src')
    this.closeButtons = Array.from(
      document.getElementsByClassName('close-button')
    )
    this.closeButtons.forEach(item => {
      item.classList.add(button, closeButton)
      item.addEventListener('click', () => {
        this.toggleForm(false)
        this.toggleButtons(true)
      })
    })
  }

  register(id, element) {
    this.buttons.push({ id, element })
    if (element) {
      const elem = document.getElementById(id)
      elem.classList.add(button)
      elem.addEventListener('click', () => {
        this.toggleForm(true, id)
        this.toggleButtons(false, id)
      })
    }
  }

  toggleForm(shouldShow, id) {
    if (!shouldShow) {
      document.body.classList.remove(hiding)
      this.buttons.forEach(button => {
        button.element &&
          document.getElementById(button.element).classList.remove(showing)
      })
    } else {
      document.body.classList.add(hiding)
      const current = this.buttons.find(button => button.id === id)
      current.element &&
        document.getElementById(current.element).classList.add(showing)
    }
  }

  toggleButtons(shouldShow) {
    const operation = shouldShow ? 'remove' : 'add'
    this.closeButtons.forEach(button => button.classList[operation](showing))
    this.src.classList[operation](hiding)
    this.buttons.forEach(button => {
      document.getElementById(button.id).classList[operation](hiding)
    })
  }
}

export default new ButtonToggle()
