class Reader {
  constructor () {
    this.className = this.constructor.name
    this.render()
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
    $element.appendChild($published)
    $element.appendChild($summary)

    this.$element.appendChild($element)
  }

  async renderEntries () {
    let entries = await this.getEntries()
    entries.forEach(this.renderEntry.bind(this))
  }

  render () {
    this.$element = createElement({ className: this.className })

    this.renderEntries()

    document.body.appendChild(this.$element)
  }
}
