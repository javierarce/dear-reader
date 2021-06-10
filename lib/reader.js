'use strict'

require('dotenv').config()

const fs = require('fs')
const Mailer = require('./mailer')
const sanitizeHtml = require('sanitize-html')
const nodepub = require('nodepub')
const fetch = require('node-fetch')

const TAG_NAME = 'newsletter'
const FEEDBIN_USERNAME = process.env.FEEDBIN_USERNAME
const FEEDBIN_PASSWORD = process.env.FEEDBIN_PASSWORD

const ALLOWED_TAGS = [ 'h1', 'h2', 'h3', 'p', 'b', 'i', 'em', 'strong', 'ul', 'li', 'ol', 'blockquote' ]

const CSS = 'h1 { font-size: 1.3em; } h2 { font-size: 1.1em; } h3 { font-size: .9em; } p { text-indent: 0; } .Chapter { margin: 0 0 1em 0; } .Title { font-size: 2em; text-align: center; margin-top: 55%; }'
const ENDPOINTS = {
}

class Reader {
  constructor () {
    this.articles = []
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

  //  get (id) {
  //    return new Promise((resolve, reject) => {
  //      let URL = `https://api.feedbin.com/v2/feeds/${id}/entries.json`
  //
  //      let headers = this.getHeaders()
  //
  //      fetch(URL, { headers })
  //        .then(res => res.json())
  //        .then((entries) => {
  //          resolve(entries)
  //        })
  //    })
  //  }
  //
  getUnreadEntries () {
    return new Promise((resolve, reject) => {
      let URL = `https://api.feedbin.com/v2/entries.json?read=false`

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
      let URL = `https://api.feedbin.com/v2/entries.json?ids=${ids.join(',')}`

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
      let URL = `https://api.feedbin.com/v2/unread_entries.json`
      let headers = this.getHeaders()

      let body = ` {"unread_entries": [${unread_entries.join(',')}]}`
      fetch(URL, { method: 'DELETE', body, headers })
        .then(res => res.json())
        .then((json) => {
          resolve(json)
        })
    })
  }

  getTaggings () {
    return new Promise((resolve, reject) => {
      let URL = `https://api.feedbin.com/v2/taggings.json`

      let headers = this.getHeaders()

      fetch(URL, { headers })
        .then(res => res.json())
        .then((json) => {
          resolve(json)
        })
    })
  }

  //  getUnreadEntries () {
  //    return new Promise((resolve, reject) => {
  //      let URL = `https://api.feedbin.com/v2/unread_entries.json`
  //
  //      let headers = this.getHeaders()
  //
  //      fetch(URL, { headers })
  //        .then(res => res.json())
  //        .then((json) => {
  //          resolve(json)
  //        })
  //    })
  //  }

  makeContentsPage (links) {

    let contents = "<h1>In this edition...</h1>"

    links.forEach((link) => {
      let article = this.articles.find(article => article.title === link.title)

      if (link.itemType !== "contents") {
        let author = article.author
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

  generateEpub () {
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
      this.book.addCSS(CSS)

      // this.book.addSection('Hello', `<h1>Hellow</h1>`, true, true)

      this.articles.forEach(this.formatArticle.bind(this))
      this.book.addSection('End', `<h1 class="Title">Thanks for reading</h1>`, true, false)
      await this.book.writeEPUB('./books/', 'book')

      resolve(true)
    })
  }

  formatArticle (article) {
    const html = sanitizeHtml(article.content, {
      allowedTags: ALLOWED_TAGS
    })

    let title = this.removeEmojis(article.title).trim()
    let body = this.removeEmojis(html)

    let author = article.author ? ` by ${article.author}` : ''
    let summary = article.summary

    this.book.addSection('Author', `<h1 class="Title">${title}${author}</h1>`, true, false)
    this.book.addSection(title, `<h1>${title}</h1> ${body}`)
  }

  async start () {
    let taggings = await this.getTaggings()

    let safeIds = taggings.filter((item) => {
      return item.name === TAG_NAME
    }).map(item => item.feed_id)

    let entries = await this.getUnreadEntries()

    this.articles = entries.reverse().filter((entry) => {
      return safeIds.includes(entry.feed_id)
    })

    this.generateEpub().then(async (response) => {
      if (response) {
        console.log('Book generated')
        //this.markAsRead(this.articles.map(a => a.id))
        let title = new Date().toDateString()
        let filename = `./books/${title}.txt`
        fs.renameSync('./books/book.epub', filename)
        //      let response = await Mailer.sendArticle(filename)
        //     console.log(response)

      }
    })
  }
}

module.exports = new Reader()
