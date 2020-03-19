// @ts-check
var allData;
var dates = [];
var bubble_map;
var dateOutput;
var dateRange;

const state_id_map = {
  "Andaman & Nicobar Island": "AN",
  "Andhra Pradesh": "AP",
  "Arunanchal Pradesh": "AR",
  Assam: "AS",
  Bihar: "BR",
  Chhattisgarh: "CT",
  Puducherry: "PY",
  Punjab: "PB",
  Rajasthan: "RJ",
  Sikkim: "SK",
  "Tamil Nadu": "TN",
  Chandigarh: "CH",
  Telangana: "TS",
  Tripura: "TR",
  "Uttar Pradesh": "UP",
  Uttarakhand: "UK",
  "West Bengal": "WB",
  Odisha: "OD",
  "Dadara & Nagar Havelli": "DN",
  "Daman & Diu": "DD",
  Goa: "GA",
  Gujarat: "GJ",
  Haryana: "HR",
  "Himachal Pradesh": "HP",
  "Jammu & Kashmir": "JK",
  Jharkhand: "JH",
  Karnataka: "KA",
  Kerala: "KL",
  Lakshadweep: "LD",
  "Madhya Pradesh": "MP",
  Maharashtra: "MH",
  Manipur: "MN",
  Meghalaya: "ML",
  Mizoram: "MZ",
  Nagaland: "NL",
  "NCT of Delhi": "DL"
};

function initTimeline() {
  var low = 1;
  var high = dates.length;
  dateRange.min = low;
  dateRange.max = high;
  dateRange.value = dates.length;
  updateDate(dates.length);
}

function updateDate(value) {
  var selectedDate = dates[value - 1];
  dateOutput.innerHTML = selectedDate;
  plotMap(allData[selectedDate]);
}

function parseCsv(data) {
  var allTextLines = data.split(/\r\n|\n/);
  var headings = allTextLines[0].split(",");
  var states = headings.slice(1);
  var numbers = allTextLines.slice(1);
  var allDays = {};
  for (var j = 0; j < numbers.length; j++) {
    var line = numbers[j];
    var entries = line.split(",");
    var date = entries[0];
    if (!date.length) {
      continue;
    }
    var stateEntries = entries.slice(1);
    allDays[date] = {};
    for (var i = 0; i < stateEntries.length; i++) {
      var count = 0;
      if (stateEntries[i].length > 0) {
        count = Number(stateEntries[i]);
      }
      allDays[date][states[i]] = count;
    }
  }

  return allDays;
}
function plotMap(regionalData) {
  // TODO(rahul): get rid of this hack. Find polygons for Ladakh from https://www.gadm.org/download_country_v3.html.
  regionalData["Jammu & Kashmir"] += regionalData["Ladakh"];
  regionalData["Ladakh"] = 0;

  var bubbles = [];
  for (var name in state_id_map) {
    var bubble = {
      centered: state_id_map[name],
      fillKey: "MAJOR",
      radius: Math.sqrt(regionalData[name]) * 2,
      cases: regionalData[name],
      state: name
    };
    bubbles.push(bubble);
  }

  // only start drawing bubbles on the map when map has rendered completely.
  setTimeout(() => {
    bubble_map.bubbles(bubbles, {
      popupTemplate: function(geo, data) {
        return `<div class="hoverinfo">Region: ${data.state}, Cases: ${data.cases}</div>`;
      }
    });
  }, 500);
}

// reads text from URL location
function getText(url) {
  var request = new XMLHttpRequest();
  request.open("GET", url, true);
  request.send(null);
  request.onreadystatechange = function() {
    if (request.readyState === 4 && request.status === 200) {
      var type = request.getResponseHeader("Content-Type");
      if (type.indexOf("text") !== 1) {
        allData = parseCsv(request.responseText);
        for (var date in allData) {
          dates.push(date);
        }
        initTimeline();
      }
    }
  };
}
