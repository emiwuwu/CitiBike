function init() {
  // Create the streetmap tile layer for the background.
  const streetmap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  });

  // Create layer groups for different categories.
  const layers = {
    comingSoon: new L.layerGroup(),
    empty: new L.layerGroup(),
    outOfOrder: new L.layerGroup(),
    low: new L.layerGroup(),
    normal: new L.layerGroup(),
  };

  // Define the initial map settings.
  const map = L.map('map-id', {
    center: [40.73, -74.0059],
    zoom: 12,
    layers: [
      streetmap,
      layers.comingSoon,
      layers.empty,
      layers.low,
      layers.normal,
      layers.outOfOrder,
    ],
  });

  // Create an object for overlay layers.
  const overlays = {
    'Coming Soon': layers.comingSoon,
    'Empty Stations': layers.empty,
    'Low Stations': layers.low,
    'Healthy Stations': layers.normal,
    'Out of Order': layers.outOfOrder,
  };

  // Add overlay layers to the map.
  L.control.layers(null, overlays).addTo(map);

  // Create a legend control for data.
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function () {
    const div = L.DomUtil.create('div', 'info legend');
    // Add legend content here (e.g., labels and colors).
    return div;
  };

  // Add the legend to the map.
  legend.addTo(map);

  // Initialize an object that contains icons for each layer group.
  let icons = {
    comingSoon: L.ExtraMarkers.icon({
      icon: "ion-settings",
      iconColor: "white",
      markerColor: "yellow",
      shape: "star"
    }),
    empty: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "red",
      shape: "circle"
    }),
    outOfOrder: L.ExtraMarkers.icon({
      icon: "ion-minus-circled",
      iconColor: "white",
      markerColor: "blue-dark",
      shape: "penta"
    }),
    low: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "orange",
      shape: "circle"
    }),
    normal: L.ExtraMarkers.icon({
      icon: "ion-android-bicycle",
      iconColor: "white",
      markerColor: "green",
      shape: "circle"
    })
  };

  // Perform an API call to the Citi Bike API to get the station information.
  // Call initMap and createMarkers when it completes.
  let url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
  d3.json(url)
    .then(data => {
      let statusUrl = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
      d3.json(statusUrl)
        .then(statusData => {
          const stationInfo = data.data.stations;
          const status = statusData.data.stations;
          const updatedAt = data.last_updated;

          // Create an object to keep the number of markers in each layer.
          let stationCount = {
            comingSoon: 0,
            empty: 0,
            low: 0,
            normal: 0,
            outOfOrder: 0
          };

          // Initialize stationStatusCode, which will be used as a key to access the appropriate layers, icons, and station count for the layer group.
          let stationStatusCode;

          // Loop through the stations array.
          for (let i = 0; i < stationInfo.length; i++) {
            let station = Object.assign({}, stationInfo[i], status[i]);

            // If a station is listed but not installed, it's coming soon.
            if (!station.is_installed) {
              stationStatusCode = "comingSoon";
            }
            // If a station has no available bikes, it's empty.
            else if (!station.num_bikes_available) {
              stationStatusCode = "empty";
            }
            // If a station is installed but isn't renting, it's out of order.
            else if (station.is_installed && !station.is_renting) {
              stationStatusCode = "outOfOrder";
            }
            // If a station has less than five bikes, it's status is low.
            else if (station.num_bikes_available < 5) {
              stationStatusCode = "low";
            }
            // Otherwise, the station is normal.
            else {
              stationStatusCode = "normal";
            }

            // Update the station count.
            stationCount[stationStatusCode]++;
            // Create a new marker with the appropriate icon and coordinates.
            let newMarker = L.marker([station.lat, station.lon], {
              icon: icons[stationStatusCode]
            });

            // Add the new marker to the appropriate layer.
            newMarker.addTo(layers[stationStatusCode]);

            // Bind a popup to the marker that will display on being clicked. This will be rendered as HTML.
            newMarker.bindPopup(station.name + "<br> Capacity: " + station.capacity + "<br>" + station.num_bikes_available + " Bikes Available");
          }

          // Call the updateLegend function, which will update the legend!
          updateLegend(updatedAt, stationCount);
        });
    });

  // Update the legend's innerHTML with the last updated time and station count.
  function updateLegend(time, stationCount) {
    document.querySelector(".legend").innerHTML = [
      "<p>Updated: " + moment.unix(time).format("h:mm:ss A") + "</p>",
      "<p class='out-of-order'>Out of Order Stations: " + stationCount.outOfOrder + "</p>",
      "<p class='coming-soon'>Stations Coming Soon: " + stationCount.comingSoon + "</p>",
      "<p class='empty'>Empty Stations: " + stationCount.empty + "</p>",
      "<p class='low'>Low Stations: " + stationCount.low + "</p>",
      "<p class='healthy'>Healthy Stations: " + stationCount.normal + "</p>"
    ].join("");
  }
}

init();
