'use strict'

require('dotenv').config()

const OpenWeather = require('openweather-apis')

const OPEN_WEATHER_LANG = process.env.OPEN_WEATHER_LANG
const OPEN_WEATHER_CITY = process.env.OPEN_WEATHER_CITY
const OPEN_WEATHER_UNITS = process.env.OPEN_WEATHER_UNITS
const OPEN_WEATHER_API_KEY = process.env.OPEN_WEATHER_API_KEY

class Weather {
  constructor () {
  }

  get () {
    return new Promise(async (resolve, reject) => {
      if (!OPEN_WEATHER_API_KEY) {
        return
      }

      OpenWeather.setLang(OPEN_WEATHER_LANG)
      OpenWeather.setCity(OPEN_WEATHER_CITY)
      OpenWeather.setUnits(OPEN_WEATHER_UNITS)
      OpenWeather.setAPPID(OPEN_WEATHER_API_KEY)

      OpenWeather.getAllWeather((error, response) => {
        if (error) {
          return reject(error)
        }

        resolve(response)
      })
    })
  }

}

module.exports = new Weather()
