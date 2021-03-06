// Copyright 2016 Google Inc.
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.



(function () {
  'use strict';

  var app = {
    isLoading: true,
    visibleCards: {},
    selectedCitiesList: [],
    spinner: document.querySelector('.loader'),
    cardTemplate: document.querySelector('.cardTemplate'),
    container: document.querySelector('.main'),
    addDialog: document.querySelector('.dialog-container'),
    daysOfWeek: ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su']
  }


  /*****************************************************************************
   *
   * Event listeners for UI elements
   *
   ****************************************************************************/

  document.getElementById('buttonClear').addEventListener('click', function () {
    console.log('Clearing list of cities from ' + JSON.stringify(app.selectedCitiesList))
    app.selectedCitiesList = [
      { key: initialWeatherForecast.key, label: initialWeatherForecast.label }
    ];
    app.saveSelectedCities()
    console.log('List of cities is now ' + JSON.stringify(app.selectedCitiesList))
    //TODO: update UI
  })

  document.getElementById('buttonRefresh').addEventListener('click', function () {
    // Refresh all of the forecasts
    app.updateForecasts()
  })

  document.getElementById('buttonAdd').addEventListener('click', function () {
    // Open/show the add new city dialog
    app.toggleAddDialog(true)
  })

  document.getElementById('butAddCity').addEventListener('click', function () {
    // Add the newly selected city
    var select = document.getElementById('selectCityToAdd')
    const selected = select.options[select.selectedIndex]
    const key = selected.value
    const label = selected.textContent
    if (!app.selectedCitiesList) {
      app.selectedCitiesList = []
    }
    app.getForecast(key, label)
    app.selectedCitiesList.push({ key: key, label: label })
    app.saveSelectedCities()
    app.toggleAddDialog(false)
  })

  document.getElementById('butAddCancel').addEventListener('click', function () {
    // Close the add new city dialog
    app.toggleAddDialog(false)
  })


  /*****************************************************************************
   *
   * Methods to update/refresh the UI
   *
   ****************************************************************************/

  // Toggles the visibility of the add new city dialog.
  app.toggleAddDialog = function (visible) {
    if (visible) {
      app.addDialog.classList.add('dialog-container--visible')
    } else {
      app.addDialog.classList.remove('dialog-container--visible')
    }
  }

  // Updates a weather card with the latest weather forecast. If the card
  // doesn't already exist, it's cloned from the template.
  app.updateForecastCard = function (data) {
    const dataLastUpdated = new Date(data.created)
    const sunrise = data.channel.astronomy.sunrise
    const sunset = data.channel.astronomy.sunset
    const current = data.channel.item.condition
    const humidity = data.channel.atmosphere.humidity
    const wind = data.channel.wind

    var card = app.visibleCards[data.key]
    if (!card) {
      card = app.cardTemplate.cloneNode(true)
      card.classList.remove('cardTemplate')
      card.querySelector('.location').textContent = data.label
      card.removeAttribute('hidden')
      app.container.appendChild(card)
      app.visibleCards[data.key] = card
    }

    // Verifies the data provide is newer than what's already visible
    // on the card, if it's not bail, if it is, continue and update the
    // time saved in the card
    const cardLastUpdatedElem = card.querySelector('.card-last-updated');
    var cardLastUpdated = cardLastUpdatedElem.textContent
    if (cardLastUpdated) {
      cardLastUpdated = new Date(cardLastUpdated)
      // Bail if the card has more recent data then the data
      if (dataLastUpdated.getTime() < cardLastUpdated.getTime()) {
        return
      }
    }
    cardLastUpdatedElem.textContent = data.created

    card.querySelector('.description').textContent = current.text
    card.querySelector('.date').textContent = current.date
    card.querySelector('.current .icon').classList.add(app.getIconClass(current.code))
    card.querySelector('.current .temperature .value').textContent = Math.round(current.temp)
    card.querySelector('.current .sunrise').textContent = sunrise
    card.querySelector('.current .sunset').textContent = sunset
    card.querySelector('.current .humidity').textContent = Math.round(humidity) + '%'
    card.querySelector('.current .wind .value').textContent = Math.round(wind.speed)
    card.querySelector('.current .wind .direction').textContent = wind.direction
    const nextDays = card.querySelectorAll('.future .oneday')
    var today = new Date()
    today = today.getDay()
    for (var i = 0; i < 7; i++) {
      const nextDay = nextDays[i]
      const daily = data.channel.item.forecast[i]
      if (daily && nextDay) {
        nextDay.querySelector('.date').textContent = app.daysOfWeek[(i + today) % 7]
        nextDay.querySelector('.icon').classList.add(app.getIconClass(daily.code))
        nextDay.querySelector('.temp-high .value').textContent = Math.round(daily.high)
        nextDay.querySelector('.temp-low .value').textContent = Math.round(daily.low)
      }
    }
    if (app.isLoading) {
      app.spinner.setAttribute('hidden', true)
      app.container.removeAttribute('hidden')
      app.isLoading = false
    }
  }

  /*****************************************************************************
  *
  * Methods for dealing with the model
  *
  ****************************************************************************/

  /*
   * Gets a forecast for a specific city and updates the card with the data.
   * getForecast() first checks if the weather data is in the cache. If so,
   * then it gets that data and populates the card with the cached data.
   * Then, getForecast() goes to the network for fresh data. If the network
   * request goes through, then the card gets updated a second time with the
   * freshest data.
   */
  app.getForecast = function (key, label) {
    const statement = 'select * from weather.forecast where woeid=' + key
    const url = 'https://query.yahooapis.com/v1/public/yql?format=json&q=' + statement

    if ('caches' in window) {
      /*
       * Check if the service worker has already cached this city's weather
       * data. If the service worker has the data, then display the cached
       * data while the app fetches the latest data.
       */
      caches.match(url).then(function (response) {
        if (response) {
          response.json().then(function updateFromCache(json) {
            const results = json.query.results
            results.key = key
            results.label = label
            results.created = json.query.created
            app.updateForecastCard(results)
          })
        }
      })
    }

    // Fetch the latest data.
    var request = new XMLHttpRequest()
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          const response = JSON.parse(request.response)
          const results = response.query.results
          results.key = key
          results.label = label
          results.created = response.query.created
          app.updateForecastCard(results)
        }
      } else {
        // Return the initial weather forecast since no data is available.
        app.updateForecastCard(initialWeatherForecast)
      }
    }
    request.open('GET', url)
    request.send()
  }

  // Iterate through all cards and attempt to get latest forecast
  app.updateForecasts = function () {
    const keys = Object.keys(app.visibleCards)
    keys.forEach(function (key) {
      app.getForecast(key)
    })
  }

  app.saveSelectedCities = function () {
    const citiesString = JSON.stringify(app.selectedCitiesList)
    console.log('Preparing to save selectedCities as ' + citiesString)
    //localStorage.selectedCities = citiesString
    localforage.setItem('selectedCities', citiesString).then(function (value) {
      console.log('Updated selectedCities to ' + value)
    }).catch(function (err) {
      console.log('Error while saving selectedCities: ' + err)
      console.log('Unchanged selectedCities is ' + citiesString)
    })
  }

  app.getIconClass = function (weatherCode) {
    // Weather codes: https://developer.yahoo.com/weather/documentation.html#codes
    weatherCode = parseInt(weatherCode);
    switch (weatherCode) {
      case 25: // cold
      case 32: // sunny
      case 33: // fair (night)
      case 34: // fair (day)
      case 36: // hot
      case 3200: // not available
        return 'clear-day'
      case 0: // tornado
      case 1: // tropical storm
      case 2: // hurricane
      case 6: // mixed rain and sleet
      case 8: // freezing drizzle
      case 9: // drizzle
      case 10: // freezing rain
      case 11: // showers
      case 12: // showers
      case 17: // hail
      case 35: // mixed rain and hail
      case 40: // scattered showers
        return 'rain'
      case 3: // severe thunderstorms
      case 4: // thunderstorms
      case 37: // isolated thunderstorms
      case 38: // scattered thunderstorms
      case 39: // scattered thunderstorms (not a typo)
      case 45: // thundershowers
      case 47: // isolated thundershowers
        return 'thunderstorms'
      case 5: // mixed rain and snow
      case 7: // mixed snow and sleet
      case 13: // snow flurries
      case 14: // light snow showers
      case 16: // snow
      case 18: // sleet
      case 41: // heavy snow
      case 42: // scattered snow showers
      case 43: // heavy snow
      case 46: // snow showers
        return 'snow'
      case 15: // blowing snow
      case 19: // dust
      case 20: // foggy
      case 21: // haze
      case 22: // smoky
        return 'fog'
      case 24: // windy
      case 23: // blustery
        return 'windy'
      case 26: // cloudy
      case 27: // mostly cloudy (night)
      case 28: // mostly cloudy (day)
      case 31: // clear (night)
        return 'cloudy'
      case 29: // partly cloudy (night)
      case 30: // partly cloudy (day)
      case 44: // partly cloudy
        return 'partly-cloudy-day';
    }
  }

  /*
   * Fake weather data that is presented when the user first uses the app,
   * or when the user has not saved any cities. See startup code for more
   * discussion.
   */
  var initialWeatherForecast = {
    key: '2446593',
    label: 'Maryville, MO',
    created: "2018-05-29T19:17:23Z",
    channel: {
      astronomy: {
        sunrise: "5:53 am",
        sunset: "8:41 pm"
      },
      item: {
        condition: {
          text: "Partly Cloudy",
          date: "Tue, 29 May 2018 01:00 PM CDT",
          temp: "87",
          code: "30"
        },
        forecast: [
          { code: 30, high: 89, low: 67 },
          { code: 47, high: 89, low: 64 },
          { code: 34, high: 91, low: 67 },
          { code: 4, high: 98, low: 69 },
          { code: 4, high: 86, low: 69 },
          { code: 34, high: 90, low: 61 },
          { code: 30, high: 96, low: 62 }
        ]
      },
      atmosphere: {
        humidity: 59
      },
      wind: {
        speed: 18,
        direction: 135
      }
    }
  }

  app.checkServiceWorker = function () {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./service-worker.js')
        .then(function (reg) {
          console.log('Service worker registered. Scope is ' + reg.scope)
        }).catch(function (error) {
          console.log('Service worker registration failed with ' + error)
        })
    }
  }

  app.initializeFromStorage = function () {

    /************************************************************************
   *   localStorage is a synchronous API and has serious performance
   *   implications. It should not be used in production applications!
   *   Instead, check out IDB (https://www.npmjs.com/package/idb) or
   *   SimpleDB (https://gist.github.com/inexorabletash/c8069c042b734519680c)
   ************************************************************************/
    //app.selectedCities = localStorage.selectedCities
    console.log('On startup, localforage is: ' + localforage);
    localforage.getItem('selectedCities').then(function (value) {
      console.log('On startup, initial stored selectedCities value =' + value);
      if (value) {
        app.selectedCitiesList = JSON.parse(value);
        app.selectedCitiesList.forEach(function (city) {
          app.getForecast(city.key, city.label)
        })
      } else {
        /* The user is using the app for the first time, or the user has not
        * saved any cities, so show the user some fake data. A real app in this
        * scenario could guess the user's location via IP lookup and then inject
        * that data into the page.
        */
        app.updateForecastCard(initialWeatherForecast)
        app.selectedCitiesList = [
          { key: initialWeatherForecast.key, label: initialWeatherForecast.label }
        ];
        app.saveSelectedCities()
      }
    }).catch(function (err) {
      console.log('On startup, error getting initial stored selectedCities value: ' + err);
    })

  }
  // TODO uncomment line below to test app with fake data
  //app.updateForecastCard(initialWeatherForecast)

  // startup code here
  app.initializeFromStorage()
  app.checkServiceWorker()

})()
