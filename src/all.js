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
  // download the data into a local object
  $rootScope.stations = $firebaseArray($rootScope.ref.child("stations"));
  $rootScope.users = $firebaseObject($rootScope.ref.child("users"));
  $rootScope.userStations = $firebaseObject($rootScope.ref.child("user-stations"));
  // synchronize the object with a three-way data binding

  $rootScope.stations.$watch(function(event) {
    if (event.event === 'child_added') {
      var newStationIndex = $rootScope.stations.$indexFor(event.key);
      $rootScope.addMarker($rootScope.stations[newStationIndex].coordinates, '#FF0000', 1, $rootScope.stations[newStationIndex].radius);
    }
  });

  $rootScope.setStation = function(url) {
    document.getElementById('player').setAttribute('src', url + 
          '&amp;auto_play=true&amp;hide_related=true&amp;show_comments=fakse&amp;show_user=faslse&amp;show_reposts=false&amp;visual=true');

    $rootScope.nowPlaying = url;
  }

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
app.component('player', {
  templateUrl: '/components/player/player.html',
  controller: function() {
  }
});
app.component('sidenav', {
  templateUrl: '/components/sidenav/sidenav.html',
  controller: ['$timeout', '$rootScope', '$mdSidenav', '$firebaseObject', function($timeout, $rootScope, $mdSidenav, $firebaseObject) {

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

          // change button to show saved status and close side nav
          ctrl.submitStatus = 'Saved!';
          $timeout(function(){
            ctrl.submitStatus = 'Submit';
            $mdSidenav('right').close();
          }, 2000);
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