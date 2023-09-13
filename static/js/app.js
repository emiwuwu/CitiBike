// Define the initial coordinates and zoom level for the map
let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Create the init function to initialize the map
function init(comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup) {
  // Create the tile layer that will be the background of our map.
  const lightmap = L.tileLayer("https://api.maptiler.com/maps/basic-v2-light/{z}/{x}/{y}.png?key=SrVNfxrBOyXCH5tXK2VC", {
    attribution: 'Map data &copy; <a href="https://www.maptiler.com/">MapTiler</a>'
  });

  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps = {
    "Lightmap": lightmap
  };

  // Create overlayMaps object to hold different station groups
  let overlayMaps = {
    "Coming Soon": comingSoonGroup,
    "Empty Stations": emptyStationsGroup,
    "Out of Order": outOfOrderGroup,
    "Low Stations": lowStationsGroup,
    "Healthy Stations": healthyStationsGroup
  };

  // Create the map object with options.
  let map = L.map("map-id", {
    center: newYorkCoords,
    zoom: mapZoomLevel,
    layers: [lightmap, comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup]
  });

  // Add overlayMaps to the map using a control layer.
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // Create a legend for the station categories
  const legend = L.control({ position: 'bottomright' });
  legend.onAdd = function (map) {
    const div = L.DomUtil.create('div', 'info legend');
    const values = ["Coming Soon", "Empty", "Out of Order", "Limited Bikes", "Healthy"];
    const colors = ["purple", "red", "orange", "blue", "green"];
    const labels = [];

    // Create legend labels with color indicators and station categories
    for (let i = 0; i < values.length; i++) {
      const color = colors[i];
      const value = values[i];

      labels.push(
        `<i style="background:${color}"></i>${value}`
      );
    }

    div.innerHTML = labels.join('<br>');
    return div;
  };

  // Add the legend to the map
  legend.addTo(map);
}

// Create the createMarkers function to populate station data on the map
function createMarkers(response1, response2) {
  // Pull the "stations" property from response data.
  const stations = response1.data.stations;
  const status = response2.data.stations;

  // Initialize layer groups for different station categories.
  let comingSoonGroup = L.layerGroup();
  let emptyStationsGroup = L.layerGroup();
  let outOfOrderGroup = L.layerGroup();
  let lowStationsGroup = L.layerGroup();
  let healthyStationsGroup = L.layerGroup();

  // Define marker icons for each station category
  var redMarker = L.ExtraMarkers.icon({
    icon: 'coffee',
    markerColor: 'red'
  });

  var orangeMarker = L.ExtraMarkers.icon({
    icon: 'bicycle',
    markerColor: 'orange'
  });

  var greenMarker = L.ExtraMarkers.icon({
    icon: 'bicycle',
    markerColor: 'green'
  });

  var blueMarker = L.ExtraMarkers.icon({
    icon: 'bicycle',
    markerColor: 'blue'
  });

  var purpleMarker = L.ExtraMarkers.icon({
    icon: 'bicycle',
    markerColor: 'purple'
  });

  // Loop through the stations array and categorize them based on their status
  for (let i = 0; i < stations.length; i++) {
    let station = stations[i];
    let statusInfo = status[i];

    let lat = station.lat;
    let lng = station.lon;

    let availableBikes = statusInfo.num_bikes_available;

    // Categorize stations and add them to the corresponding layer group
    if (statusInfo.is_installed === 0) {
      comingSoonGroup.addLayer(L.marker([lat, lng], { icon: purpleMarker }).bindPopup(`<strong>${station.name}</strong><br>Coming Soon`));
    } else if (availableBikes === 0) {
      emptyStationsGroup.addLayer(L.marker([lat, lng], { icon: redMarker }).bindPopup(`<strong>${station.name}</strong><br>Empty Station`));
    } else if (statusInfo.is_renting === 0) {
      outOfOrderGroup.addLayer(L.marker([lat, lng], { icon: orangeMarker }).bindPopup(`<strong>${station.name}</strong><br>Out of Order`));
    } else if (availableBikes < 5) {
      lowStationsGroup.addLayer(L.marker([lat, lng], { icon: blueMarker }).bindPopup(`<strong>${station.name}</strong><br>Low Station: ${availableBikes} Available Bikes`));
    } else {
      healthyStationsGroup.addLayer(L.marker([lat, lng], { icon: greenMarker }).bindPopup(`<strong>${station.name}</strong><br>Available Bikes: ${availableBikes}`));
    }
  }

  // Initialize the map with the categorized station groups
  init(comingSoonGroup, emptyStationsGroup, outOfOrderGroup, lowStationsGroup, healthyStationsGroup);
}

// Perform an API call to the Citi Bike API to get the station information.
// Call init and createMarkers when it completes.
let url = "https://gbfs.citibikenyc.com/gbfs/en/station_information.json";
d3.json(url)
  .then(data => {
    console.log(data);
    let statusUrl = "https://gbfs.citibikenyc.com/gbfs/en/station_status.json";
    d3.json(statusUrl)
      .then(statusData => {
        console.log(statusData);
        createMarkers(data, statusData);
      });
  });
