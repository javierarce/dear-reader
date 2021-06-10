'use strict'

require('dotenv').config()

const { spawn } = require('child_process')
const fs = require('fs')
const Reader = require('./lib/reader')

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

app.get('/logout', (request, response) => {
  request.session.destroy()
})

app.get('/api/all', (request, response) => {
  DB.getAll().then((result) => {
    response.json(result)
  }).catch((error) => {
    response.json(error)
  })
})

app.delete('/api/text/:id', auth, (request, response) => {
  DB.remove(request.params.id).then((result) => {
    response.json(result)
  }).catch((error) => {
    response.json({ error: true, message: error })
  })
})

app.post('/api/repeat', auth, (request, response) => {
  DB.repeat(request.body).then((result) => {
    response.json(result)
  }).catch((error) => {
    response.json(error)
  })
})

app.post('/api/post', auth, (request, response) => {
  DB.save(request.body).then((result) => {
    response.json(result)
  }).catch((error) => {
    response.json(error)
  })
})

app.post('/login', (request, response) => {
  request.session.user = request.body.user
  request.session.password = request.body.password

  response.redirect('/')
})

if (process.env.MODE == 'DEVELOPMENT') {
  fs.watch('./public/js/', (eventType, filename) => {
    console.log(`${eventType}: ${filename}`)
    spawn('./concat')
  })
}

Reader.start()

http.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + process.env.PORT)
}) 
