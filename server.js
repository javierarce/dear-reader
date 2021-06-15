'use strict'

require('dotenv').config()

const { spawn } = require('child_process')
const fs = require('fs')
const Reader = require('./lib/Reader')

const USER = process.env.USERNAME
const PASSWORD = process.env.PASSWORD

const path = require('path')
const bodyParser = require('body-parser')

const express = require('express')

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

const app = express()
const http = require('http').createServer(app)

const auth = (request, response, next) => {
  if (request.session && request.session.user === USER && request.session.password === PASSWORD) {
    request.session.isLoggedIn = true
  } else if (request.path.includes('api')) {
    return response.status(401).json({ error: true })
  }
  return next()
}

app.use(session)
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)

 app.get('/', auth, (request, response) => {
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

app.get('/api/unread_entries', async (request, response) => {
  let result = await Reader.getUnreadEntries().catch(e => response.json)
  response.json(result)
})

app.get('/api/entries', async (request, response) => {
  let result = await Reader.getArticles().catch(e => response.json)
  response.json(result)
})

app.get('/api/generate', async (request, response) => {
  let result = await Reader.generate().catch(e => response.json)
  response.json({ result })
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

http.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + process.env.PORT)
}) 
