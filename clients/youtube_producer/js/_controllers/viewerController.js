/* global module */
module.exports = (function($scope, $rootScope, ytYoutubeService, $routeParams, appRemoteControlService) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        $scope.video = data.video;
        $scope.playlist = data.playlist;
    }, function(error) {
        // TODO: error handling
    });

    appRemoteControlService.setController('viewer', function(action, name) {
        console.debug('appRemoteControlService.callback', action, name);
        if(action === 'back' && name === 'player' && $routeParams.mode === 'fullscreen') {
            var url = ['#', 'view', 'normal', $routeParams.type, $routeParams.id, 'tv'].join('/');
            console.debug('route to url', url);
            window.location = url; // TODO: replace with $location
            window.location.reload();
        }
    });

    $scope.$on('app:search-value', function(event, query){
        var url = '#/dashboard/search/' + query;
        window.location = url; // TODO: replace with $location
    });
});
