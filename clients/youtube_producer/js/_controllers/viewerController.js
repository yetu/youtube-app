/* global module */
/*
 * Viewer controller
 */
module.exports = (function($scope, $rootScope, ytYoutubeService, $filter, $routeParams, $location, appRemoteControlService, Notification) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        if($routeParams.time) {
            data.video.startAt = $routeParams.time.replace(/&.+/, ''); // TODO: do it with $routeProvider?
        }
        $scope.video = data.video;
        $scope.playlist = data.playlist;
        $scope.playlist.currentPlaying = 0;
    }, function(error) {
        // TODO: error handling
    });

    $rootScope.$on('app:search-value', function(event, query){
        var action = '/dashboard/search/' + query;
        $location.path(action);
    });

    appRemoteControlService.setController('viewer-' + $routeParams.mode, function(action, name) {
        if(action === 'quit' && name === 'player' && $routeParams.mode === 'fullscreen') {
            var action = '/dashboard';
            if($rootScope.searchValue) {
                action += '/search/' + $rootScope.searchValue;
            }
            $location.path(action);
        }
    });

    $rootScope.$on('appSendToTv:send', function(event, data){
        if(data.sent !== true) {
            Notification.error({
                message: $filter('translate')('The video could not be played on TV. Please retry later.'),
                title: $filter('translate')('Play video on TV')
            });
        }
    });
});
