const ENDPOINTS = {
  entries: '/api/entries',
  generate: '/api/generate',
  weather: '/api/weather'
}

const killEvent = (e) => {
  e.stopPropagation()
  e.preventDefault()
}

const addClass = (elementClass, className) => {
  let $element = getElement(`.${elementClass}`)

  if ($element) {
    $element.classList.add(className)
  }
}

const getRandomItem = (items) => {
  return items[Math.floor(Math.random()*items.length)]
}

const getElements = (selector) => {
  return document.querySelectorAll(selector)
}

const getElement = (selector) => {
  return document.querySelector(selector)
}
const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
}

const createElement = ({ className, html, text, type = 'div', ...options }) => {
  let $el = document.createElement(type)

  if (html) {
    $el.innerHTML = html
  } else if (text) {
    $el.innerText = text
  }

  $el.classList.add(className)

  if (!isEmpty(options)) {
    Object.keys(options).forEach((key) => {
      $el[key] = options[key]
    })
  }

  return $el
}

const get = (URL) => {
  const headers = { 'Content-Type': 'application/json' }
  const method = 'GET'
  const options = { method, headers }

  return fetch(URL, options)
}

const post = (URL, content) => {
  const headers = { 'Content-Type': 'application/json' }
  const method = 'POST'
  const body = JSON.stringify(content)
  const options = { method, headers, body }

  return fetch(URL, options)
}
