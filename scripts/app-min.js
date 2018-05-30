!function() {
  "use strict";
  var e = {
      isLoading: !0,
      visibleCards: {},
      selectedCitiesList: [],
      spinner: document.querySelector(".loader"),
      cardTemplate: document.querySelector(".cardTemplate"),
      container: document.querySelector(".main"),
      addDialog: document.querySelector(".dialog-container"),
      daysOfWeek: [ "M", "Tu", "W", "Th", "F", "Sa", "Su" ]
  };
  document.getElementById("buttonClear").addEventListener("click", function() {
      console.log("Clearing list of cities from " + JSON.stringify(e.selectedCitiesList)), 
      e.selectedCitiesList = [ {
          key: t.key,
          label: t.label
      } ], e.saveSelectedCities(), console.log("List of cities is now " + JSON.stringify(e.selectedCitiesList));
  }), document.getElementById("buttonRefresh").addEventListener("click", function() {
      e.updateForecasts();
  }), document.getElementById("buttonAdd").addEventListener("click", function() {
      e.toggleAddDialog(!0);
  }), document.getElementById("butAddCity").addEventListener("click", function() {
      var t = document.getElementById("selectCityToAdd");
      const c = t.options[t.selectedIndex], s = c.value, o = c.textContent;
      e.selectedCitiesList || (e.selectedCitiesList = []), e.getForecast(s, o), e.selectedCitiesList.push({
          key: s,
          label: o
      }), e.saveSelectedCities(), e.toggleAddDialog(!1);
  }), document.getElementById("butAddCancel").addEventListener("click", function() {
      e.toggleAddDialog(!1);
  }), e.toggleAddDialog = function(t) {
      t ? e.addDialog.classList.add("dialog-container--visible") : e.addDialog.classList.remove("dialog-container--visible");
  }, e.updateForecastCard = function(t) {
      const c = new Date(t.created), s = t.channel.astronomy.sunrise, o = t.channel.astronomy.sunset, n = t.channel.item.condition, a = t.channel.atmosphere.humidity, i = t.channel.wind;
      var r = e.visibleCards[t.key];
      r || (r = e.cardTemplate.cloneNode(!0), r.classList.remove("cardTemplate"), r.querySelector(".location").textContent = t.label, 
      r.removeAttribute("hidden"), e.container.appendChild(r), e.visibleCards[t.key] = r);
      const l = r.querySelector(".card-last-updated");
      var d = l.textContent;
      if (!(d && (d = new Date(d), c.getTime() < d.getTime()))) {
          l.textContent = t.created, r.querySelector(".description").textContent = n.text, 
          r.querySelector(".date").textContent = n.date, r.querySelector(".current .icon").classList.add(e.getIconClass(n.code)), 
          r.querySelector(".current .temperature .value").textContent = Math.round(n.temp), 
          r.querySelector(".current .sunrise").textContent = s, r.querySelector(".current .sunset").textContent = o, 
          r.querySelector(".current .humidity").textContent = Math.round(a) + "%", r.querySelector(".current .wind .value").textContent = Math.round(i.speed), 
          r.querySelector(".current .wind .direction").textContent = i.direction;
          const u = r.querySelectorAll(".future .oneday");
          var g = new Date();
          g = g.getDay();
          for (var y = 0; 7 > y; y++) {
              const h = u[y], C = t.channel.item.forecast[y];
              C && h && (h.querySelector(".date").textContent = e.daysOfWeek[(y + g) % 7], h.querySelector(".icon").classList.add(e.getIconClass(C.code)), 
              h.querySelector(".temp-high .value").textContent = Math.round(C.high), h.querySelector(".temp-low .value").textContent = Math.round(C.low));
          }
          e.isLoading && (e.spinner.setAttribute("hidden", !0), e.container.removeAttribute("hidden"), 
          e.isLoading = !1);
      }
  }, e.getForecast = function(c, s) {
      const o = "select * from weather.forecast where woeid=" + c, n = "https://query.yahooapis.com/v1/public/yql?format=json&q=" + o;
      "caches" in window && caches.match(n).then(function(t) {
          t && t.json().then(function(t) {
              const o = t.query.results;
              o.key = c, o.label = s, o.created = t.query.created, e.updateForecastCard(o);
          });
      });
      var a = new XMLHttpRequest();
      a.onreadystatechange = function() {
          if (a.readyState === XMLHttpRequest.DONE) {
              if (200 === a.status) {
                  const o = JSON.parse(a.response), n = o.query.results;
                  n.key = c, n.label = s, n.created = o.query.created, e.updateForecastCard(n);
              }
          } else e.updateForecastCard(t);
      }, a.open("GET", n), a.send();
  }, e.updateForecasts = function() {
      const t = Object.keys(e.visibleCards);
      t.forEach(function(t) {
          e.getForecast(t);
      });
  }, e.saveSelectedCities = function() {
      const t = JSON.stringify(e.selectedCitiesList);
      console.log("Preparing to save selectedCities as " + t), localforage.setItem("selectedCities", t).then(function(e) {
          console.log("Updated selectedCities to " + e);
      })["catch"](function(e) {
          console.log("Error while saving selectedCities: " + e), console.log("Unchanged selectedCities is " + t);
      });
  }, e.getIconClass = function(e) {
      switch (e = parseInt(e)) {
        case 25:
        case 32:
        case 33:
        case 34:
        case 36:
        case 3200:
          return "clear-day";

        case 0:
        case 1:
        case 2:
        case 6:
        case 8:
        case 9:
        case 10:
        case 11:
        case 12:
        case 17:
        case 35:
        case 40:
          return "rain";

        case 3:
        case 4:
        case 37:
        case 38:
        case 39:
        case 45:
        case 47:
          return "thunderstorms";

        case 5:
        case 7:
        case 13:
        case 14:
        case 16:
        case 18:
        case 41:
        case 42:
        case 43:
        case 46:
          return "snow";

        case 15:
        case 19:
        case 20:
        case 21:
        case 22:
          return "fog";

        case 24:
        case 23:
          return "windy";

        case 26:
        case 27:
        case 28:
        case 31:
          return "cloudy";

        case 29:
        case 30:
        case 44:
          return "partly-cloudy-day";
      }
  };
  var t = {
      key: "2446593",
      label: "Maryville, MO",
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
              forecast: [ {
                  code: 30,
                  high: 89,
                  low: 67
              }, {
                  code: 47,
                  high: 89,
                  low: 64
              }, {
                  code: 34,
                  high: 91,
                  low: 67
              }, {
                  code: 4,
                  high: 98,
                  low: 69
              }, {
                  code: 4,
                  high: 86,
                  low: 69
              }, {
                  code: 34,
                  high: 90,
                  low: 61
              }, {
                  code: 30,
                  high: 96,
                  low: 62
              } ]
          },
          atmosphere: {
              humidity: 59
          },
          wind: {
              speed: 18,
              direction: 135
          }
      }
  };
  e.checkServiceWorker = function() {
      "serviceWorker" in navigator && navigator.serviceWorker.register("./service-worker.js").then(function(e) {
          console.log("Service worker registered. Scope is " + e.scope);
      })["catch"](function(e) {
          console.log("Service worker registration failed with " + e);
      });
  }, e.initializeFromStorage = function() {
      console.log("On startup, localforage is: " + localforage), localforage.getItem("selectedCities").then(function(c) {
          console.log("On startup, initial stored selectedCities value =" + c), c ? (e.selectedCitiesList = JSON.parse(c), 
          e.selectedCitiesList.forEach(function(t) {
              e.getForecast(t.key, t.label);
          })) : (e.updateForecastCard(t), e.selectedCitiesList = [ {
              key: t.key,
              label: t.label
          } ], e.saveSelectedCities());
      })["catch"](function(e) {
          console.log("On startup, error getting initial stored selectedCities value: " + e);
      });
  }, e.initializeFromStorage(), e.checkServiceWorker();
}();