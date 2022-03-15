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
  $form = createElement({ className: 'Form', autocomplete: 'off' })
  $title = createElement({ className: 'Form__title' })
  $buttons = createElement({ className: 'Form__actions' })
  $counter = createElement({ className: 'Form__pages' })

  $spinner = new Spinner('is-inside-button')

  setupFields()

  let $setup = document.body.querySelector('.js-setup')
  $setup.appendChild($form)
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
    storeFieldForPage(currentPage)
    currentPage -= 1
    renderForm()
  }
}

const storeFieldForPage = (page) => {
  steps[page].fields.forEach(options => {
    let input = document.getElementsByName(options.name)[0]
    if (input) {
      storage[options.name] = input.value
    }
  })
}

const setupNextButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Next', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    storeFieldForPage(currentPage)
    currentPage += 1

    renderForm()
  }
}

const setupSaveButton = () => {
  let defaultText = 'Generate .env file'
  let $button = createElement({ className: 'Button Button__save is-primary', text: defaultText, type: 'button' })

  $buttons.appendChild($button)
  $button.appendChild($spinner.$element)

  $button.onclick = () => {
    $spinner.show()
    post(ENDPOINTS.setup, storage).then((response) => {
      $spinner.hide()
      
      if (response.status === 200) {
        $button.innerHTML = 'Oh, wow, .env file generated!'
        setTimeout(() => {
          $button.innerHTML = defaultText
        }, 800)
      }
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
