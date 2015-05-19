
module.exports = function (appMode) {
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
                scope.video = scope.playlist.items[index];
            };

            scope.playlistVisible = appMode.getView() === 'normal';
		}
	};
};