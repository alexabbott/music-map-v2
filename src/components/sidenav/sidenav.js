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