class Preview {
  constructor (entries) {
    this.className = this.constructor.name
    this.entries = entries
    this.render()
  }

  show () {
    this.$element.classList.add('is-visible')
  }

  hide () {
    this.$element.classList.remove('is-visible')
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

    this.$element.appendChild($element)
  }

  renderEntries () {
    this.entries.forEach(this.renderEntry.bind(this))
  }

  render () {
    this.$element = createElement({ className: this.className })
    this.renderEntries()

    setTimeout(() => {
      this.$element.classList.add('is-visible')
    }, 100)

    document.body.appendChild(this.$element)
  }
}
