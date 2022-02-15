'use strict'

require('dotenv').config()

const fs = require('fs')
const Mailer = require('./Mailer')
const Weather = require('./Weather')
const sanitizeHtml = require('sanitize-html')
const nodepub = require('nodepub')
const fetch = require('node-fetch')

const FEEDBIN_TAGNAME= process.env.FEEDBIN_TAGNAME
const FEEDBIN_USERNAME = process.env.FEEDBIN_USERNAME
const FEEDBIN_PASSWORD = process.env.FEEDBIN_PASSWORD

const BOOK_TITLE = process.env.BOOK_TITLE
const BOOK_COVER = process.env.BOOK_COVER
const BOOK_SERIES = process.env.BOOK_SERIES
const BOOK_AUTHOR = process.env.BOOK_AUTHOR
const BOOK_FILEAS = process.env.BOOK_FILEAS
const BOOK_GENRE = process.env.BOOK_GENRE
const BOOK_TAGS = process.env.BOOK_TAGS
const BOOK_COPYRIGHT = process.env.BOOK_COPYRIGHT
const BOOK_PUBLISHER = process.env.BOOK_PUBLISHER
const BOOK_DESCRIPTION = process.env.BOOK_DESCRIPTION
const BOOK_CONTENTS = process.env.BOOK_CONTENTS

const CSS_FILENAME = 'style.css'

const ALLOWED_TAGS = [ 'h1', 'h2', 'h3', 'p', 'b', 'i', 'em', 'strong', 'ul', 'li', 'ol', 'blockquote' ]

const ENDPOINTS = {
  entries: 'https://api.feedbin.com/v2/entries.json',
  unread: 'https://api.feedbin.com/v2/unread_entries.json',
  taggings: 'https://api.feedbin.com/v2/taggings.json'
}

class Reader {
  constructor () {
    this.articles = undefined
    this.CSS = fs.readFileSync(CSS_FILENAME, 'UTF-8')
  }

  removeEmojis(string) {
    if (!string) {
      return ''
    }

    let regex = /(?:[\u2700-\u27bf]|(?:\ud83c[\udde6-\uddff]){2}|[\ud800-\udbff][\udc00-\udfff]|[\u0023-\u0039]\ufe0f?\u20e3|\u3299|\u3297|\u303d|\u3030|\u24c2|\ud83c[\udd70-\udd71]|\ud83c[\udd7e-\udd7f]|\ud83c\udd8e|\ud83c[\udd91-\udd9a]|\ud83c[\udde6-\uddff]|\ud83c[\ude01-\ude02]|\ud83c\ude1a|\ud83c\ude2f|\ud83c[\ude32-\ude3a]|\ud83c[\ude50-\ude51]|\u203c|\u2049|[\u25aa-\u25ab]|\u25b6|\u25c0|[\u25fb-\u25fe]|\u00a9|\u00ae|\u2122|\u2139|\ud83c\udc04|[\u2600-\u26FF]|\u2b05|\u2b06|\u2b07|\u2b1b|\u2b1c|\u2b50|\u2b55|\u231a|\u231b|\u2328|\u23cf|[\u23e9-\u23f3]|[\u23f8-\u23fa]|\ud83c\udccf|\u2934|\u2935|[\u2190-\u21ff])/g
    return string.replace(regex, "")
  }

  getHeaders () {
    return {
      'Content-Type': "application/json",
      Authorization: 'Basic ' + Buffer.from(`${FEEDBIN_USERNAME}:${FEEDBIN_PASSWORD}`).toString('base64')
    }
  }

  async getWeather () {
    return Weather.get()
  }

  async getWeatherDescription () {
    const weatherData = await this.getWeather()

    const description = weatherData.weather[0].description
    const city = weatherData.name
    const temperature = weatherData.main.temp
    const feelsLike = weatherData.main.feels_like
    const humidity = weatherData.main.humidity
    const sunset = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString('es-ES').replace(/(.*)\D\d+/, '$1')

    return `${this.capitalizeFirstLetter(description)}. The temperature in ${city} is ${temperature}ºC (feels like ${feelsLike}ºC). Humidity: ${humidity}%. Sunset time is ${sunset}.`
  }

