let fields
let $form
let currentPage
let storage = {}

const onLoad = () => {
  currentPage = 0
  fields = { pages: [] }
  $form = createElement({ className: 'Form' })

  fields.pages[0] = []
  fields.pages[1] = []

  setupFields()

  renderForm()
  document.body.appendChild($form)
}

const renderForm = () => {
  $form.innerHTML = ''
  showFieldsInPage(currentPage)

  let $next = createElement({ className: 'Button', text: 'Next', type: 'button' })

  $form.appendChild($next)

  $next.onclick = () => {
    currentPage+=1
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
    { onkeydown, name: 'mailerService', label: 'MAILER_SERVICE', className: 'Input',  type: 'input' },
    { onkeydown, name: 'mailerEmail', label: 'MAILER_EMAIL', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpHostAddr', label: 'SMTP_HOST_ADDR', className: 'Input',  type: 'input' },
    { onkeydown, name: 'smtpHostPort', label: 'SMTP_HOST_PORT', className: 'Input',  type: 'input' },
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
