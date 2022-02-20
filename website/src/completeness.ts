"use strict";

import Chart from "../node_modules/chart.js/auto";
import "bootstrap/js/dist/collapse";

const requestURL =
  "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/cities.json";
const request = new XMLHttpRequest();
request.open("GET", requestURL, true);
request.responseType = "json";
request.send();

request.onload = function () {
  const requestData = request.response;
  const countries = Object.keys(requestData);
  const chartData = {};
  const lastCountry = requestData[countries[countries.length - 1]];
  const lastCity =
    Object.keys(lastCountry)[Object.keys(lastCountry).length - 1];
  for (let i = 0; i < countries.length; i++) {
    const currentCountry = countries[i];
    const cities = Object.keys(requestData[currentCountry]);

    for (let j = 0; j < cities.length; j++) {
      const currentCity = cities[j];
      const cityUrl =
        "https://raw.githubusercontent.com/RobinLinde/statistics/master/data/" +
        currentCountry +
        "/" +
        currentCity +
        ".json";
      const cityRequest = new XMLHttpRequest();
      cityRequest.open("GET", cityUrl, true);
      cityRequest.responseType = "json";
      cityRequest.send();

      cityRequest.onload = function () {
        const cityData = cityRequest.response;
        const unmapped = cityData["sources"][0]["-"];
        let mapped = cityData["sources"][0]["wikidata"];
        if (cityData["sources"][0]["csv"]) {
          mapped += cityData["sources"][0]["csv"];
        }
        if (cityData["sources"][0]["config"]) {
          mapped += cityData["sources"][0]["config"];
        }
        if (cityData["sources"][0]["event"]) {
          mapped += cityData["sources"][0]["event"];
        }
        const total = mapped + unmapped;
        chartData[requestData[currentCountry][currentCity]["name"]] =
          (mapped / total) * 100;

        if (currentCity == lastCity) {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          const ctx = document.getElementById("statsChart").getContext("2d");
          new Chart(ctx, {
            type: "bar",
            data: {
              datasets: [
                {
                  data: chartData,
                },
              ],
            },
            options: {
              plugins: {
                tooltip: {
                  callbacks: {
                    label: function (tooltipItem) {
                      return ""+tooltipItem.parsed.y.toFixed(1)+"% completed";
                    },
                  },
                },
              },
            },
          });
        }
      };
    }
  }
  console.log(chartData);
};
