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

  getAuthors () {
    return get(ENDPOINTS.authors).then((response) => {
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

    let author = entry.author ? toTitleCase(entry.author) : 'Unknown'
    let title = `${entry.title } by ${author}`
    let $title = createElement({ className: 'Entry__title', html: title })
    let date = timeSince(new Date(entry.published))

    let $summary = createElement({ className: 'Entry__summary', html: entry.summary })
    let $date = createElement({ className: 'Entry__date', html: date })

    $element.appendChild($date)
    $element.appendChild($title)
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

  renderAuthors () {
    return new Promise(async (resolve, reject) => {

      this.spinner.show()
      let authors = await this.getAuthors()
      this.spinner.hide()

      let names = authors.map(author => toTitleCase(author)).join(', ')
      let html = `The next delivery is scheduled to be sent on XXX and will contain texts from ${names}.`
      let $element = createElement({ className: 'Info' , html })
      this.$element.appendChild($element)

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

    this.renderAuthors().then(() => {
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
