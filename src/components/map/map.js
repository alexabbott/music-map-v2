app.component('map', {
  templateUrl: '/components/map/map.html',
  controller: ['$mdSidenav', '$rootScope', function($mdSidenav, $rootScope) {
    var ctrl = this;

    $rootScope.stationsInRange = [];
    $rootScope.stationsNotInRange = [];

    function initMap() {
      $rootScope.map = new google.maps.Map(document.querySelector('#map'), {
        center: {lat: 40.729286, lng: -73.998625},
        zoom: 14,
        disableDefaultUI: true
      });

      var infowindow = new google.maps.InfoWindow();

      $rootScope.addMarker = function(coordinates, color, zIndex, radius, icon, name) {
        var marker = new google.maps.Marker({
          position: coordinates,
          map: $rootScope.map,
          title: 'Hello World!',
          zIndex: zIndex,
          icon: icon
        });

        var radius = new google.maps.Circle({
          strokeColor: color,
          strokeOpacity: 0.8,
          strokeWeight: 2,
          fillColor: color,
          fillOpacity: 0.35,
          map: $rootScope.map,
          center: coordinates,
          radius: radius
        });

        google.maps.event.addListener(marker, 'click', function() {
          infowindow.setContent(name);
          infowindow.open($rootScope.map, marker);
        });

        google.maps.event.addListener($rootScope.map, 'click', function() {
          infowindow.close();
        });
      }

      function checkStationsInRange() {
        for (var i = 0; i < $rootScope.stations.length; i++) {
          var stationLatLng = new google.maps.LatLng($rootScope.stations[i].coordinates.lat, $rootScope.stations[i].coordinates.lng);

          // check to see which stations are in range
          if (google.maps.geometry.spherical.computeDistanceBetween($rootScope.currentUser.latLng, stationLatLng) < $rootScope.stations[i].radius) {
            $rootScope.stationsInRange.push($rootScope.stations[i]);
          } else if (google.maps.geometry.spherical.computeDistanceBetween($rootScope.currentUser.latLng, stationLatLng) > $rootScope.stations[i].radius) {
            $rootScope.stationsNotInRange.push($rootScope.stations[i]);
          }
        }
      }

      $rootScope.stations.$loaded()
        .then(function(data) {

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {

              $rootScope.currentUser = {};

              $rootScope.currentUser.coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              $rootScope.currentUser.latLng = new google.maps.LatLng($rootScope.currentUser.coordinates.lat, $rootScope.currentUser.coordinates.lng);

              $rootScope.map.setCenter($rootScope.currentUser.coordinates);

              $rootScope.addMarker($rootScope.currentUser.coordinates, '#FF0000', 99, 0);

              checkStationsInRange();

              // if there's a station in range, start playing it immediately
              if ($rootScope.stationsInRange) {
                $rootScope.setStation($rootScope.stationsInRange[0].url);
              }

            }, function() {
              // handleLocationError(true, infoWindow, map.getCenter());
            });
          } else {
            // Browser doesn't support Geolocation
            // handleLocationError(false, infoWindow, map.getCenter());
          }

        })
        .catch(function(error) {
          console.error("Error:", error);
        });
    }

    initMap();

    ctrl.openMenu = function() {
      $mdSidenav('right').open();
    };

    var stationIcon = {
      url: 'images/music-icon.png',
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(12, 12)
    }

    // add markers as the stations are retrieved from the database
    $rootScope.stations.$watch(function(event) {
      if (event.event === 'child_added') {
        var newStationIndex = $rootScope.stations.$indexFor(event.key);
        $rootScope.addMarker($rootScope.stations[newStationIndex].coordinates, '#2D8A79', 1, $rootScope.stations[newStationIndex].radius, stationIcon, $rootScope.stations[newStationIndex].name);
      }
    });
  }]
});