  getAuthors () {
    return new Promise(async(resolve, reject) => {
      try {
        let entries = await this.getEntries()
        let authors = await this.getAuthorsFromEntries(entries)

        resolve(authors)
      } catch (error) {
        reject(error)
      }
    })
  }

  getAuthorsFromEntries (entries) {
    return [...new Set(entries.map(entry => entry.author))].filter(e => e)
  }

  getUnreadEntries () {
    return new Promise((resolve, reject) => {
      let URL = `${ENDPOINTS.entries}?starred=true&extracted_content_url=true`

      let headers = this.getHeaders()

      fetch(URL, { headers })
        .then(res => res.json())
        .then((entries) => {
          resolve(entries)
        })
    })
  }

  getEntriesByIds (ids) {
    return new Promise((resolve, reject) => {
      let URL = `${ENDPOINTS.entries}?ids=${ids.join(',')}`

      let headers = this.getHeaders()

      fetch(URL, { headers })
        .then(res => res.json())
        .then((entries) => {
          resolve(entries)
        })
    })
  }

  markAsRead (entries) {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders()

      let body = ` {"unread_entries": [${entries.join(',')}]}`
      fetch(ENDPOINTS.unread, { method: 'DELETE', body, headers })
        .then(res => res.json())
        .then((json) => {
          resolve(json)
        })
    })
  }

  getTaggings () {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders()

      fetch(ENDPOINTS.taggings, { headers })
        .then(res => res.json())
        .then((json) => {
          resolve(json)
        })
    })
  }

  makeContentsPage (links) {
    let contents = "<h1>Table of contents</h1>"

    links.forEach((link) => {
      let article = this.articles.find(article => article.title === link.title)

      if (link.itemType !== "contents") {
        let author = article.author ? article.author : 'Unknown'
        let title = this.removeEmojis(article.title)
        let summary = this.removeEmojis(article.summary)

        summary = summary.replace(/[\u00A0-\u9999<>\&]/g, (i) => {
          return '&#'+i.charCodeAt(0)+';'
        })

        contents += `<h2>${title} by ${author}</h2><blockquote>${summary}</blockquote>`
        contents += `<a href='${link.link}'>${title}</a>`
      }
    })

    return contents
  }

  getDayOfTheYear() {
    let now = new Date()
    let start = new Date(now.getFullYear(), 0, 0)
    let diff = (now - start) + ((start.getTimezoneOffset() - now.getTimezoneOffset()) * 60 * 1000)
    let oneDay = 1000 * 60 * 60 * 24
    return Math.floor(diff / oneDay)
  }

  toTitleCase (str) {
    return str.replace(
      /\w\S*/g,
      function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
      }
    )
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1)
  }

  toOxfordComma (array) {
    return array.length >= 2 ? array .slice(0, array.length - 1) .concat(`and ${array.slice(-1)}`) .join(', ') : array.join(', ')
  }

  generateEPUB () {
    return new Promise(async (resolve, reject) => {
      const DOCUMENT_OPTIONS = {
        id: this.getDayOfTheYear(),
        language: 'en',
        sequence: 1,
        images: [],
        published: new Date().toDateString(),
        title: BOOK_TITLE,
        cover: BOOK_COVER,
        series: BOOK_SERIES,
        author: BOOK_AUTHOR,
        fileAs: BOOK_FILEAS,
        genre: BOOK_GENRE,
        tags: BOOK_TAGS,
        copyright: BOOK_COPYRIGHT,
        publisher: BOOK_PUBLISHER,
        description: BOOK_DESCRIPTION,
        contents: BOOK_CONTENTS
      }

      this.book = nodepub.document(DOCUMENT_OPTIONS)

      if (this.CSS) {
        this.book.addCSS(this.CSS)
      }

      let weather = await this.getWeatherDescription()
      let date = new Date().toLocaleTimeString('es-ES').replace(/(.*)\D\d+/, '$1')

      let content = '<div class="Intro">'
      content += `<p class="Weather">${weather}</p>`
      content += `<footer>This book was cheerfully delivered by Dear Reader at ${date}.</footer>`
      content += '</div>'


      let authors = this.getAuthorsFromEntries(this.articles)
      let names = this.toOxfordComma(authors.map(author => this.toTitleCase(author)))
      let amount = this.articles.length === 1 ? 'one article' : `a selection of <strong>${this.articles.length} articles</strong>`

      content += '<p>Dear reader,</p>'
      content += `<p>This book contains ${amount} by ${names}.</p>`
      content += `<p>Happy reading!</p>`

      this.book.addSection('In this edition…', content, false, false)

      await this.formatArticles()

      this.book.addSection('End', `<h1 class="Title">Thanks for reading</h1>`, true, false)

      let filename = this.writeBook()

      resolve(filename)
    })
  }

  async writeBook () {
    await this.book.writeEPUB('./', 'book')

    let date = new Date().toDateString()
    let filename = `Dear Reader - ${date}.png`
    fs.copyFileSync(`book.epub`, filename)

    return filename
  }

  async formatArticles () {
    for (let i = 0; i < this.articles.length; i++) {
      await this.formatArticle(this.articles[i])
    }
  }

  getExtendedContent (URL) {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders()

      fetch(URL, { headers })
        .then(res => res.json())
        .then((entry) => {
          resolve(entry)
        })
    })
  }

  extractImages (html) {
    let m
    let urls = []
    let rex = /<img[^>]+src="?([^"\s]+)"?\s*\/>/g

    while ( m = rex.exec(html) ) {
      urls.push( m[1] )
    }
    return urls
  }

  sanitize (text) {
    text = this.removeEmojis(text)
    return sanitizeHtml(text, { allowedTags: ALLOWED_TAGS })
  }

  sanitizeEntry (entry) {
    return new Promise(async (resolve, reject) => {
      if (!entry)  {
        return
      }

      entry.title = this.removeEmojis(entry.title).trim()
      entry.author = entry.author ? entry.author : 'Unknown'
      entry.content = this.sanitize(entry.content)

      if (entry.content.length < 100) {
        try {
          let extended = await this.getExtendedContent(entry.extracted_content_url)
          entry.content = this.sanitize(extended.content)
          resolve(entry)
        } catch (error) {
          console.error(error)
          reject(error)
        }
      }

      resolve(entry)
    })
  }

  formatArticle (article) {
    return new Promise(async (resolve, reject) => {
      if (!article)  {
        return
      }

      let title = this.removeEmojis(article.title).trim()

      let body = this.sanitize(article.content)

      if (body.length < 100) {
        try {
          let extended = await this.getExtendedContent(article.extracted_content_url)
          body = this.sanitize(extended.content)
        } catch (error) {
          console.log(error)
        }
      }

      let author = article.author ? ` <h2>${article.author}</h2>` : ''
      let summary = article.summary 

      this.book.addSection('Author', `<div class="Title"><h1>${title}</h1>${author}</div>`, true, false)
      this.book.addSection(title, body)

      resolve(true)
    })
  }

  async getEntries () {
    let taggings = await this.getTaggings()

    let safeIDs = taggings.filter((item) => {
      return item.name === FEEDBIN_TAGNAME 
    }).map(item => item.feed_id)

    let entries = await this.getUnreadEntries()

    let articles = entries.reverse().filter((entry) => {
      return safeIDs.includes(entry.feed_id)
    })

    for (let i = 0; i < articles.length; i++) {
      articles[i] =  await this.sanitizeEntry(articles[i])
    }

    return articles
  }

  generate ({ deliver, mark_as_read }) {
    return new Promise(async (resolve, reject) => {
      this.articles = await this.getEntries()

      if (!this.articles) {
        return reject('There weren\'t any articles')
      }

      let filename = await this.generateEPUB().catch(error => reject)

      if (!filename) {
        reject('There was an error generating the book')
      }

      if (mark_as_read) {
        this.markAsRead(this.articles.map(article => article.id))
      }

      if (deliver) {
        let response = await Mailer.sendArticle(filename).catch((error) => {
          console.error(error)
          reject(error)
          return
        })

        console.log('Delivering', response)
        resolve(response)
      } else {
        resolve(response)
      }
    })
  }
}

module.exports = new Reader()
