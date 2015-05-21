
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_playlistTemplate.html'),
		controller: function($scope) {
		},
		link: function(scope, element){
            $rootScope.$on('app:remote', function(event, data){
                console.debug('playlist', event, data);
            });
		}
	};
};