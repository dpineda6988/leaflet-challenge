// Create the base map object
let myMap = L.map("map", {
    center: [25, 0],
    zoom: 2.5
  });
  
  // Add the tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(myMap);


// Function to create markers based on a GeoJSON that is passed
function createEarthquakeMarkers(data) {
    // Create popup that shows the location, time, magnitude, and depth of an earthquake when the marker is clicked
    function onEachFeature (feature, layer) {
        layer.bindPopup(`<h3>${feature.properties.place}</h3><hr>\
            <p>${new Date(feature.properties.time)}</p>\
            <p>Magnitude: ${feature.properties.mag}</p>\
            <p>Depth: ${feature.geometry.coordinates[2]}`);
    }
    // Returns the color of the marker based on the earthquake depth that is passed
    function chooseColor (depth) {
        if (depth > 90) return "#690202";
        if (depth <= 90 && depth > 70) return "#B01E03";
        if (depth <= 70 && depth > 50) return "#FF6204";
        if (depth <= 50 && depth > 30) return "#FDA500";
        if (depth <= 30 && depth > 10) return "#FFCE03";
        else return "#F7FF00";
    }

    // Returns the radius of the circle marker as a multiple of the magnitude that is passed 
    function chooseRadius (magnitude) {
        return magnitude*5;
    }
    // Formats markers to be circles that vary in size and color based upon the earthquake's magnitude and depth
    function createCircles (feature, latlng) {
        return L.circleMarker(latlng, {
            color: "gray",
            fillColor: chooseColor(feature.geometry.coordinates[2]),
            fillOpacity: 0.7,
            radius: chooseRadius(feature.properties.mag),
            weight: 1,
        })
    }

    // Adds markers to the map as a geoJSON layer with marker attributes determined by calling the above functions
    let earthquakes = L.geoJSON(data.features, {
        onEachFeature: onEachFeature,
        pointToLayer: createCircles
    }).addTo(myMap);


}

// Call API for GeoJSON data and call the createMarkers function to populate markers onto the map
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(createEarthquakeMarkers);


// Create a layer for the legend, positioned at the bottom right of the map
let legend = L.control({ position: "bottomright" });

// Determines style and format of the legend layer upon adding it to the map
legend.onAdd = function() {
    let div = L.DomUtil.create("div", "legend"); // Creates a new div to hold the legend
    div.innerHTML = "<h4>Depth</h4>" // Set legend title
    let categories = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+']; //  Array storing the category labels
    let colors = ["#F7FF00", "#FFCE03", "#FDA500", "#FF6204", "#B01E03", "#690202"]; // Array storing the corresponding colors
    let labels = []; // Array to hold the html of each formatted legend label

    // Populate the 'labels' array by looping through the 'categories' array and pushing strings of HTML code for each legend label
    categories.forEach(function(category, index) {
        labels.push("<i style=\"background: " + colors[index] + "\"></i><span>" + category + "</span>");
    });

    // Add the HTML code stores in 'labels' aray to the div holding the legend
    div.innerHTML += labels.join("<br>");
    return div;
};

// Adds the legend to the map
legend.addTo(myMap);