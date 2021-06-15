const ENDPOINTS = {
  entries: '/api/entries',
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

const createElement = ({ className, html, text, type = 'div', ...options }) => {
  let $el = document.createElement(type)

  if (html) {
    $el.innerHTML = html
  } else if (text) {
    $el.innerText = text
  }

  $el.classList.add(className)

  if (!isEmpty(options)) {
    Object.keys(options).forEach((key) => {
      $el[key] = options[key]
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
class Spinner {
  constructor () {
    this.className = this.constructor.name
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
class Reader {
  constructor () {
    this.className = this.constructor.name

    this.spinner = new Spinner()
    this.render()
  }

  getWeather () {
    return get(ENDPOINTS.weather).then((response) => {
      return response.json()
    })
  }

  getEntries () {
    return get(ENDPOINTS.entries).then((response) => {
      return response.json()
    })
  }

  renderEntry (entry) {
    let $element = createElement({ className: 'Entry' })

    let $title = createElement({ className: 'Entry__title', html: entry.title })
    let $summary = createElement({ className: 'Entry__summary', html: entry.summary })
    let $date = createElement({ className: 'Entry__date', html: entry.published })

    $element.appendChild($title)
    $element.appendChild($date)
    $element.appendChild($summary)

    this.$element.appendChild($element)
  }

  renderEntries () {
    return new Promise(async (resolve, reject) => {

      this.spinner.show()

      let entries = await this.getEntries()
      entries.forEach(this.renderEntry.bind(this))

      this.spinner.hide()
      resolve(true)
    })
  }

  renderGenerateButton () {
    this.$generateButton = createElement({ 
      type: 'button',
      className: 'Button',
      text: 'Generate',
      onclick: this.generateBook.bind(this)
    })

    this.$element.appendChild(this.$generateButton)
  }

  generateBook () {
    this.spinner.show()
    return get(ENDPOINTS.generate).then((response) => {
      response.json().then((result) => {
        console.log(result)
        this.spinner.hide()
      })
    })
  }

  render () {
    this.$element = createElement({ className: this.className })

    this.$element.appendChild(this.spinner.$element)

    this.renderEntries().then(() => {
      this.renderGenerateButton()
    })

    this.getWeather().then((response) => {
      console.log(response)
    })

    document.body.appendChild(this.$element)
  }
}
const onLoad = () => {
  const reader = new Reader()
}

window.onload = onLoad
