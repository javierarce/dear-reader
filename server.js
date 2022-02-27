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

const http = require('http').createServer(app)

const steps = require('./installation.json')

app.use(express.static('public'))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'html')
app.engine('html', require('ejs').renderFile)

app.get('/', (request, response) => {
  const isDevelopment = process.env.MODE !== 'PRODUCTION' ? true : false
  const completedSetup = process.env.KINDLE_EMAIL && process.env.FEEDBIN_USERNAME && process.env.FEEDBIN_PASSWORD 

  if (!completedSetup) {
    response.render(__dirname + '/views/setup.html', { isDevelopment })
    return
  }

  response.render(__dirname + '/views/index.html', { isDevelopment })
})

app.get('/home', (request, response) => {
  const isDevelopment = process.env.MODE !== 'PRODUCTION' ? true : false
  response.render(__dirname + '/views/home.html', { isDevelopment })
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

app.get('/api/steps', async (request, response) => {
  response.json(steps)
})

app.post('/api/setup', (request, response) => {
  let data = request.body
  let content = ['PORT=3000', 'MAIL_ENABLED=true', 'MODE=DEVELOPMENT']

  Object.keys(data).forEach(key => {
    content.push(`${key}=${data[key]}`)
  })

  content = content.sort((a, b) => { return a.localeCompare(b)})

  fs.writeFileSync('.env', content.join('\n'))
  response.json({ ok: true })
})

if (process.env.MODE != 'PRODUCTION') {
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
