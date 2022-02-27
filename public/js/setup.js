let steps
let $form
let $spinner
let currentPage
let storage = {}

let onkeyup = (e) => {
  storage[e.target.name] = e.target.value
}

const EVENTS = {
  onkeyup
}

const onLoad = () => {
  currentPage = 0
  $form = createElement({ className: 'Form' })
  $title = createElement({ className: 'Form__title' })
  $buttons = createElement({ className: 'Form__actions' })
  $counter = createElement({ className: 'Form__pages' })

  $spinner = new Spinner('is-inside-button')

  setupFields()

  document.body.appendChild($form)
}

const renderForm = () => {
  let page = steps[currentPage]
  $form.innerHTML = ''
  $buttons.innerHTML = ''
  $counter.innerHTML = `${currentPage + 1}/${steps.length}`

  $title.innerText = page.title

  $form.appendChild($title)
  $title.appendChild($counter)

  if (page && page.description) {
    let $description = createElement({ className: 'Form__description', html: page.description })
    $form.appendChild($description)
  }

  showFieldsInPage(currentPage)

  if (steps.length) {
    let showPrevButton = currentPage > 0
    setupPrevButton(showPrevButton)

    let showNextButton = currentPage < steps.length - 1 
    setupNextButton(showNextButton)

    if (currentPage == steps.length - 1) {
      setupSaveButton()
    }
  }

  $form.appendChild($buttons)
}

const setupPrevButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Prev', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage -= 1
    renderForm()
  }
}

const setupNextButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Next', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage += 1
    renderForm()
  }
}

const setupSaveButton = () => {
  let $button = createElement({ className: 'Button Button__save is-primary', text: 'Generate .env file', type: 'button' })

  $buttons.appendChild($button)
  $button.appendChild($spinner.$element)

  $button.onclick = () => {
    $spinner.show()
    post(ENDPOINTS.setup, storage).then((response) => {
    $spinner.hide()
      return response.json()
    })
  }
}

const getSteps = () => {
  return get(ENDPOINTS.steps).then((response) => {
    return response.json()
  })
}

const setupFields = () => {

  getSteps().then((result) => {
    steps = result.steps
    
    renderForm()
  })

}

const showFieldsInPage = (page) => {
  steps[page].fields.forEach(options => {

    if (storage[options.name]) {
      options.value = storage[options.name]
    }

    options.eventName = options.event
    options.event = EVENTS[options.event]

    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
