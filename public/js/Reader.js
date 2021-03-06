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

    this.$info = createElement({ className: 'Info'})
    this.$element.appendChild(this.$info)

    this.entries = entries

    if (entries.length === 0) {
      this.$info.innerHTML = `<div class="Info__content">Dear Reader, there aren't new articles to generate a book, enjoy your life.</div>`
      return
    }

    let date = this.getNextSaturday()

    this.authors = this.getAuthorsFromEntries()

    let authors = this.authors.map(author => author !== 'Unknown' && toTitleCase(author)).filter(Boolean)
    let names = toOxfordComma(authors)

    let amount = this.entries.length === 1 ? 'one article' : `a selection of ${this.entries.length} articles`

    if (!date) {
      this.$info.innerHTML = `<div class="Info__content">Dear Reader, your book was sent <strong>today</strong> with <strong>${amount}</strong> by ${names}.</div>`
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

    this.getEntries().then(this.onGetEntries.bind(this))

    this.$element.appendChild(this.spinner.$element)
    document.body.appendChild(this.$element)

    this.spinner.show()
  }
}
