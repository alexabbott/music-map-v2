app.component('player', {
  templateUrl: '/components/player/player.html',
  controller: ['$rootScope', '$window', function($rootScope, $window) {

  	var ctrl = this;

  	$rootScope.setStation = function(url) {
	    document.getElementById('player').setAttribute('src', url + 
	          '&amp;auto_play=true&amp;hide_related=true&amp;show_comments=fakse&amp;show_user=faslse&amp;show_reposts=false&amp;visual=true');

	    $rootScope.nowPlaying = url;
	  }


	  ctrl.play = function() {
      var iframeElement   = document.getElementById('player');
      var iframeElementID = iframeElement.id;
      var widget1         = SC.Widget(iframeElement);
      console.log('play');
      widget1.play();

		  angular.element(document.querySelector('.play')).css('display', 'none');
    };
  }]
});