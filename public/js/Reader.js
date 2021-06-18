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
    let $content = createElement({ className: 'Entry__content', html: entry.content })
    let $date = createElement({ className: 'Entry__date', html: date })

    $element.appendChild($date)
    $element.appendChild($title)
    $element.appendChild($summary)
    $element.appendChild($content)

    this.$preview.appendChild($element)
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

  getNextSaturday () {
    let dayOfTheWeek = 6
    let date = new Date()

    let daysLeft = (7 + dayOfTheWeek - date.getDay()) % 7
    date.setDate(date.getDate() + daysLeft)

    if (daysLeft === 1) {
      return 'tomorrow'
    }

    return `on Saturday, ${MONTHS[date.getMonth()]} ${date.getDate()}`
  }

  renderAuthors () {
    return new Promise(async (resolve, reject) => {
      this.spinner.show()
      let authors = await this.getAuthors()
      this.spinner.hide()

      let date = this.getNextSaturday()
      let names = toOxfordComma(authors.map(author => toTitleCase(author)))

      this.$info.innerHTML = `<div class="Info__content">The next delivery is scheduled to be sent <strong>${date}</strong> with a selection of articles by ${names}.</div>`
      resolve(true)
    })
  }

  renderViewButton () {
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
    this.$preview = createElement({ className: 'Preview'})
    this.$element.appendChild(this.$preview)

    this.renderEntries()
  }

  renderGenerateButton () {
    this.$generateButton = createElement({ 
      type: 'button',
      className: 'Button is-primary',
      text: 'Send book',
      onclick: this.generateBook.bind(this)
    })

    this.$actions.appendChild(this.$generateButton)
  }

  generateBook () {
    this.spinner.show()
    return get(ENDPOINTS.generate).then((response) => {
      response.json().then((result) => {
        this.spinner.hide()
      })
    })
  }

  render () {
    this.$element = createElement({ className: this.className })

    this.$info = createElement({ className: 'Info'})
    this.$info.appendChild(this.spinner.$element)

    this.renderAuthors().then(() => {
      this.$actions = createElement({ className: 'Actions' })
      this.$info.appendChild(this.$actions)
      this.renderGenerateButton()
      this.renderViewButton()
    })

    this.$element.appendChild(this.$info)

    document.body.appendChild(this.$element)
  }
}
