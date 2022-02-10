let fields
let $form
let currentPage
let storage = {}

const onLoad = () => {
  currentPage = 0
  fields = { pages: [] }
  $form = createElement({ className: 'Form' })
  $buttons = createElement({ className: 'Form__actions' })

  setupFields()

  renderForm()
  document.body.appendChild($form)
}

const renderForm = () => {
  $form.innerHTML = ''
  $buttons.innerHTML = ''

  showFieldsInPage(currentPage)

  if (fields.pages.length) {
    if (currentPage >= fields.pages.length - 1) {
      setupPrevButton()
    }

    if (currentPage < fields.pages.length - 1) {
      setupNextButton()
    }

    if (currentPage == fields.pages.length - 1) {
      setupSaveButton()
    }
  }

  $form.appendChild($buttons)
}

const setupPrevButton = () => {
  let $button = createElement({ className: 'Button', text: 'Prev', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage -= 1
    showFieldsInPage(currentPage)
    renderForm()
  }
}

const setupNextButton = () => {
  let $button = createElement({ className: 'Button', text: 'Next', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage += 1
    showFieldsInPage(currentPage)
    renderForm()
  }
}

const setupSaveButton = () => {
  let $button = createElement({ className: 'Button', text: 'Save', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    post(ENDPOINTS.setup, storage).then((response) => {
      return response.json()
    })
  }
}

const setupFields = () => {
  let onkeyup = (e) => {
    storage[e.target.name] = e.target.value
  }

  fields.pages[0] = [
    { onkeyup, name: 'FEEDBIN_USERNAME', label: 'Username', className: 'Input', type: 'input' },
    { onkeyup, name: 'FEEDBIN_PASSWORD', label: 'Password', className: 'Input', type: 'input' },
    { onkeyup, name: 'KINDLE_EMAIL', label: 'Kindle email', className: 'Input', type: 'input' }
  ]

  fields.pages[1] = [
    { onkeyup, name: 'MAILER_SERVICE', label: 'MAILER_SERVICE', className: 'Input',  type: 'input', value: 'gmail' },
    { onkeyup, name: 'MAILER_EMAIL', label: 'MAILER_EMAIL', className: 'Input',  type: 'input' },
    { onkeyup, name: 'SMTP_HOST_ADDR', label: 'SMTP_HOST_ADDR', className: 'Input',  type: 'input', value: 'smtp.gmail.com' },
    { onkeyup, name: 'SMTP_HOST_PORT', label: 'SMTP_HOST_PORT', className: 'Input',  type: 'input', value: 465 },
    { onkeyup, name: 'SMTP_USER_NAME', label: 'SMTP_USER_NAME', className: 'Input',  type: 'input' },
    { onkeyup, name: 'SMTP_USER_PWD', label: 'SMTP_USER_PWD', className: 'Input',  type: 'input' }
  ]

  fields.pages.forEach(page => {
    page.forEach(options => {
      if (options.value)  {
        storage[options.name] = options.value
      }
    })
  })
}

const showFieldsInPage = (page) => {
  fields.pages[page].forEach(options => {

    if (storage[options.name]) {
      options.value = storage[options.name]
    }

    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
