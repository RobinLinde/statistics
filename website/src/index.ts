"use strict";

import Chart from '../node_modules/chart.js/auto';
import 'chartjs-adapter-date-fns';

(function () {
  window.onload = function () {
    const dropdown = document.getElementById("city-dropdown");

    dropdown.onchange = (ev: Event) => {
      var city = (<HTMLInputElement>ev.srcElement).value; 
      if (window.myChart1 != null) {
        window.myChart1.destroy();
      }
    
      if (city == 'Choose a city') {
        document.getElementById("noCity").style.display = "flex"; 
      }
      else {
        document.getElementById("noCity").style.display = "none";
        const requestURL = "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/" + city + ".json";
        let request = new XMLHttpRequest();
        request.open("GET", requestURL);
        request.responseType = "json";
        request.send();
      
        request.onload = function () {
          var requestData = request.response;
          var ctx = document.getElementById("statsChart").getContext("2d");
          window.myChart1 = new Chart (ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Female (cis)",
                  data: requestData['statistics'],
                  backgroundColor: '#800080',
                  borderColor: '#800080',
                  parsing: {
                    yAxisKey: 'F'
                  }
                },
                {
                  label: "Male (cis)",
                  data: requestData['statistics'],
                  backgroundColor: '#C8C800',
                  borderColor: '#C8C800',
                  parsing: {
                    yAxisKey: 'M'
                  }
                },
                {
                  label: "Female (trans)",
                  data: requestData['statistics'],
                  backgroundColor: '#00A050',
                  borderColor: '#00A050',
                  parsing: {
                    yAxisKey: 'FX'
                  }
                },
                {
                  label: "Male (trans)",
                  data: requestData['statistics'],
                  backgroundColor: '#00A050',
                  borderColor: '#00A050',
                  parsing: {
                    yAxisKey: 'MX'
                  }
                },
                {
                  label: "Intersex",
                  data: requestData['statistics'],
                  backgroundColor: '#00A050',
                  borderColor: '#00A050',
                  parsing: {
                    yAxisKey: 'X'
                  }
                },
                {
                  label: "Non-binary",
                  data: requestData['statistics'],
                  backgroundColor: '#808080',
                  borderColor: '#808080',
                  parsing: {
                    yAxisKey: 'NB'
                  }
                },
                {
                  label: "Multiple",
                  data: requestData['statistics'],
                  backgroundColor: '#A46440',
                  borderColor: '#A46440',
                  parsing: {
                    yAxisKey: '+'
                  }
                },
                {
                  label: "Unknown",
                  data: requestData['statistics'],
                  backgroundColor: '#808080',
                  borderColor: '#808080',
                  parsing: {
                    yAxisKey: '?'
                  }
                },
                {
                  label: "Not a person",
                  data: requestData['statistics'],
                  backgroundColor: '#DDDDDD',
                  borderColor: '#DDDDDD',
                  parsing: {
                    yAxisKey: '-'
                  }
                },
                {
                  label: "Wikidata",
                  data: requestData['sources'],
                  borderDash: [5, 5],
                  backgroundColor: '#990000',
                  borderColor: '#990000',
                  parsing: {
                    yAxisKey: 'wikidata'
                  }
                },
                {
                  label: "From config file",
                  data: requestData['sources'],
                  borderDash: [5, 5],
                  backgroundColor: '#1000FF',
                  borderColor: '#1000FF',
                  parsing: {
                    yAxisKey: 'config'
                  }
                },
                {
                  label: "CSV",
                  data: requestData['sources'],
                  borderDash: [5, 5],
                  backgroundColor: '#1000FF',
                  borderColor: '#1000FF',
                  parsing: {
                    yAxisKey: 'csv'
                  }
                },
                {
                  label: "Event",
                  data: requestData['sources'],
                  borderDash: [5, 5],
                  backgroundColor: '#00A1FF',
                  borderColor: '#00A1FF',
                  parsing: {
                    yAxisKey: 'event'
                  }
                },
                {
                  label: "Not mapped",
                  data: requestData['sources'],
                  borderDash: [5, 5],
                  backgroundColor: '#DDDDDD',
                  borderColor: '#DDDDDD',
                  parsing: {
                    yAxisKey: '-'
                  }
                }
              ]
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  type: 'time'
                },
                y: {
                  beginAtZero: true
                },
              },
            }
          });
        };
      }
    }

    let defaultOption = document.createElement("option");
    defaultOption.text = "Choose a city";

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    const requestURL = "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/cities.json";
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