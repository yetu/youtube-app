/* global module */
/*
 * Viewer controller
 */
module.exports = (function($scope, $rootScope, ytYoutubeService, $filter, $routeParams, $window, Notification) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        if($routeParams.time) {
            data.video.startAt = $routeParams.time;
        }
        $scope.video = data.video;
        $scope.playlist = data.playlist;
    }, function(error) {
        // TODO: error handling
    });

    $scope.$on('app:search-value', function(event, query){
        var action = '#/dashboard/search/' + query;
        $window.location.href = action;
    });

    $rootScope.$on('appSendToTv:send', function(event, data){
        if(data.sent === true) {
            Notification.success({
                message: '"' + data.name + '" ' + $filter('translate')('has been sent to TV'),
                title: $filter('translate')('Play on TV')
            });
        } else {
            Notification.error({
                message: '"' + data.name + '" ' + $filter('translate')('has not been sent to TV'),
                title: $filter('translate')('Play on TV')
            });
        }
        
    });
});
