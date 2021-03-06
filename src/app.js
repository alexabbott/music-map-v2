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
