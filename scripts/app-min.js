!function() {
  "use strict";
  var e = {
      isLoading: !0,
      visibleCards: {},
      selectedCities: [],
      spinner: document.querySelector(".loader"),
      cardTemplate: document.querySelector(".cardTemplate"),
      container: document.querySelector(".main"),
      addDialog: document.querySelector(".dialog-container"),
      daysOfWeek: [ "M", "Tu", "W", "Th", "F", "Sa", "Su" ]
  };
  document.getElementById("butRefresh").addEventListener("click", function() {
      e.updateForecasts();
  }), document.getElementById("butAdd").addEventListener("click", function() {
      e.toggleAddDialog(!0);
  }), document.getElementById("butAddCity").addEventListener("click", function() {
      var t = document.getElementById("selectCityToAdd");
      const a = t.options[t.selectedIndex], c = a.value, s = a.textContent;
      e.selectedCities || (e.selectedCities = []), e.getForecast(c, s), e.selectedCities.push({
          key: c,
          label: s
      }), e.saveSelectedCities(), e.toggleAddDialog(!1);
  }), document.getElementById("butAddCancel").addEventListener("click", function() {
      e.toggleAddDialog(!1);
  }), e.toggleAddDialog = function(t) {
      t ? e.addDialog.classList.add("dialog-container--visible") : e.addDialog.classList.remove("dialog-container--visible");
  }, e.updateForecastCard = function(t) {
      const a = new Date(t.created), c = t.channel.astronomy.sunrise, s = t.channel.astronomy.sunset, n = t.channel.item.condition, r = t.channel.atmosphere.humidity, o = t.channel.wind;
      var i = e.visibleCards[t.key];
      i || (i = e.cardTemplate.cloneNode(!0), i.classList.remove("cardTemplate"), i.querySelector(".location").textContent = t.label, 
      i.removeAttribute("hidden"), e.container.appendChild(i), e.visibleCards[t.key] = i);
      const d = i.querySelector(".card-last-updated");
      var l = d.textContent;
      if (!(l && (l = new Date(l), a.getTime() < l.getTime()))) {
          d.textContent = t.created, i.querySelector(".description").textContent = n.text, 
          i.querySelector(".date").textContent = n.date, i.querySelector(".current .icon").classList.add(e.getIconClass(n.code)), 
          i.querySelector(".current .temperature .value").textContent = Math.round(n.temp), 
          i.querySelector(".current .sunrise").textContent = c, i.querySelector(".current .sunset").textContent = s, 
          i.querySelector(".current .humidity").textContent = Math.round(r) + "%", i.querySelector(".current .wind .value").textContent = Math.round(o.speed), 
          i.querySelector(".current .wind .direction").textContent = o.direction;
          const u = i.querySelectorAll(".future .oneday");
          var y = new Date();
          y = y.getDay();
          for (var h = 0; 7 > h; h++) {
              const g = u[h], C = t.channel.item.forecast[h];
              C && g && (g.querySelector(".date").textContent = e.daysOfWeek[(h + y) % 7], g.querySelector(".icon").classList.add(e.getIconClass(C.code)), 
              g.querySelector(".temp-high .value").textContent = Math.round(C.high), g.querySelector(".temp-low .value").textContent = Math.round(C.low));
          }
          e.isLoading && (e.spinner.setAttribute("hidden", !0), e.container.removeAttribute("hidden"), 
          e.isLoading = !1);
      }
  }, e.getForecast = function(a, c) {
      const s = "select * from weather.forecast where woeid=" + a, n = "https://query.yahooapis.com/v1/public/yql?format=json&q=" + s;
      "caches" in window && caches.match(n).then(function(t) {
          t && t.json().then(function(t) {
              const s = t.query.results;
              s.key = a, s.label = c, s.created = t.query.created, e.updateForecastCard(s);
          });
      });
      var r = new XMLHttpRequest();
      r.onreadystatechange = function() {
          if (r.readyState === XMLHttpRequest.DONE) {
              if (200 === r.status) {
                  const s = JSON.parse(r.response), n = s.query.results;
                  n.key = a, n.label = c, n.created = s.query.created, e.updateForecastCard(n);
              }
          } else e.updateForecastCard(t);
      }, r.open("GET", n), r.send();
  }, e.updateForecasts = function() {
      var t = Object.keys(e.visibleCards);
      t.forEach(function(t) {
          e.getForecast(t);
      });
  }, e.saveSelectedCities = function() {
      const t = JSON.stringify(e.selectedCities);
      localStorage.selectedCities = t;
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
  e.selectedCities = localStorage.selectedCities, e.selectedCities ? (e.selectedCities = JSON.parse(e.selectedCities), 
  e.selectedCities.forEach(function(t) {
      e.getForecast(t.key, t.label);
  })) : (e.updateForecastCard(t), e.selectedCities = [ {
      key: t.key,
      label: t.label
  } ], e.saveSelectedCities()), "serviceWorker" in navigator && navigator.serviceWorker.register("./service-worker.js").then(function() {
      console.log("Service worker registered.");
  });
}();