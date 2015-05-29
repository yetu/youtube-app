
module.exports = function ($timeout, appMode) {
	return {
		restrict: 'E',
		template: require('./yt_viewerTemplate.html'),
        scope: {
            class: '@class',
            video: '=videoModel',
            playlist: '=playlistModel'
        },
		controller: function($scope) {
		},
		link: function(scope, element){

            scope.playVideo = function(index) {
                // check if exists and is contains video id (dummy unavailable list handling)
                if(scope.playlist.items[index] && scope.playlist.items[index].id) {
                    scope.activatePlaylistItem(index, scope.playlist.currentPlaying);
                    scope.playlist.currentPlaying = index;
                    scope.video = scope.playlist.items[index];
                }
            };

            scope.activatePlaylistItem = function(curr, prev) {
                var items = element.find('ui-video-list-item');
                if(prev !== 'undefined' && items[prev]) {
                    angular.element(items[prev]).removeClass('playing');
                }
                if(items[curr]) {
                    angular.element(items[curr]).addClass('playing');
                }
            };
            
            scope.$watch('playlist', function(n) {
                if(n) {
                    // activate (styling) first playlist item after rendering
                    $timeout(function(){
                        scope.activatePlaylistItem(0);
                    });
                }
            });

            scope.playlistVisible = appMode.getView() === 'normal';
		}
	};
};