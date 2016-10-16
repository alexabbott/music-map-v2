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