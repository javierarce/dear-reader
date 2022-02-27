const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const DAYSOFWEEK = ['S','M','T','W','TH','F','SA']

const ENDPOINTS = {
  setup: '/api/setup',
  steps: '/api/steps',
  entries: '/api/entries',
  authors: '/api/authors',
  generate: '/api/generate',
  weather: '/api/weather'
}

const killEvent = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

const addClass = (elementClass, className) => {
  let $element = getElement(`.${elementClass}`)

  if ($element) {
    $element.classList.add(className)
  }
}

const getRandomItem = (items) => {
  return items[Math.floor(Math.random()*items.length)]
}

const getElements = (selector) => {
  return document.querySelectorAll(selector)
}

const getElement = (selector) => {
  return document.querySelector(selector)
}
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

const createInputField  = ({ label, value, className, type = 'div', ...options }) => {

  if (type === 'text') {
    let $field = createElement({ className: 'Form__description', text: options.text, type: 'p' })
    return $field
  }

  if (label) {
    label = label.split('_').join(' ')
  }

  let $field = createElement({ className: 'InputField', type: 'div' })
  let $label = createElement({ className: 'InputField__label', text: label, type: 'label' })
  let $input = createElement({ className: 'InputField__input', type, value, options })

  $input.type = 'text'

  if (options && options.name) {
    $input.name = options.name
  }

  if (options && options.event && options.eventName) {
    $input[options.eventName] = options.event
  }

  $field.appendChild($label)
  $field.appendChild($input)

  if (options && options.help) {
    let $help = createElement({ className: 'InputField__help', html: options.help })
    $field.appendChild($help)
  }


  return $field
}

const createElement = ({ className, html, text, type = 'div', ...options }) => {
  let $el = document.createElement(type)

  if (html) {
    $el.innerHTML = html
  } else if (text) {
    $el.innerText = text
  }

  className.split(' ').filter(c => c).forEach(name => $el.classList.add(name))

  if (!isEmpty(options)) {
    Object.keys(options).forEach((key) => {
      if (options[key]) {
        $el[key] = options[key] 
      }
    })
  }

  return $el
}

const get = (URL) => {
  const headers = { 'Content-Type': 'application/json' }
  const method = 'GET'
  const options = { method, headers }

  return fetch(URL, options)
}

const post = (URL, content) => {
  const headers = { 'Content-Type': 'application/json' }
  const method = 'POST'
  const body = JSON.stringify(content)
  const options = { method, headers, body }

  return fetch(URL, options)
}

const toTitleCase = (str) => {
  return str.replace(
    /\w\S*/g,
    function(txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    }
  )
}

const timeSince  = (date) => {
  let seconds = Math.floor((new Date() - date) / 1000)

  let interval = seconds / 31536000

  if (interval > 1) {
    let amount = Math.floor(interval)
    let unit = amount === 1 ? 'year' : 'years'
    return `${amount} ${unit} ago`
  }

  interval = seconds / 2592000

  if (interval > 1) {
    let amount = Math.floor(interval)
    let unit = amount === 1 ? 'month' : 'months'
    return `${amount} ${unit} ago`
  }

  interval = seconds / 86400

  if (interval > 1) {
    let amount = Math.floor(interval)
    let unit = amount === 1 ? 'day' : 'days'
    return `${amount} ${unit} ago`
  }

  interval = seconds / 3600

  if (interval > 1) {
    let amount = Math.floor(interval)
    let unit = amount === 1 ? 'hour' : 'hours'
    return `${amount} ${unit} ago`
  }

  interval = seconds / 60

  if (interval > 1) {
    let amount = Math.floor(interval)
    let unit = amount === 1 ? 'minute' : 'minutes'
    return `${amount} ${unit} ago`
  }

  let amount = Math.floor(seconds)
  let unit = amount === 1 ? 'second' : 'seconds'
  return `${amount} ${unit} ago`
}

const toOxfordComma = (array) =>  {
  return array.length >= 2 ? array .slice(0, array.length - 1) .concat(`and ${array.slice(-1)}`) .join(', ') : array.join(', ')
}
class Spinner {
  constructor (className = '') {
    this.className = `${this.constructor.name} ${className}`
    this.visible = false
    this.render()
  }

  show () {
    this.visible = true
    this.render()
  }

  hide () {
    this.visible = false
    this.render()
  }

  render () {
    if (!this.$element) {
      this.$element = createElement({ className: this.className })
    }

    this.$element.classList.toggle('is-visible', this.visible)

    return this.$element
  }
}
let steps
let $form
let $spinner
let currentPage
let storage = {}

let onkeyup = (e) => {
  storage[e.target.name] = e.target.value
}

const EVENTS = {
  onkeyup
}

const onLoad = () => {
  currentPage = 0
  $form = createElement({ className: 'Form' })
  $title = createElement({ className: 'Form__title' })
  $buttons = createElement({ className: 'Form__actions' })
  $counter = createElement({ className: 'Form__pages' })

  $spinner = new Spinner('is-inside-button')

  setupFields()

  document.body.appendChild($form)
}

const renderForm = () => {
  let page = steps[currentPage]
  $form.innerHTML = ''
  $buttons.innerHTML = ''
  $counter.innerHTML = `${currentPage + 1}/${steps.length}`

  $title.innerText = page.title

  $form.appendChild($title)
  $title.appendChild($counter)

  if (page && page.description) {
    let $description = createElement({ className: 'Form__description', html: page.description })
    $form.appendChild($description)
  }

  showFieldsInPage(currentPage)

  if (steps.length) {
    let showPrevButton = currentPage > 0
    setupPrevButton(showPrevButton)

    let showNextButton = currentPage < steps.length - 1 
    setupNextButton(showNextButton)

    if (currentPage == steps.length - 1) {
      setupSaveButton()
    }
  }

  $form.appendChild($buttons)
}

const setupPrevButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Prev', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage -= 1
    renderForm()
  }
}

const setupNextButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Next', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage += 1
    renderForm()
  }
}

const setupSaveButton = () => {
  let $button = createElement({ className: 'Button Button__save is-primary', text: 'Generate .env file', type: 'button' })

  $buttons.appendChild($button)
  $button.appendChild($spinner.$element)

  $button.onclick = () => {
    $spinner.show()
    post(ENDPOINTS.setup, storage).then((response) => {
    $spinner.hide()
      return response.json()
    })
  }
}

const getSteps = () => {
  return get(ENDPOINTS.steps).then((response) => {
    return response.json()
  })
}

const setupFields = () => {

  getSteps().then((result) => {
    steps = result.steps
    
    renderForm()
  })

}

const showFieldsInPage = (page) => {
  steps[page].fields.forEach(options => {

    if (storage[options.name]) {
      options.value = storage[options.name]
    }

    options.eventName = options.event
    options.event = EVENTS[options.event]

    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
