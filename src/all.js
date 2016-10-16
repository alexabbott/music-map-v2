var app = angular.module('musicMap', ['firebase', 'ngMaterial'])

.config(function() {
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyCbkeEXaO4af8IWp-IS2J3S9i62FrT0lNY",
    authDomain: "music-map-375d8.firebaseapp.com",
    databaseURL: "https://music-map-375d8.firebaseio.com",
    storageBucket: "",
    messagingSenderId: "41011732644"
  };

  firebase.initializeApp(config);
})

.run(['$firebaseArray', '$firebaseObject', '$rootScope', function($firebaseArray, $firebaseObject, $rootScope) {

  $rootScope.ref = firebase.database().ref();
  $rootScope.stations = $firebaseArray($rootScope.ref.child("stations"));
  $rootScope.users = $firebaseObject($rootScope.ref.child("users"));
  $rootScope.userStations = $firebaseObject($rootScope.ref.child("user-stations"));

}]);

app.component('mdHeader', {
  templateUrl: '/components/header/header.html',
  controller: ['$firebaseAuth', '$firebaseObject', '$rootScope', function($firebaseAuth, $firebaseObject, $rootScope) {

    var ctrl = this;

    $rootScope.authObj = $firebaseAuth();

    ctrl.signIn = function() {

      ctrl.currentUser = {};

      $rootScope.authObj.$signInWithPopup("google").then(function(result) {
        console.log("Signed in as:", result.user.uid);
        console.log('user', result.user);

        $rootScope.currentUser.uid = result.user.uid;
        $rootScope.currentUser.displayName = result.user.displayName;
        $rootScope.currentUser.photoURL = result.user.photoURL;

        ctrl.currentUser.uid = $rootScope.currentUser.uid;
        ctrl.currentUser.displayName = $rootScope.currentUser.displayName;
        ctrl.currentUser.photoURL = $rootScope.currentUser.photoURL;

        $rootScope.users[result.user.uid] = {
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        }
        $rootScope.users.$save();

      }).catch(function(error) {
        console.error("Authentication failed:", error);
      });
    }
  }]
});
app.component('map', {
  templateUrl: '/components/map/map.html',
  controller: ['$mdSidenav', '$rootScope', '$interval', function($mdSidenav, $rootScope, $interval) {
    var ctrl = this;

    $rootScope.stationsInRange = [];

    function initMap() {
      $rootScope.map = new google.maps.Map(document.querySelector('#map'), {
        center: {lat: 40.729286, lng: -73.998625},
        zoom: 14,
        disableDefaultUI: true
      });

      var infowindow = new google.maps.InfoWindow();

      $rootScope.addStationMarker = function(coordinates, color, radius, icon, name) {
        var marker = new google.maps.Marker({
          position: coordinates,
          map: $rootScope.map,
          zIndex: 1,
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

      $rootScope.addUserMarker = function(coordinates, icon) {
        $rootScope.currentUser.marker = new google.maps.Marker({
          position: coordinates,
          map: $rootScope.map,
          zIndex: 99,
          icon: icon,
          animation: google.maps.Animation.DROP,
          draggable: true
        });
      }

      $rootScope.stations.$loaded()
        .then(function(data) {

          $rootScope.currentUser = {};

          function checkStationsInRange() {
            for (var i = 0; i < $rootScope.stations.length; i++) {
              var stationLatLng = new google.maps.LatLng($rootScope.stations[i].coordinates.lat, $rootScope.stations[i].coordinates.lng);

              // check to see which stations are in range
              if (google.maps.geometry.spherical.computeDistanceBetween($rootScope.currentUser.latLng, stationLatLng) < $rootScope.stations[i].radius) {
                if ($rootScope.stationsInRange.indexOf($rootScope.stations[i]) === -1) {
                  $rootScope.stationsInRange.push($rootScope.stations[i]);
                }
              } else {
                if ($rootScope.stationsInRange.indexOf($rootScope.stations[i]) > -1) {
                  $rootScope.stationsInRange.splice($rootScope.stationsInRange.indexOf($rootScope.stations[i]), 1);
                }
              }
            }
          }

          function setUserCoordinates() {
            $rootScope.currentUser.latLng = new google.maps.LatLng($rootScope.currentUser.coordinates.lat, $rootScope.currentUser.coordinates.lng);
            $rootScope.map.panTo($rootScope.currentUser.coordinates);
          }

          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {

              $rootScope.currentUser.coordinates = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
              };
              setUserCoordinates();
              checkStationsInRange();
              $rootScope.addUserMarker($rootScope.currentUser.coordinates);

              // if there's a station in range, start playing it immediately
              if ($rootScope.stationsInRange.length > 0) {
                $rootScope.setStation($rootScope.stationsInRange[0].url);
              }

            }, function() {
              // handleLocationError(true, infoWindow, map.getCenter());
            })

            $interval(function(){
              navigator.geolocation.getCurrentPosition(function(position) {

                $rootScope.currentUser.coordinates = {
                  lat: position.coords.latitude,
                  lng: position.coords.longitude
                };
                setUserCoordinates();
                checkStationsInRange();
                $rootScope.currentUser.marker.setPosition($rootScope.currentUser.latLng);
                console.log('update user location', $rootScope.currentUser.marker.position.lat());

              }, function() {
                // handleLocationError(true, infoWindow, map.getCenter());
              })
            }, 5000);
          } else {
            // Browser doesn't support Geolocation
            // handleLocationError(false, infoWindow, map.getCenter());
          }
        })
        .catch(function(error) {
          console.error("Error:", error);
        });
    }

    // immediately initalize map and set markers
    initMap();

    // open side menu
    ctrl.openMenu = function() {
      $mdSidenav('right').open();
    };

    var stationIcon = {
      url: 'images/music-icon.png',
      size: new google.maps.Size(25, 25),
      origin: new google.maps.Point(0, 0),
      anchor: new google.maps.Point(12, 12)
    };

    // add markers as the stations are retrieved from the database
    $rootScope.stations.$watch(function(event) {
      if (event.event === 'child_added') {
        var newStationIndex = $rootScope.stations.$indexFor(event.key);
        $rootScope.addStationMarker($rootScope.stations[newStationIndex].coordinates, '#2D8A79', $rootScope.stations[newStationIndex].radius, stationIcon, $rootScope.stations[newStationIndex].name);
      }
    });
  }]
});
app.component('player', {
  templateUrl: '/components/player/player.html',
  controller: ['$rootScope', function($rootScope) {

  	$rootScope.setStation = function(url) {
	    document.getElementById('player').setAttribute('src', url + 
	          '&amp;auto_play=true&amp;hide_related=true&amp;show_comments=fakse&amp;show_user=faslse&amp;show_reposts=false&amp;visual=true');

	    $rootScope.nowPlaying = url;
	  }
  }]
});
app.component('sidenav', {
  templateUrl: '/components/sidenav/sidenav.html',
  controller: ['$timeout', '$rootScope', '$mdSidenav', '$firebaseObject', '$mdToast', function($timeout, $rootScope, $mdSidenav, $firebaseObject, $mdToast) {

    var ctrl = this;
    ctrl.stations = $rootScope.stationsInRange;

    ctrl.submitStatus = 'Submit';

    ctrl.submitStation = function() {

      if ($rootScope.currentUser.uid) {
        $rootScope.stations.$add({ 
          name: ctrl.currentUser.stationName,
          tags: ctrl.currentUser.stationTags,
          url: ctrl.currentUser.stationUrl,
          radius: 200,
          coordinates: {
            lat: $rootScope.currentUser.coordinates.lat,
            lng: $rootScope.currentUser.coordinates.lng,
          },
          user: {
            uid: $rootScope.currentUser.uid,
            displayName: $rootScope.currentUser.displayName,
          }
        });

        $rootScope.currentUser.stations = $firebaseObject($rootScope.ref.child("user-stations/" + $rootScope.currentUser.uid));

        $rootScope.currentUser.stations[ctrl.currentUser.stationName] = {
          tags: ctrl.currentUser.stationTags,
          url: ctrl.currentUser.stationUrl,
          radius: 200,
          coordinates: {
            lat: $rootScope.currentUser.coordinates.lat,
            lng: $rootScope.currentUser.coordinates.lng,
          }
        };

        $rootScope.currentUser.stations.$save().then(function(ref) {
          // reset inputs
          ctrl.currentUser.stationName = '';
          ctrl.currentUser.stationTags = '';
          ctrl.currentUser.stationUrl = '';

          // show toast and close side nav
          $mdSidenav('right').close();
          $mdToast.show(
            $mdToast.simple()
              .textContent('Station saved successfully!')
              .hideDelay(3000)
          );
        }, function(error) {
          console.log("Error:", error);
        });

      } else {
        alert('You must be signed in to submit a station!');
      }
    }

    $rootScope.$watch('nowPlaying', function() {
      ctrl.nowPlaying = $rootScope.nowPlaying;
    });

    ctrl.selectStation = function(url) {
      document.getElementById('player').setAttribute('src', url + 
            '&amp;auto_play=true&amp;hide_related=true&amp;show_comments=fakse&amp;show_user=faslse&amp;show_reposts=false&amp;visual=true');
    }

  }]
});