/* global expect */

'use strict';

describe('dashboardController function', function() {
    var scope,
        $controller,
        ytYoutubeService,
        $timeout,
        $window,
        respond = {
            search: {
                title: 'parent title',
                items: [{
                    type: 'video',
                    id: 1234,
                    title: 'title',
                    description: '...'
                }]
            }
        };

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function($rootScope, _$controller_, _ytYoutubeService_, $q, _$timeout_, _$window_) {
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        $window = _$window_;
        var deferred = $q.defer();
        deferred.resolve(respond.search);
        // TODO: remove default spy from here - no failure path nor other results are able to define
        spyOn(ytYoutubeService, "getResult").and.returnValue(deferred.promise);
        $window.config.dashboardCategories = [{id: 11, title: 'Category 1'}, {id: 22, title: 'Category 2'}];
    }));

    it('should be initialized with two defined categories', function() {
        $controller('DashboardCtrl', {$scope: scope});
        scope.$digest();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(2);
        expect(scope.mainResultList.length).toBe(2);
        expect(scope.mainResultList[0]).toEqual(respond.search);
    });

    it('should show search results when triggered by the search app directive', function() {
        $controller('DashboardCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        scope.$broadcast('app:search-value', 'yetu');
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(3); // including initial categories
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0].items[0].id).toBe(1234);
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