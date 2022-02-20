"use strict";

import Chart from "../node_modules/chart.js/auto";
import "chartjs-adapter-date-fns";
import "bootstrap/js/dist/collapse";

function setOption(selectElement: HTMLSelectElement, value) {
  const options = selectElement.options;
  for (let i = 0, optionsLength = options.length; i < optionsLength; i++) {
    if (options[i].value == value) {
      selectElement.selectedIndex = i;
      return true;
    }
  }
  return false;
}

(function () {
  window.onload = function () {
    const dropdown = <HTMLSelectElement>(
      document.getElementById("city-dropdown")
    );

    dropdown.onchange = function () {
      updateChart(dropdown.value);
    };

    function updateChart(city) {
      if (window.myChart1 != null) {
        window.myChart1.destroy();
      }
      if (window.myChart2 != null) {
        window.myChart2.destroy();
      }

      if (city == "Choose a city") {
        document.getElementById("noCity").style.display = "flex";
      } else {
        document.getElementById("noCity").style.display = "none";
        const requestURL =
          "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/" +
          city +
          ".json";
        const request = new XMLHttpRequest();
        request.open("GET", requestURL);
        request.responseType = "json";
        request.send();

        request.onload = function () {
          const requestData = request.response;
          const ctx = document.getElementById("statsChart").getContext("2d");
          window.myChart1 = new Chart(ctx, {
            type: "line",
            data: {
              datasets: [
                {
                  label: "Female (cis)",
                  data: requestData["statistics"],
                  backgroundColor: "#800080",
                  borderColor: "#800080",
                  parsing: {
                    yAxisKey: "F",
                  },
                },
                {
                  label: "Male (cis)",
                  data: requestData["statistics"],
                  backgroundColor: "#C8C800",
                  borderColor: "#C8C800",
                  parsing: {
                    yAxisKey: "M",
                  },
                },
                {
                  label: "Female (trans)",
                  data: requestData["statistics"],
                  backgroundColor: "#00A050",
                  borderColor: "#00A050",
                  parsing: {
                    yAxisKey: "FX",
                  },
                },
                {
                  label: "Male (trans)",
                  data: requestData["statistics"],
                  backgroundColor: "#00A050",
                  borderColor: "#00A050",
                  parsing: {
                    yAxisKey: "MX",
                  },
                },
                {
                  label: "Intersex",
                  data: requestData["statistics"],
                  backgroundColor: "#00A050",
                  borderColor: "#00A050",
                  parsing: {
                    yAxisKey: "X",
                  },
                },
                {
                  label: "Non-binary",
                  data: requestData["statistics"],
                  backgroundColor: "#808080",
                  borderColor: "#808080",
                  parsing: {
                    yAxisKey: "NB",
                  },
                },
                {
                  label: "Multiple",
                  data: requestData["statistics"],
                  backgroundColor: "#A46440",
                  borderColor: "#A46440",
                  parsing: {
                    yAxisKey: "+",
                  },
                },
                {
                  label: "Unknown",
                  data: requestData["statistics"],
                  backgroundColor: "#808080",
                  borderColor: "#808080",
                  parsing: {
                    yAxisKey: "?",
                  },
                },
                {
                  label: "Not a person",
                  data: requestData["statistics"],
                  backgroundColor: "#DDDDDD",
                  borderColor: "#DDDDDD",
                  parsing: {
                    yAxisKey: "-",
                  },
                },
                {
                  label: "Wikidata",
                  data: requestData["sources"],
                  borderDash: [5, 5],
                  backgroundColor: "#990000",
                  borderColor: "#990000",
                  parsing: {
                    yAxisKey: "wikidata",
                  },
                },
                {
                  label: "From config file",
                  data: requestData["sources"],
                  borderDash: [5, 5],
                  backgroundColor: "#1000FF",
                  borderColor: "#1000FF",
                  parsing: {
                    yAxisKey: "config",
                  },
                },
                {
                  label: "CSV",
                  data: requestData["sources"],
                  borderDash: [5, 5],
                  backgroundColor: "#1000FF",
                  borderColor: "#1000FF",
                  parsing: {
                    yAxisKey: "csv",
                  },
                },
                {
                  label: "Event",
                  data: requestData["sources"],
                  borderDash: [5, 5],
                  backgroundColor: "#00A1FF",
                  borderColor: "#00A1FF",
                  parsing: {
                    yAxisKey: "event",
                  },
                },
                {
                  label: "Not mapped",
                  data: requestData["sources"],
                  borderDash: [5, 5],
                  backgroundColor: "#DDDDDD",
                  borderColor: "#DDDDDD",
                  parsing: {
                    yAxisKey: "-",
                  },
                },
              ],
            },
            options: {
              responsive: true,
              scales: {
                x: {
                  type: "time",
                },
                y: {
                  beginAtZero: true,
                },
              },
            },
          });
          const unmapped = requestData["sources"][0]["-"];
          let mapped = requestData["sources"][0]["wikidata"];
          if (requestData["sources"][0]["csv"]) {
            mapped += requestData["sources"][0]["csv"];
          }
          if (requestData["sources"][0]["config"]) {
            mapped += requestData["sources"][0]["config"];
          }
          if (requestData["sources"][0]["event"]) {
            mapped += requestData["sources"][0]["event"];
          }
          const total = unmapped + mapped;

          const ctx2 = document
            .getElementById("completionChart")
            .getContext("2d");
          window.myChart2 = new Chart(ctx2, {
            type: "doughnut",

            data: {
              labels: ["Etymology known", "Etymology unknown"],
              datasets: [
                {
                  data: [(mapped / total) * 100, (unmapped / total) * 100],
                  backgroundColor: ["green", "red"],
                },
              ],
            },
            options: {
              circumference: 180,
              rotation: -90,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      return tooltipItem.label+" ("+tooltipItem.parsed.toFixed(1)+"%)";
                    },
                  },
                },
              },
            },
          });
        };
      }
    }

    const defaultOption = document.createElement("option");
    defaultOption.text = "Choose a city";

    dropdown.add(defaultOption);
    dropdown.selectedIndex = 0;

    const requestURL =
      "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/cities.json";
    const request = new XMLHttpRequest();
    request.open("GET", requestURL, true);
    request.responseType = "json";
    request.send();

    request.onload = function () {
      const requestData = request.response;
      const countries = Object.keys(requestData);

      let option;

      for (let i = 0; i < countries.length; i++) {
        const currentCountry = countries[i];
        const cities = Object.keys(requestData[currentCountry]);

        for (let j = 0; j < cities.length; j++) {
          const currentCity = cities[j];

          option = document.createElement("option");
          option.text = requestData[currentCountry][currentCity]["name"];
          option.value = currentCountry + "/" + currentCity;
          dropdown.add(option);
        }
      }

      const urlParams = new URLSearchParams(window.location.search);
      const cityFromUrl = urlParams.get("city");

      if (cityFromUrl) {
        updateChart(cityFromUrl);
        setOption(dropdown, cityFromUrl);
      }
    };
  };
})();
