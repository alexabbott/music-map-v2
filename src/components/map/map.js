app.component('map', {
  templateUrl: '/components/map/map.html',
  controller: ['$mdSidenav', '$rootScope', function($mdSidenav, $rootScope) {
    var ctrl = this;

    $rootScope.stationsInRange = [];
    $rootScope.stationsNotInRange = [];

    function initMap() {
      $rootScope.map = new google.maps.Map(document.querySelector('#map'), {
        center: {lat: 40.729286, lng: -73.998625},
        zoom: 14
      });

      $rootScope.addMarker = function(coordinates, color, zIndex, radius) {
        var marker = new google.maps.Marker({
          position: coordinates,
          map: $rootScope.map,
          title: 'Hello World!',
          zIndex: zIndex
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
          console.log('in range', $rootScope.stationsInRange);
          console.log('not range', $rootScope.stationsNotInRange);
        }
      }

      $rootScope.stations.$loaded()
        .then(function(data) {
          console.log('loaded', data); // true


          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {


              $rootScope.currentUser = {};

              $rootScope.currentUser.coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              $rootScope.currentUser.latLng = new google.maps.LatLng($rootScope.currentUser.coordinates.lat, $rootScope.currentUser.coordinates.lng);

              $rootScope.map.setCenter($rootScope.currentUser.coordinates);
              $rootScope.addMarker($rootScope.currentUser.coordinates, '#00FF00', 99, 200);

              checkStationsInRange();

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
  }]
});