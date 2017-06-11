
import {showing} from '../styles/about.less'

let aboutContainer = null
let aboutButton = null
let aboutShowing = false

window.addEventListener('DOMContentLoaded', () => {

  aboutContainer = document.getElementById('about')

  aboutButton = document.getElementById('about-button')
  aboutButton.addEventListener('click', toggleAbout)

})

function toggleAbout () {
  aboutShowing = !aboutShowing
  if (aboutShowing) {
    aboutButton.innerHTML = 'Close'
    aboutContainer.classList.add(showing)
  } else {
    aboutButton.innerHTML = 'About'
    aboutContainer.classList.remove(showing)
  }
}
