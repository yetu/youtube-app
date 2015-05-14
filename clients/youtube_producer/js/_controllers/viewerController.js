/* global module */
module.exports = (function($scope, ytYoutubeService, appMode, $rootScope, $routeParams) {

    // temporary
    $rootScope.temporaryMode = appMode.get() + 'mode';
    $rootScope.temporaryType = $routeParams.mode;

    $scope.$on('app:search-value', function(event, query){
        // TODO: route to dashboard/search
    });
});
