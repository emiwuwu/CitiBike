let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Create the initMap function.
function init(comingSoonGroup, emptyStationsGroup,outOfOrderGroup,lowStationsGroup,healthyStationsGroup) {
  // Create the tile layer that will be the background of our map.
  const lightmap = L.tileLayer("https://api.maptiler.com/maps/basic-v2-light/{z}/{x}/{y}.png?key=SrVNfxrBOyXCH5tXK2VC", {
    attribution: 'Map data &copy; <a href="https://www.maptiler.com/">MapTiler</a>'
  });

  
  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps = {
    "Lightmap": lightmap
  };

  // Create overlayMaps object.
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
    layers: [lightmap,comingSoonGroup, emptyStationsGroup,outOfOrderGroup,lowStationsGroup,healthyStationsGroup]
  });

  // Add overlayMaps to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(map);

  // Create a legend for data
const legend = L.control({ position: 'bottomright' });
legend.onAdd = function (map) {
const div = L.DomUtil.create('div', 'info legend');
const values = ["Coming Soon","Empty", "Out of Order", "Limited Bikes", "Healthy"];
const colors = ["purple", "red", "orange", "blue", "green"];
const labels = [];

// Create legend labels with color indicators and depth ranges
for (let i = 0; i < values.length; i++) {
    const color = colors[i];
    const value= values[i]

    labels.push(
        `<i style="background:${color}"></i>${value}`
    );
}

div.innerHTML =  labels.join('<br>');
return div;
};

// Add the legend to the map
legend.addTo(map);

}

// Create the createMarkers function.
function createMarkers(response1, response2) {

  // Pull the "stations" property from response.data.
  const stations = response1.data.stations;
  const status = response2.data.stations;

  // Initialize layer groups for different categories.
  let comingSoonGroup = L.layerGroup();
  let emptyStationsGroup = L.layerGroup();
  let outOfOrderGroup = L.layerGroup();
  let lowStationsGroup = L.layerGroup();
  let healthyStationsGroup = L.layerGroup();

  // Creates extra markers
  var redMarker = L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "red",
    shape: "circle"
  });

  var orangeMarker = L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "orange",
    shape: "circle"
  });

  var greenMarker = L.ExtraMarkers.icon({
    icon: "ion-android-bicycle",
    iconColor: "white",
    markerColor: "green",
    shape: "circle"
  });

  var blueMarker = L.ExtraMarkers.icon({
    icon: "ion-minus-circled",
    iconColor: "white",
    markerColor: "blue-dark",
    shape: "penta"
  });

  var purpleMarker = L.ExtraMarkers.icon({
    icon: "ion-settings",
    iconColor: "white",
    markerColor: "purple",
    shape: "star"
  });

  // let icons = {
  //   COMING_SOON: L.ExtraMarkers.icon({
  //     icon: "ion-settings",
  //     iconColor: "white",
  //     markerColor: "yellow",
  //     shape: "star"
  //   }),
  //   EMPTY: L.ExtraMarkers.icon({
  //     icon: "ion-android-bicycle",
  //     iconColor: "white",
  //     markerColor: "red",
  //     shape: "circle"
  //   }),
  //   OUT_OF_ORDER: L.ExtraMarkers.icon({
  //     icon: "ion-minus-circled",
  //     iconColor: "white",
  //     markerColor: "blue-dark",
  //     shape: "penta"
  //   }),
  //   LOW: L.ExtraMarkers.icon({
  //     icon: "ion-android-bicycle",
  //     iconColor: "white",
  //     markerColor: "orange",
  //     shape: "circle"
  //   }),
  //   NORMAL: L.ExtraMarkers.icon({
  //     icon: "ion-android-bicycle",
  //     iconColor: "white",
  //     markerColor: "green",
  //     shape: "circle"
  //   })
  // };

  // Loop through the stations array.
  for (let i = 0; i < stations.length; i++) {
    let station = stations[i];
    let statusInfo = status[i];

    let lat = station.lat;
    let lng = station.lon;

    let availableBikes = statusInfo.num_bikes_available;

    if (statusInfo.is_installed === 0) {
      comingSoonGroup.addLayer(L.marker([lat, lng], { icon: purpleMarker}).bindPopup(`<strong>${station.name}</strong><br>Coming Soon`));
    } else if (availableBikes === 0) {
      emptyStationsGroup.addLayer(L.marker([lat, lng], { icon:redMarker}).bindPopup(`<strong>${station.name}</strong><br>Empty Station`));
    } else if (statusInfo.is_renting === 0) {
      console.log('orange');
      outOfOrderGroup.addLayer(L.marker([lat, lng], {icon: orangeMarker}).bindPopup(`<strong>${station.name}</strong><br>Out of Order`));
    } else if (availableBikes < 5) {
      lowStationsGroup.addLayer(L.marker([lat, lng], { icon: blueMarker}).bindPopup(`<strong>${station.name}</strong><br>Low Station: ${availableBikes} Available Bikes`));
    } else {
      healthyStationsGroup.addLayer(L.marker([lat, lng], { icon: greenMarker}).bindPopup(`<strong>${station.name}</strong><br>Available Bikes: ${availableBikes}`));
    }
  }

  init(comingSoonGroup, emptyStationsGroup,outOfOrderGroup,lowStationsGroup,healthyStationsGroup);
}

// Perform an API call to the Citi Bike API to get the station information.
// Call initMap and createMarkers when it completes.
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


