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
    let title = `${entry.title } by ${author}`
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

      $item.innerHTML = index
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
