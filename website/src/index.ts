"use strict";

import Chart from 'chart.js/auto';

(function () {
  window.onload = function () {
    const dropdown = document.getElementById("city-dropdown");

    dropdown.onchange = (ev: Event) => {
      var city = (<HTMLInputElement>ev.srcElement).value; 
      if (window.myChart1 != null) {
        window.myChart1.destroy();
      }
    
      console.log(city);
      if (city == 'Choose a city') {
        document.getElementById("noCity").style.display = "flex"; 
      }
      else {
        document.getElementById("noCity").style.display = "none";
        const requestURL = city + ".json";
        let request = new XMLHttpRequest();
        request.open("GET", requestURL);
        request.responseType = "json";
        request.send();
      
        request.onload = function () {
          const requestData = request.response;
          var ctx = document.getElementById("statsChart").getContext("2d");
          window.myChart1 = new Chart (ctx, {
            type: "line",
            data: requestData,
            options: {
              responsive: true,
              scales: {
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
        };
      }
    }

    let defaultOption = document.createElement("option");
    defaultOption.text = "Choose a city";

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    const requestURL = "cities.json";
    let request = new XMLHttpRequest();
    request.open("GET", requestURL, true);
    request.responseType = "json";
    request.send();

    request.onload = function () {
      const requestData = request.response;
      const countries = Object.keys(requestData);

      let option;

      for (var i = 0; i < countries.length; i++) {
        var currentCountry = countries[i];
        var cities = Object.keys(requestData[currentCountry]);

        for (var j = 0; j < cities.length; j++) {
          var currentCity = cities[j];

          option = document.createElement("option");
          option.text = requestData[currentCountry][currentCity]["name"];
          option.value = currentCountry + "/" + currentCity;
          dropdown.add(option);
        }
      }
    };
  };
})();