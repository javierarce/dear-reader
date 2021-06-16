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
