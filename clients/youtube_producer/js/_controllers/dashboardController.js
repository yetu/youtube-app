/*jshint -W083 */
/* global module */
/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, appMode, $rootScope) {
    
    if($routeParams.action === 'search' && $routeParams.param) {
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
    } else {
        // default categories view
        $scope.mainResultList = [];
        // TODO: handle no categories defined
        for(var i = 0; i < config.dashboardCategories.length; i++) {
            ytYoutubeService.getResult('popular', config.dashboardCategories[i].id, 4).then(function(data) {
                $scope.mainResultList.push(data);
            });
        }
        // TODO: seems always the same videos - should be rerquested more and shuffle?
    }

    $scope.$on('app:search-value', function(event, query){
        // temporary start search here but not again for search in url
        if($routeParams.action === 'search' && $routeParams.param === query) {
            return;
        }
        ytYoutubeService.getResult('search', query).then(function(data) {
            $scope.mainResultList = [data];
        });
        /* TODO: make path replace without reload
        var action = '#/dashboard/search/' + query;
        if(decodeURIComponent(window.location.hash) !== action) {
            window.location = action; // replace with $location
        }
        */
    });
});