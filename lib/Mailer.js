'use strict'

require('dotenv').config()

const nodemailer = require('nodemailer')
const fs = require('fs')

const CSS = {
  content: 'box-sizing:border-box;margin:0 0 0 0;padding:0 0 0 0;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol";line-height:25px;width:100%;height:100%;min-height:100%;background-color:#fff',
  block: 'box-sizing:border-box;width:600px;max-width:100%;margin:0 auto 0 auto;padding:8px 8px 8px 8px',
  footer: 'box-sizing:border-box;font-size:17px;line-height:25px;margin:0 0 25px 0;padding:0 0 0 0;color:#999',
  link: 'text-decoration:underline;color:hsl(12,76%,55%)',
  footerLink: 'text-decoration:underline;color:#999',
  p: 'box-sizing:border-box;font-size:17px;line-height:25px;margin:0 0 25px 0;padding:0 0 0 0'
}

const SITE_URL = process.env.MODE === 'DEVELOPMENT' ? `http://localhost:${process.env.PORT}` : process.env.SITE_URL
const KINDLE_EMAIL = process.env.KINDLE_EMAIL

const MAILER_EMAIL = process.env.MAILER_EMAIL
const MAILER_SERVICE = process.env.MAILER_SERVICE
const MAIL_ENABLED = process.env.MAIL_ENABLED === 'true' ? true : false
const SMTP_USER_NAME = process.env.SMTP_USER_NAME
const SMTP_USER_PWD = process.env.SMTP_USER_PWD

class Mailer {
  constructor () {
    this.transporter = nodemailer.createTransport({
      service: MAILER_SERVICE,
      auth: {
        user: SMTP_USER_NAME,
        pass: SMTP_USER_PWD
      }
    })

  }

  sendArticle (filename) {
    return new Promise((resolve, reject) => {
      const to = KINDLE_EMAIL
      const from = MAILER_EMAIL

      let subject = 'Kindle Content'
      let text = '.'

      let attachments = { 
        filename,
        path: filename
      }

      let mail = { from, to, text, subject, attachments }

      try {
        
      if (MAIL_ENABLED) {
        this.transporter.sendMail(mail, (error, info) => {
          if (error) {
            reject(error)
            return
          }
          resolve(`Email sent: ${ info.response }`)
        })
      } else {
        resolve(`MAIL SENDING IS DISABLED: ${mail}`)
      }

      } catch (error) {
        reject(error)
      }
    })
  }

}

module.exports = new Mailer()
