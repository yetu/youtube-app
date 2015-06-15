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
        data.playlist.currentPlaying = 0;
        $scope.playlist = [data.playlist];
    }, function(error) {
        // TODO: error handling
    });

    $rootScope.$on('app:search-value', function(event, query){
        var action = '/dashboard/search/' + query;
        $location.path(action);
    });

    appRemoteControlService.setController('viewer-' + $routeParams.mode, function(action, name) {
        if(action === 'back' && name === 'player' && $routeParams.mode === 'fullscreen') {
            var url = '/dashboard';
            if($rootScope.searchQuery && $rootScope.searchQuery.value) {
                url += '/search/' + $rootScope.searchQuery.value;
            }
            $location.path(url);
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
