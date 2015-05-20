'use strict';

describe('dashboardController function', function() {
    var scope,
        $controller,
        ytYoutubeService,
        $timeout,
        respond = {
            search: [
                {
                    type: 'video',
                    id: 1234
                }
            ]
        };

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function($rootScope, _$controller_, _ytYoutubeService_, $q, _$timeout_) {
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        var deferred = $q.defer();
        deferred.resolve(respond.search);
        spyOn(ytYoutubeService, "getResult").and.returnValue(deferred.promise);
    }));

    it('should be initialized with two categories with dummy items', function() {
        $controller('DashboardCtrl', {$scope: scope});
        expect(scope.mainResultList.length).toBe(2);
        expect(scope.mainResultList[0].title).toBe('Category 1');
        expect(scope.mainResultList[0].items[0].description).toBe('To be implemented...');
    });

    it('should show search results when triggered by the search app directive', function() {
        $controller('DashboardCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        scope.$broadcast('app:search-value', 'yetu');
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(1);
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0][0].id).toBe(1234);
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
        expect(scope.mainResultList[0][0].id).toBe(1234);
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
        expect(scope.mainResultList[0][0].id).toBe(1234);
    });
});