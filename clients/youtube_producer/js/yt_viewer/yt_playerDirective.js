module.exports = function($window, $rootScope, appMode) {
	'use strict';
	return {
		restrict: 'E',
		template: require('./yt_playerTemplate.html'),
        controller: function($scope) {
        },
		link: function(scope, element, attrs) {
			var _unbinder = [],
                player,
                firstScriptTag = document.getElementsByTagName('script')[0];

            scope.playerAPI = {
                ready: false,
                initialized: false
            };

            $window.onYouTubeIframeAPIReady = function() {
                scope.playerAPI.ready = true;
                $rootScope.YTloaded = true;
            };
            
            if(!$rootScope.YTloaded) {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            var initPlayer = function() {
                scope.playerAPI.initialized = true;
                player = new YT.Player('yt-player', {
                    //height: '1080',
                    //width: '1920',
                    playerVars: {
                        autoplay: 0,
                        controls: appMode.isPC() ? 1 : 0,
                        showinfo: 0
                    },
                    videoId: scope.video.id,
                    events: {
                        //onStateChange: onStateChange,
                        //onReady: onReady
                    }
                });
            };

            var loadVideo = function() {
                player.loadVideoById(scope.video.id);
            };

            _unbinder.push(scope.$watchCollection('playerAPI', function(n) {
				if(n.ready && scope.video && !n.initialized) {
                    initPlayer();
                }
			}));

            _unbinder.push(scope.$watch('video', function(n, o) {
				if(n && (scope.playerAPI.ready || YT && YT.loaded) && !scope.playerAPI.initialized) {
                    initPlayer();
                }
                if(n && o && n.id !== o.id) {
                    loadVideo();
                }
			}));

			scope.$on('$destroy', function() {
				player = null;
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
			});
		}
	};
};
