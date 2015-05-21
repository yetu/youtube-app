/* global module */
/*
 * Viewer controller
 */
module.exports = (function($scope, ytYoutubeService, appMode, $routeParams, $window) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        $scope.video = data.video;
        $scope.playlist = data.playlist;
    }, function(error) {
        // TODO: error handling
    });

    $scope.$on('app:search-value', function(event, query){
        var action = '#/dashboard/search/' + query;
        $window.location.href = action;
    });
});
