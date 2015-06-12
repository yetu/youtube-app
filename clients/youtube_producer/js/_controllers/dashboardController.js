/*jshint -W083 */
/* global module, config */

/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $route, $routeParams, $location, $rootScope, $filter, appRemoteControlService) {

    var startSearch = function(value) {
        ytYoutubeService.getResult('search', value).then(function(data) {
            $scope.mainResultList = [data];
        });
    };

    if($routeParams.action === 'search' && $routeParams.param) {
        $rootScope.searchQuery = { value: $routeParams.param };
        startSearch($routeParams.param);
    } else {
        var categoryId, list = [], order = [],
            numberOfCategories = config.dashboardCategories.length;
        // default categories view
        $scope.mainResultList = [];
        // TODO: handle no categories defined
        for(var i = 0; i < numberOfCategories; i++) {
            categoryId = config.dashboardCategories[i].id;
            order.push(categoryId);
            ytYoutubeService.getResult('popular', categoryId).then(function(data) {
                data.order = order.indexOf(data.categoryId);
                // overwrite youtube category name with configured one
                data.title = config.dashboardCategories[data.order].name;
                list.push(data);
                if(numberOfCategories === list.length) {
                    // TODO: decide if defined order of categories is more important than loading time
                    // in this case sort and assigng at once after load all
                    $scope.mainResultList = $filter('orderBy')(list, 'order');
                }
            });
        }
        // TODO: seems always the same videos - should be rerquested more and shuffle?
    }

    appRemoteControlService.setController('dashboard', function(action, name) {

    });

    $rootScope.$on('app:search-value', function(event, query){
        var url = '/dashboard/search/' + query;
        if(url === $location.path()) {
            startSearch(query);
        } else {
            $location.path(url);
        }
    });

    $rootScope.$on('app:search-reset', function(){
        $location.path('/dashboard');
    });
});