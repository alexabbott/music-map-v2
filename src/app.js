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
