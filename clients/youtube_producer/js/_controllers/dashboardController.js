/*jshint -W083 */
/* global module, config */

/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, appMode, $rootScope, $filter) {
    
    if($routeParams.action === 'search' && $routeParams.param) {
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
    } else {
        var cid, list = [], order = [],
            cat_no = config.dashboardCategories.length;
        // default categories view
        $scope.mainResultList = [];
        // TODO: handle no categories defined
        for(var i = 0; i < cat_no; i++) {
            cid = config.dashboardCategories[i].id;
            order.push(cid);
            ytYoutubeService.getResult('popular', cid).then(function(data) {
                data.order = order.indexOf(data.categoryId);
                // overwrite youtube category name with configured one
                data.title = config.dashboardCategories[data.order].name;
                list.push(data);
                if(cat_no === list.length) {
                    // TODO: decide if defined order of categories is more important than loading time
                    // in this case sort and assigng at once after load all
                    $filter('orderBy')(list, 'order');
                    $scope.mainResultList = list;
                }
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