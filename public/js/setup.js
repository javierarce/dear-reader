let fields
let $form
let $spinner
let currentPage
let storage = {}

const onLoad = () => {
  currentPage = 0
  fields = { pages: [] }
  $form = createElement({ className: 'Form' })
  $title = createElement({ className: 'Form__title' })
  $buttons = createElement({ className: 'Form__actions' })
  $counter = createElement({ className: 'Form__pages' })

  $spinner = new Spinner('is-inside-button')

  setupFields()
  renderForm()

  document.body.appendChild($form)
}

const renderForm = () => {
  $form.innerHTML = ''
  $buttons.innerHTML = ''
  $counter.innerHTML = `${currentPage + 1}/${fields.pages.length}`

  $title.innerText = fields.pages[currentPage].title

  $form.appendChild($title)
  $title.appendChild($counter)

  showFieldsInPage(currentPage)

  if (fields.pages.length) {
    let showPrevButton = currentPage > 0
    setupPrevButton(showPrevButton)

    let showNextButton = currentPage < fields.pages.length - 1 
    setupNextButton(showNextButton)

    if (currentPage == fields.pages.length - 1) {
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
    showFieldsInPage(currentPage)
    renderForm()
  }
}

const setupNextButton = (show) => {
  let $button = createElement({ className: `Button${show ? '': ' is-hidden'}`, text: 'Next', type: 'button' })

  $buttons.appendChild($button)

  $button.onclick = () => {
    currentPage += 1
    showFieldsInPage(currentPage)
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

const setupFields = () => {
  let onkeyup = (e) => {
    storage[e.target.name] = e.target.value
  }

  fields.pages[0] = { title: 'Feedbin', fields: [
    { onkeyup, name: 'FEEDBIN_USERNAME', label: 'FEEDBIN_USERNAME', className: 'Input', type: 'input' },
    { onkeyup, name: 'FEEDBIN_PASSWORD', label: 'FEEDBIN_PASSWORD', className: 'Input', type: 'input' },
    { onkeyup, name: 'FEEDBIN_TAGNAME', label: 'FEEDBIN_TAGNAME', className: 'Input', type: 'input', value: 'Newsletters'}
  ]}

  fields.pages[1] = { title: 'Kindle', fields: [
    { onkeyup, name: 'KINDLE_EMAIL', label: 'KINDLE_EMAIL', className: 'Input', type: 'input' }
  ]}

  fields.pages[2] = { title: 'Email', fields: [
    { onkeyup, name: 'MAILER_SERVICE', label: 'MAILER_SERVICE', className: 'Input',  type: 'input', value: 'gmail' },
    { onkeyup, name: 'MAILER_EMAIL', label: 'MAILER_EMAIL', className: 'Input',  type: 'input' },
    { onkeyup, name: 'SMTP_HOST_ADDR', label: 'SMTP_HOST_ADDR', className: 'Input',  type: 'input', value: 'smtp.gmail.com' },
    { onkeyup, name: 'SMTP_HOST_PORT', label: 'SMTP_HOST_PORT', className: 'Input',  type: 'input', value: 465 },
    { onkeyup, name: 'SMTP_USER_NAME', label: 'SMTP_USER_NAME', className: 'Input',  type: 'input' },
    { onkeyup, name: 'SMTP_USER_PWD', label: 'SMTP_USER_PWD', className: 'Input',  type: 'input' }
  ]}

  fields.pages[3] = { title: 'Book', fields: [
    { onkeyup, name: 'BOOK_TITLE', value: 'Dear Reader', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_COVER', value: 'cover.png', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_SERIES', value: 'Newsletters', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_AUTHOR', value: 'Javier Arce', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_FILEAS', value: 'Arce, Javier', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_GENRE', value: 'Non-Fiction', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_TAGS', value: 'newsletters, reading', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_COPYRIGHT', value: 'Several authors, 2021', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_PUBLISHER', value: 'Dear Reader', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_DESCRIPTION', value: 'Newsletters', label: '', className: 'Input', type: 'input' },
    { onkeyup, name: 'BOOK_CONTENTS', value: 'Table of Contents', label: '', className: 'Input', type: 'input' }
  ]}

  fields.pages[4] = { title: 'OpenWeather (optional)', fields: [
    { onkeyup, name: 'OPEN_WEATHER_API_KEY', label: 'OPEN_WEATHER_API_KEY', className: 'Input',  type: 'input' },
    { onkeyup, name: 'OPEN_WEATHER_LANG', label: 'OPEN_WEATHER_LANG', className: 'Input',  type: 'input', value: 'en' },
    { onkeyup, name: 'OPEN_WEATHER_CITY', label: 'OPEN_WEATHER_CITY', className: 'Input',  type: 'input' },
    { onkeyup, name: 'OPEN_WEATHER_UNITS', label: 'OPEN_WEATHER_UNITS', className: 'Input',  type: 'input', value: 'metric' }
  ]}

  fields.pages[5] = { title: 'Thanks', fields: [
    { type: 'text', text: 'Elit explicabo iste id sit eum? Laborum illo quibusdam sint eligendi obcaecati unde Voluptatibus tenetur quos harum rem maxime a dolor rem. Unde molestiae laudantium ad rem in optio debitis'}
  ]}

  fields.pages.forEach(page => {
    page.fields.forEach(options => {
      if (options.value)  {
        storage[options.name] = options.value
      }
    })
  })
}

const showFieldsInPage = (page) => {
  fields.pages[page].fields.forEach(options => {

    if (storage[options.name]) {
      options.value = storage[options.name]
    }

    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
