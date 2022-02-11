'use strict'

require('dotenv').config()

const { spawn } = require('child_process')
const fs = require('fs')
const Reader = require('./lib/Reader')

const PORT = process.env.PORT || 3000
const USER = process.env.USERNAME
const PASSWORD = process.env.PASSWORD

const path = require('path')
const bodyParser = require('body-parser')

const express = require('express')

const app = express()

if (process.env.SECRET) {
  const session = require('express-session')({
    resave: true,
    saveUninitialized: true,
    secret: process.env.SECRET,
    expires: new Date(Date.now() + (30 * 86400 * 1000)),
    cookie: {
      secure: false, 
      httpOnly: false, 
      maxAge: 1000 * 60 * 10 
    }
  })

  app.use(session)
}

const http = require('http').createServer(app)

const auth = (request, response, next) => {
  if (request.session && request.session.user === USER && request.session.password === PASSWORD) {
    request.session.isLoggedIn = true
  } else if (request.path.includes('api')) {
    return response.status(401).json({ error: true })
  }
  return next()
}

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)

app.get('/setup', auth, (request, response) => {
  const isLoggedIn = request.session && request.session.isLoggedIn
  const isDevelopment = process.env.MODE === 'DEVELOPMENT' ? true : false

  response.render(__dirname + '/views/setup.html', { isLoggedIn, isDevelopment })
})

app.get('/', auth, (request, response) => {
  const isLoggedIn = request.session && request.session.isLoggedIn
  const isDevelopment = process.env.MODE === 'DEVELOPMENT' ? true : false
  const completedSetup = process.env.KINDLE_EMAIL && process.env.FEEDBIN_USERNAME && process.env.FEEDBIN_PASSWORD 

  if (!completedSetup) {
    response.render(__dirname + '/views/setup.html', { isLoggedIn, isDevelopment })
    return
  }

  response.render(__dirname + '/views/index.html', { isLoggedIn, isDevelopment })
})

app.get('/config', auth, (request, response) => {
  const isLoggedIn = request.session.isLoggedIn
  const isDevelopment = process.env.MODE === 'DEVELOPMENT' ? true : false
  response.render(__dirname + '/views/index.html', { isLoggedIn, isDevelopment })
})

app.get('/login', (request, response) => {
  response.sendFile(__dirname + '/views/login.html')
})

app.get('/api/weather', async (request, response) => {
  let result = await Reader.getWeather().catch(e => response.json)
  response.json(result)
})

app.get('/api/authors', async (request, response) => {
  let result = await Reader.getAuthors().catch(e => response.json)
  response.json(result)
})

app.get('/api/unread_entries', async (request, response) => {
  let result = await Reader.getUnreadEntries().catch(e => response.json)
  response.json(result)
})

app.get('/api/entries', async (request, response) => {
  let result = await Reader.getEntries().catch(e => response.json)
  response.json(result)
})

app.get('/api/generate', async (request, response) => {
  let result = await Reader.generate({ deliver: true, mark_as_read: false }).catch((error) => {
    response.json({ error })
  })
  response.json({ result })
})

app.get('/api/deliver', async (request, response) => {
  let result = await Reader.generate({ deliver: true, mark_as_read: true }).catch(e => response.json)
  response.json({ result })
})

app.post('/api/setup', (request, response) => {
  let data = request.body
  let content = ['PORT=3000']

  Object.keys(data).forEach(key => {
    content.push(`${key}=${data[key]}`)
  })

  content = content.sort((a, b) => { return a.localeCompare(b)})

  fs.writeFileSync('.env', content.join('\n'))
  response.json({ ok: true })
})

app.get('/logout', (request, response) => {
  request.session.destroy()
})

app.post('/login', (request, response) => {
  request.session.user = request.body.user
  request.session.password = request.body.password

  response.redirect('/')
})

if (process.env.MODE == 'DEVELOPMENT') {
  fs.watch('./public/js/', (eventType, filename) => {
    if (filename !== 'all.js') {
      console.log(`${eventType}: ${filename}`)
      spawn('./concat')
    }
  })
}

http.listen(PORT, () => {
  console.log('Your app is listening on port ' + PORT)
}) 
