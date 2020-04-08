
var jsonfile = './data.json';
var data;

// This will let you use the .remove() function later on
if (!('remove' in Element.prototype)) {
  Element.prototype.remove = function() {
    if (this.parentNode) {
      this.parentNode.removeChild(this);
    }
  };
}

mapboxgl.accessToken = 'pk.eyJ1IjoicGMteHl6IiwiYSI6ImNrMHpza2JnazBkbWYzbmxneWhpNnV2dXoifQ.i1QwFXNsfP5Q5M2F2Zb85w';

// This adds the map to your page
var map = new mapboxgl.Map({
  // container id specified in the HTML
  container: 'map',
  // style URL
  style: 'mapbox://styles/mapbox/light-v10', 
  // initial position in [long, lat] format
  center: [-122.4194, 37.7749],
  // initial zoom
  zoom: 12
});

map.on('load', () => {
  fetch(jsonfile)
    .then(response => response.json())
    .then(data => {
      map.addSource('locations-list', {
        type: 'geojson',
        data: data
      });

      map.addLayer({
        'id': 'locations',
        'type': 'circle',
        // Add a GeoJSON source containing place coordinates and information.
        'source': {
          'type': 'geojson',
          'data': data
        },
        // layout: {
        //   'icon-image': 'circle-15',
        //   'icon-allow-overlap': true,
        // }
        'paint': {
          'circle-radius': 6,
          'circle-color': '#223b53',
          // 'circle-color': '#8abfc3', 
          'circle-stroke-color': 'white',
          'circle-stroke-width': 1,
          'circle-opacity': 0.5
        }
      });

      buildLocationList(data);

      map.on('click', function(e) {
        var features = map.queryRenderedFeatures(e.point, {
          layers: ['locations']
        });

        if (features.length) {
          var clickedPoint = features[0];
          // 1. Fly to the point
          flyToStore(clickedPoint);

          // 2. Close all other popups and display popup for clicked store
          createPopUp(clickedPoint);

          // 3. Highlight listing in sidebar (and remove highlight for all other listings)
         var activeItem = document.getElementsByClassName('active');
          if (activeItem[0]) {
            activeItem[0].classList.remove('active');
          }

          var selectedFeature = clickedPoint.properties.address;

          // for (var i = 0; i < stores.features.length; i++ ) {
          //   if (stores.features[i].properties.address === selectedFeature) {
          //       selectedFeatureIndex = i;
          //   }
          // }

          for (var i = 0; i < data.features.length; i++ ) {
            if (data.features[i].properties.address === selectedFeature) {
                selectedFeatureIndex = i;
            }
          }

          var listing = document.getElementById('listing-' + selectedFeatureIndex);
          listing.classList.add('active');
        }
      });
    });
});

function flyToStore(currentFeature) {
  map.flyTo({
    center: currentFeature.geometry.coordinates,
    zoom: 15
  });
}


function createPopUp(currentFeature) {
  var popUps = document.getElementsByClassName('mapboxgl-popup');
  if (popUps[0]) popUps[0].remove();

  var popup = new mapboxgl.Popup({closeOnClick: false})
    .setLngLat(currentFeature.geometry.coordinates)
    .setHTML(
      '<h3>' + currentFeature.properties.restaurant + '</h3>' +
      '<h4>' + '<em>' + 'Make your order via: ' + '<em>' + 
        (currentFeature.properties.online === 1 ? "<br> &middot; Online or Phone" : "") +
        (currentFeature.properties.pickup === 1 ? "<br> &middot; Pick-up" : "") +
        (currentFeature.properties.caviar === 1 ? "<br> &middot; Caviar" : "") +
        (currentFeature.properties.yelp === 1 ? "<br> &middot; Yelp" : "") +
        (currentFeature.properties.grubhub === 1 ? "<br> &middot; GrubHub" : "") +
        (currentFeature.properties.doordash === 1 ? "<br> &middot; DoorDash" : "") +
        (currentFeature.properties.postmates === 1 ? "<br> &middot; Postmates" : "") +
        (currentFeature.properties.ubereats === 1 ? "<br> &middot; UberEats" : "") +
      '</h4>')
    .addTo(map);
}


function buildLocationList(data) {
  for (i = 0; i < data.features.length; i++) {
    // Create an array of all the stores and their properties
    var currentFeature = data.features[i];
    // Shorten data.feature.properties to just `prop` so we're not
    // writing this long form over and over again.
    var prop = currentFeature.properties;
    // Select the listing container in the HTML
    var listings = document.getElementById('listings');
    // Append a div with the class 'item' for each store
    var listing = listings.appendChild(document.createElement('div'));
    listing.className = 'item';
    listing.id = "listing-" + i;

    // Create a new link with the class 'title' for each store
    // and fill it with the store address
    var link = listing.appendChild(document.createElement('a'));
    link.href = '#';
    link.className = 'title';
    link.dataPosition = i;
    link.innerHTML = prop.restaurant;

    // Create a new div with the class 'details' for each store
    // and fill it with the city and phone number
    var details = listing.appendChild(document.createElement('div'));
    details.innerHTML = prop.cuisine;
    if (prop.input_address) {
      details.innerHTML += ' &middot; ' + prop.input_address;
    } 

    link.addEventListener('click', function(e) {
      // Update the currentFeature to the store associated with the clicked link
      var clickedListing = data.features[this.dataPosition];

      // 1. Fly to the point associated with the clicked link
      flyToStore(clickedListing);

      // 2. Close all other popups and display popup for clicked store
      createPopUp(clickedListing);

      // 3. Highlight listing in sidebar (and remove highlight for all other listings)
      var activeItem = document.getElementsByClassName('active');

      if (activeItem[0]) {
        activeItem[0].classList.remove('active');
      }
      this.parentNode.classList.add('active');

    });
  }
}