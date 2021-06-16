'use strict'

require('dotenv').config()

const fs = require('fs')
const Mailer = require('./Mailer')
const Weather = require('./Weather')
const sanitizeHtml = require('sanitize-html')
const nodepub = require('nodepub')
const fetch = require('node-fetch')

const BOOK_DIRECTORY = './public/books/'

const TAG_NAME = process.env.TAG_NAME
const FEEDBIN_USERNAME = process.env.FEEDBIN_USERNAME
const FEEDBIN_PASSWORD = process.env.FEEDBIN_PASSWORD

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
    this.css = fs.readFileSync(CSS_FILENAME, 'UTF-8')
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

  getWeather () {
    return Weather.get()
  }

  getUnreadEntries () {
    return new Promise((resolve, reject) => {
      let URL = `${ENDPOINTS.entries}?read=false&extracted_content_url=true`

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

  markAsRead (unread_entries) {
    return new Promise((resolve, reject) => {
      let headers = this.getHeaders()

      let body = ` {"unread_entries": [${unread_entries.join(',')}]}`
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
    let contents = "<h1>In this edition...</h1>"

    links.forEach((link) => {
      let article = this.articles.find(article => article.title === link.title)

      if (article) {
        console.log(`title for ${article.title}`)
      } else {
        console.log('article not found')
      }

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

  generateEPUB () {
    return new Promise(async (resolve, reject) => {
      const DOCUMENT_OPTIONS = {
        id: Math.round(Math.random() * 1000),
        title: 'My collection',
        cover: 'empty.png',
        images: [],
        series: 'Newsletters',
        sequence: 1,
        author: 'Javier Arce',
        fileAs: 'Arce, Javier',
        genre: 'Non-Fiction',
        tags: 'Newsletters, Reading',
        copyright: 'Several authors, 2021',
        publisher: 'Reading Systems',
        published: new Date().toDateString(),
        language: 'en',
        description: 'Newsletters',
        contents: 'In this edition',
        source: 'https://reading.systems'
      }

      this.book = nodepub.document(DOCUMENT_OPTIONS, this.makeContentsPage.bind(this))

      if (this.CSS) {
        this.book.addCSS(this.CSS)
      }

      await this.formatArticles()

      this.book.addSection('End', `<h1 class="Title">Thanks for reading</h1>`, true, false)

      let filename = this.writeBook()

      resolve(filename)
    })
  }

  async writeBook () {
    await this.book.writeEPUB(BOOK_DIRECTORY, 'book')

    let title = new Date().toDateString()
    let filename = `${BOOK_DIRECTORY}${title}.txt`
    fs.copyFileSync(`${BOOK_DIRECTORY}book.epub`, filename)

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
      urls.push( m[1] );
    }
    return urls
  }

  sanitize (text) {
    text = this.removeEmojis(text)
    return sanitizeHtml(text, { allowedTags: ALLOWED_TAGS })
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

      let author = article.author ? ` by ${article.author}` : ''
      let summary = article.summary 

      this.book.addSection('Author', `<h1 class="Title">${title}${author}</h1>`, true, false)
      this.book.addSection(title, `<h1>${title}</h1> ${body}`)
      resolve(true)
    })
  }

  async getArticles () {
    let taggings = await this.getTaggings()

    let safeIDs = taggings.filter((item) => {
      return item.name === TAG_NAME
    }).map(item => item.feed_id)

    let entries = await this.getUnreadEntries()

    let articles = entries.reverse().filter((entry) => {
      return safeIDs.includes(entry.feed_id)
    })

    return articles
  }

  generate () {
    return new Promise(async (resolve, reject) => {
      this.articles = await this.getArticles()

      if (!this.articles) {
        return reject('There weren\'t any articles')
      }

      let filename = await this.generateEPUB().catch(error => reject)

      if (!filename) {
        reject('There was an error generating the book')
      }

      let response = await Mailer.sendArticle(filename)
      return resolve(response)
    })
  }
}

module.exports = new Reader()