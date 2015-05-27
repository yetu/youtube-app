/* global expect */

'use strict';

describe('dashboardController function', function() {
    var $rootScope,
        scope,
        $controller,
        ytYoutubeService,
        $timeout,
        $location,
        $window,
        respond = {
            search: {
                title: 'parent title',
                categoryId: 11, // TODO: separate 2 different answers
                items: [{
                    type: 'video',
                    id: 1234,
                    title: 'title',
                    description: '...'
                }]
            }
        };

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$rootScope_, _$controller_, _ytYoutubeService_, $q, _$timeout_, _$location_, _$window_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        $location = _$location_;
        $window = _$window_;
        var deferred = $q.defer();
        deferred.resolve(respond.search);
        // TODO: remove default spy from here - no failure path nor other results are able to define
        spyOn(ytYoutubeService, "getResult").and.returnValue(deferred.promise);
        $window.config.dashboardCategories = [{id: 11, name: 'Category 1'}, {id: 22, name: 'Category 2'}];
    }));

    it('should be initialized with two defined categories', function() {
        $controller('DashboardCtrl', {$scope: scope});
        $rootScope.$digest();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(2);
        expect(scope.mainResultList.length).toBe(2);
        expect(scope.mainResultList[0]).toEqual(respond.search);
        // TODO: check order of result sets and replacing titles to defined category names
    });

    it('should change location path when triggered by the search app directive', function() {
        spyOn($location, 'path');
        $controller('DashboardCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('app:search-value', 'yetu');
        $rootScope.$digest();
        expect($location.path).toHaveBeenCalledWith('/dashboard/search/yetu');
    });

    it('should show search results when appropriate routing parameters are present', function() {
        $controller('DashboardCtrl', {$scope: scope, $routeParams: {action: 'search', param: 'testing'}});
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(1);
        expect(scope.searchValue).toBe('testing');
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0].items[0].id).toBe(1234);
    });

    it('should show search results when appropriate routing parameters are present, but not react on the search directive event with the same value', function() {
        $controller('DashboardCtrl', {$scope: scope, $routeParams: {action: 'search', param: 'testing'}});
        scope.$broadcast('app:search-value', 'testing');
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(1);
        expect(scope.searchValue).toBe('testing');
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0].items[0].id).toBe(1234);
    });
});