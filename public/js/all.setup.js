const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

const DAYSOFWEEK = ['S','M','T','W','TH','F','SA']

const ENDPOINTS = {
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
  if (options && options.onkeydown) {
    $input.onkeydown = options.onkeydown
  }

  $field.appendChild($label)
  $field.appendChild($input)

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
let fields
let $form
let currentPage
let storage = {}

const onLoad = () => {
  currentPage = 0
  fields = { pages: [] }
  $form = createElement({ className: 'Form' })

  fields.pages[0] = []
  fields.pages[1] = []

  setupFields()

  renderForm()
  document.body.appendChild($form)
}

const renderForm = () => {
  $form.innerHTML = ''
  showFieldsInPage(currentPage)

  let $next = createElement({ className: 'Button', text: 'Next', type: 'button' })

  $form.appendChild($next)

  $next.onclick = () => {
    currentPage+=1
    showFieldsInPage(currentPage)
    renderForm()
  }
}

const setupFields = () => {
  let onkeydown = (e) => {
    storage[e.target.name] = e.target.value
  }
  fields.pages[0] = [
    { onkeydown, name: 'feedbinUsername', label: 'Username', className: 'Input', type: 'input' },
    { onkeydown, name: 'feedbinPassword', label: 'Password', className: 'Input', type: 'input' },
    { onkeydown, name: 'kindleEmail', label: 'Kindle email', className: 'Input', type: 'input' },
    { onkeydown, name: 'mailerService', label: 'MAILER_SERVICE', className: 'Input',  type: 'input', value: 'gmail' },
    { onkeydown, name: 'mailerEmail', label: 'MAILER_EMAIL', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpHostAddr', label: 'SMTP_HOST_ADDR', className: 'Input',  type: 'input', value: 'smtp.gmail.com' },
    { onkeydown, name: 'smtpHostPort', label: 'SMTP_HOST_PORT', className: 'Input',  type: 'input', value: 465 },
    { onkeydown, name: 'smtpUserName', label: 'SMTP_USER_NAME', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpUserPwd', label: 'SMTP_USER_PWD', className: 'Input',  type: 'input' }
  ]
}

const showFieldsInPage = (page) => {
  fields.pages[page].forEach(options => {
    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
