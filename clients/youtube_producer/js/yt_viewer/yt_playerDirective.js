module.exports = function(ytPlayerConfig, $window, $rootScope, appMode) {
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

            scope.player = {
                API: {
                    loaded: false,
                    initialized: false,
                    ready: false
                },
                info: {
                    actTime: 0,
                    percentage: 0
                }
            };

            $window.onYouTubeIframeAPIReady = function() {
                scope.player.API.loaded = true;
                $rootScope.YTloaded = true;
                angular.element($window).on('message', receiveMessage);
            };

            if(!$rootScope.YTloaded) {
                var tag = document.createElement('script');
                tag.src = ytPlayerConfig.origin + ytPlayerConfig.api;
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            var initPlayer = function() {
                scope.player.API.initialized = true;
                player = new YT.Player('yt-player', {
                    //height: '1080',
                    //width: '1920',
                    playerVars: {
                        autoplay: 1,
                        controls: appMode.isPC() ? 1 : 0,
                        showinfo: 0
                    },
                    videoId: scope.video.id,
                    events: {
                        onReady: function() {
                            scope.player.API.ready = true;
                        }
                    }
                });
            };

            var loadVideo = function() {
                player.loadVideoById(scope.video.id);
            };

            var receiveMessage = function(message) {
                if(message.origin !== ytPlayerConfig.origin) {
                    // ignore other origin messages
                    return;
                }
                var data = angular.fromJson(message.data);
                switch(data.event) {
                    case 'initialDelivery': {
                        scope.player.info.duration = data.info.duration;
                        break;
                    }
                    case 'infoDelivery': {
                        if(data.info.currentTime) {
                            var actTime = +data.info.currentTime;
                            scope.player.info.actTime = actTime;
                            scope.player.info.percentage = Math.round(actTime / scope.player.info.duration * 100);
                            scope.video.actTime = parseInt(scope.player.info.actTime); // update model for send button
                        }
                        if(data.info.playerState) {
                            scope.player.info.isPlaying = data.info.playerState === YT.PlayerState.PLAYING;
                        }
                        break;
                    }
                }
            };

            _unbinder.push(scope.$watchCollection('player.API', function(n) {
                if(n.loaded && scope.video && !n.initialized) {
                    initPlayer();
                }
            }));

            _unbinder.push(scope.$watch('video', function(n, o) {
                if(n && (scope.player.API.loaded || YT && YT.loaded) && !scope.player.API.initialized) {
                    initPlayer();
                }
                if(n && o && n.id !== o.id) {
                    loadVideo();
                }
            }));

            scope.$on('$destroy', function() {
                player = null;
                angular.element($window).off('message', receiveMessage);
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};
