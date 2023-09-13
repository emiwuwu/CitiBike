let newYorkCoords = [40.73, -74.0059];
let mapZoomLevel = 12;

// Create the createMap function.
function createMap(bikeStations){
  // Create the tile layer that will be the background of our map.
  const lightmap= L.tileLayer("https://api.maptiler.com/maps/basic-v2-light/{z}/{x}/{y}.png?key=SrVNfxrBOyXCH5tXK2VC", {
    attribution:'Map data &copy; <a href="https://www.maptiler.com/">MapTiler</a>'
  });

  // Create a baseMaps object to hold the lightmap layer.
  let baseMaps={
    "Lightmap": lightmap
  };

  // Create an overlayMaps object to hold the bikeStations layer.
  let overlayMaps = {
    "Bike Stations": bikeStations
  };

  // Create the map object with options.
  let map = L.map("map-id", {
    center: newYorkCoords,
    zoom: mapZoomLevel, 
    layers: [lightmap, bikeStations]
  });

  // Create a layer control, and pass it baseMaps and overlayMaps. Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps).addTo(map);
}

// Create the createMarkers function.
function createMarkers(response){
  // Pull the "stations" property from response.data.
  const stations= response.data.stations
  // Initialize an array to hold the bike markers.
  let bikeMarkers = [];
  // Loop through the stations array.
  for (let s of stations){
    let lat= s.lat;
    let lng = s.lon;
    // For each station, create a marker, and bind a popup with the station's name.
    let marker= L.marker([lat, lng]).bindPopup(`<strong>${s.name}</strong>`);
    // Add the marker to the bikeMarkers array.
    bikeMarkers.push(marker);
  }
  // Create a layer group that's made from the bike markers array, and pass it to the createMap function.
  const bikeStations= L.layerGroup(bikeMarkers);
  createMap(bikeStations);
}

// Perform an API call to the Citi Bike API to get the station information. 
// Call createMarkers when it completes.
let url= "https://gbfs.citibikenyc.com/gbfs/en/station_information.json"
d3.json(url)
  .then(data => {
    console.log(data);
    createMarkers(data);
  });