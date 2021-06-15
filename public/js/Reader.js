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
    let $element = document.createElement('div')
    $element.classList.add('Entry')
    $element.innerHTML = entry.title
    this.$element.appendChild($element)
  }

  async render () {
    this.$element = document.createElement('div')
    this.$element.classList.add(this.className)

    let entries = await this.getEntries()
    entries.forEach(this.renderEntry.bind(this))

    document.body.appendChild(this.$element)
  }
}
