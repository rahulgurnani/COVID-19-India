// @ts-check
var allData;
var dates = [];
var bubble_map;
var dateOutput;
var dateRange;
var selectedDate;
var detailStats;

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
  selectedDate = dates[value - 1];
  var displayDate = selectedDate.replace("_", "/") + "/2020";
  dateOutput.innerHTML = displayDate;
  plotMap(allData[selectedDate]);
  showAggregateStats();
}

function plotMap(regionalData) {
  console.log(regionalData);

  var bubbles = [];
  for (var name in state_id_map) {
    var total = 0;
    if (name in regionalData) {
      total =
        regionalData[name]["Total Cases (Indian)"] +
        regionalData[name]["Total cases (Foreign National)"];
      // TODO(rahul): get rid of this hack. Find polygons for Ladakh from https://www.gadm.org/download_country_v3.html.
      if (name == "Jammu & Kashmir" && "Ladakh" in regionalData) {
        total =
          regionalData["Ladakh"]["Total Cases (Indian)"] +
          regionalData["Ladakh"]["Total cases (Foreign National)"];
      }
      console.log(name);
      console.log(total);
    }
    var bubble = {
      centered: state_id_map[name],
      fillKey: "MAJOR",
      radius: Math.sqrt(total) * 2,
      cases: total,
      state: name
    };
    bubbles.push(bubble);
  }

  // only start drawing bubbles on the map when map has rendered completely.
  setTimeout(() => {
    bubble_map.bubbles(bubbles, {
      popupTemplate: function(geo, data) {
        return `<div>Region: ${data.state}, Cases: ${data.cases}</div>`;
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
        console.log(request.responseText);
        allData = JSON.parse(request.responseText);

        // allData = parseCsv(request.responseText);
        for (var date in allData) {
          dates.push(date);
        }
        initTimeline();
        showAggregateStats();
      }
    }
  };
}

function showAggregateStats(name) {
  var data = allData[selectedDate];
  var aggregateStats = {};
  if (name) {
    var body = `<b>Aggregate stats for ${name} </b><br>`;
    for (var key in data[name]) {
      body += key + " : " + data[name][key] + "<br>";
    }
    detailStats.innerHTML = body;
  } else {
    var body = "<b>Aggregate stats for India </b><br>";
    for (var state in data) {
      for (var key in data[state]) {
        if (aggregateStats[key] == null) {
          aggregateStats[key] = 0;
        }

        aggregateStats[key] += data[state][key];
      }
    }
    console.log(aggregateStats);
    for (var stat in aggregateStats) {
      body += stat + ": " + aggregateStats[stat] + "<br>";
    }
    detailStats.innerHTML = body;
  }
}
