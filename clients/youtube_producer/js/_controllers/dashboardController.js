/* global module */
/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, appMode, $rootScope) {
    // dummy init list
    var dummyItem = [];
    for(i = 0; i < 8; i++) {
        dummyItem.push({ description: 'To be implemented...'});
    }
    $scope.mainResultList = [
        { title: 'Category 1', items: [dummyItem[0], dummyItem[1], dummyItem[2], dummyItem[3]]},
        { title: 'Category 2', items: [dummyItem[4], dummyItem[5], dummyItem[6], dummyItem[7]]}
    ];

    if($routeParams.action === 'search' && $routeParams.param) {
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
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