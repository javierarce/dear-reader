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

const setupFields = () => {
  let onkeydown = (e) => {
    storage[e.target.name] = e.target.value
  }

  fields.pages[0] = [
    { onkeydown, name: 'feedbinUsername', label: 'Username', className: 'Input', type: 'input' },
    { onkeydown, name: 'feedbinPassword', label: 'Password', className: 'Input', type: 'input' },
    { onkeydown, name: 'kindleEmail', label: 'Kindle email', className: 'Input', type: 'input' }
  ]

  fields.pages[1] = [
    { onkeydown, name: 'mailerService', label: 'MAILER_SERVICE', className: 'Input',  type: 'input', value: 'gmail' },
    { onkeydown, name: 'mailerEmail', label: 'MAILER_EMAIL', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpHostAddr', label: 'SMTP_HOST_ADDR', className: 'Input',  type: 'input', value: 'smtp.gmail.com' },
    { onkeydown, name: 'smtpHostPort', label: 'SMTP_HOST_PORT', className: 'Input',  type: 'input', value: 465 },
    { onkeydown, name: 'smtpUserName', label: 'SMTP_USER_NAME', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpUserPwd', label: 'SMTP_USER_PWD', className: 'Input',  type: 'input' }
  ]
}

const showFieldsInPage = (page) => {
  fields.pages[page].forEach(options => {
    let $field = createInputField(options)
    $form.appendChild($field)
  })
}

window.onload = onLoad
