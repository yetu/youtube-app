/*jshint -W083 */
/* global module, config */

/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, $rootScope, $filter, appRemoteControlService) {

    if($routeParams.action === 'search' && $routeParams.param) {
        $rootScope.searchValue = $routeParams.param;
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
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
        $location.path('/dashboard/search/' + query);
    });

    $rootScope.$on('app:search-reset', function(){
        $location.path('/dashboard');
    });
});