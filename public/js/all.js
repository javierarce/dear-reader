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
class Preview {
  constructor (entries) {
    this.className = this.constructor.name
    this.entries = entries
    this.currentPage = 0
    this.pages = []
    this.render()
  }

  show () {
    this.$element.classList.add('is-visible')
  }

  hide () {
    this.$element.classList.remove('is-visible')
  }

  renderEntry (entry, index) {
    let $element = createElement({ className: 'Entry' })

    let author = entry.author ? toTitleCase(entry.author) : 'Unknown'
    let title = `${entry.title } <span>by</span> ${author}`
    let $title = createElement({ className: 'Entry__title', html: title })
    let date = timeSince(new Date(entry.published))

    let $summary = createElement({ className: 'Entry__summary', html: entry.summary })
    let $content = createElement({ className: 'Entry__content', html: entry.content })
    let $date = createElement({ className: 'Entry__date', html: date })

    $element.id = index
    $element.appendChild($date)
    $element.appendChild($title)
    $element.appendChild($summary)
    $element.appendChild($content)

    this.$entries.appendChild($element)
    this.pages.push($element)
  }

  renderEntries () {
    this.$entries = createElement({ className: 'Entries' })
    this.$element.appendChild(this.$entries)

    this.entries.forEach(this.renderEntry.bind(this))
  }

  renderPagination () {
    this.$pagination = createElement({ className: 'Pagination' })

    this.pages.forEach((page, index) => {
      let $item = createElement({ type: 'button', className: 'Pagination__item' })
      $item.id = index

      if (!index) {
        $item.classList.add('is-selected')
        this.currentPaginationItem = $item
      }

      $item.onclick = (event) => {
        let $element = event.target
        this.pages[this.currentPage].classList.remove('is-visible')
        this.currentPage = $element.id
        this.pages[this.currentPage].classList.add('is-visible')
        this.currentPaginationItem.classList.remove('is-selected')

        $element.classList.add('is-selected')
        this.currentPaginationItem = $element
      }

      $item.innerHTML = index + 1
      this.$pagination.appendChild($item)
    })

    this.$element.appendChild(this.$pagination)
  }

  render () {
    this.$element = createElement({ className: this.className })

    this.renderEntries()
    this.renderPagination()

    this.pages[0].classList.add('is-visible')

    setTimeout(() => {
      this.$element.classList.add('is-visible')
    }, 100)

    document.body.appendChild(this.$element)
  }
}
class Reader {
  constructor () {
    this.className = this.constructor.name
    this.spinner = new Spinner()

    this.bind()
    this.render()
  }

  killEvent (event) {
    if (event) {
      event.preventDefault()
      event.stopPropagation()
    }
  }

  bind () {
    document.addEventListener('keydown', this.onKeyDown.bind(this))
  }

  onKeyDown (event) {
    if (event.code === 'Space') {
    } else if (event.code === 'ArrowRight') {
    } else if (event.code === 'ArrowLeft') {
    } else if (event.code === 'ArrowDown') {
    } else if (event.code === 'ArrowUp') {
    } else if (event.metaKey && event.code === 'KeyA') {
    } else if (event.code === 'Escape') {
      this.preview.hide()
    }
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

  getNextSaturday () {
    let dayOfTheWeek = 6
    let date = new Date()

    let daysLeft = (7 + dayOfTheWeek - date.getDay()) % 7
    date.setDate(date.getDate() + daysLeft)

    if (daysLeft === 0) {
      return false
    } else if (daysLeft === 1) {
      return 'tomorrow'
    }

    return `on Saturday, ${MONTHS[date.getMonth()]} ${date.getDate()}`
  }

  renderPreviewButton () {
    this.$viewButton = createElement({ 
      type: 'button',
      className: 'Button is-secondary',
      text: 'Read preview',
      onclick: () => {
        this.showPreview()
      }
    })

    this.$actions.appendChild(this.$viewButton)
  }

  showPreview () {
    if (!this.preview) {
      this.preview = new Preview(this.entries)
    } else {
      this.preview.show()
    }
  }

  renderGenerateButton () {
    this.$generateButton = createElement({ 
      type: 'button',
      className: 'Button is-primary',
      onclick: this.generateBook.bind(this)
    })

    this.$generateButtonTitle = createElement({ 
      type: 'span',
      text: 'Send book',
      className: 'Button__title'
    })

    this.generateSpinner = new Spinner('is-inside-button')
    this.$generateButton.appendChild(this.$generateButtonTitle)
    this.$generateButton.appendChild(this.generateSpinner.$element)

    this.$actions.appendChild(this.$generateButton)
  }

  generateBook (element) {
    this.generateSpinner.show()
    this.$generateButtonTitle.innerText = 'Sending book'

    return get(ENDPOINTS.generate).then((response) => {
      response.json().then((result) => {
        this.generateSpinner.hide()

        if (result && result.error) {
          this.$generateButtonTitle.innerText = 'Error sending :('
          return
        }

        this.$generateButtonTitle.innerText = 'Send book'
      })
    })
  }

  getAuthorsFromEntries () {
    return [...new Set(this.entries.map(entry => entry.author))].filter(e => e)
  }

  onGetEntries (entries) {
    this.spinner.hide()

    this.entries = entries

    if (entries.length === 0) {
      this.$info.innerHTML = `<div class="Info__content">There aren't articles to generate a book, enjoy your life.</div>`
      return
    }

    let date = this.getNextSaturday()

    this.authors = this.getAuthorsFromEntries()
    let names = toOxfordComma(this.authors.map(author => toTitleCase(author)))

    let amount = this.entries.length === 1 ? 'one article' : `a selection of ${this.entries.length} articles`

    if (!date) {
      this.$info.innerHTML = `<div class="Info__content">Your book was sent <strong>today</strong> with <strong>${amount}</strong> by ${names}. Happy reading!</div>`
    } else {
      this.$info.innerHTML = `<div class="Info__content">Dear Reader, the next delivery is scheduled to be sent <strong>${date}</strong> with <strong>${amount}</strong> by ${names}.</div>`
    }

    this.renderActions()
  }

  renderActions () {
    this.$actions = createElement({ className: 'Actions' })
    this.$info.appendChild(this.$actions)

    this.renderGenerateButton()
    this.renderPreviewButton()
  }

  render () {
    this.$element = createElement({ className: this.className })

    this.$info = createElement({ className: 'Info'})
    this.$info.appendChild(this.spinner.$element)

    this.spinner.show()
    this.getEntries().then(this.onGetEntries.bind(this))

    this.$element.appendChild(this.$info)
    document.body.appendChild(this.$element)
  }
}
const onLoad = () => {
  const reader = new Reader()
}

window.onload = onLoad
