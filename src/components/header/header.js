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