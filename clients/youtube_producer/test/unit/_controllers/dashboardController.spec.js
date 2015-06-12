/* global expect */

'use strict';

describe('dashboardController function', function() {
    var $rootScope,
        scope,
        $controller,
        ytYoutubeService,
        $q,
        $timeout,
        $location,
        $window,
        respond;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$rootScope_, _$controller_, _ytYoutubeService_, _$q_, _$timeout_, _$location_, _$window_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $q = _$q_;
        $timeout = _$timeout_;
        $location = _$location_;
        $window = _$window_;
        $window.config.dashboardCategories = [{id: 11, name: 'App Category 1'}, {id: 22, name: 'App Category 2'}];
        respond = {
            search: __fixtures__['_controllers/dashboard.search.response'],
            initCategories: __fixtures__['_controllers/dashboard.initCategories.response']
        };
    }));

    it('should be initialized with two defined categories', function() {
        var count = 0;
        spyOn(ytYoutubeService, "getResult").and.callFake(function() {
            var deferred = $q.defer();
            deferred.resolve(respond.initCategories[count]);
            count++;
            return deferred.promise;
        });
        $controller('DashboardCtrl', {$scope: scope});
        $rootScope.$digest();
        expect(ytYoutubeService.getResult.calls.count()).toBe(2);
        expect(ytYoutubeService.getResult).toHaveBeenCalledWith('popular', 11);
        expect(ytYoutubeService.getResult).toHaveBeenCalledWith('popular', 22);
        expect(scope.mainResultList.length).toBe(2);
        expect(scope.mainResultList[0].categoryId).toEqual(11);
        expect(scope.mainResultList[0].title).toEqual('App Category 1');
        expect(scope.mainResultList[1].categoryId).toEqual(22);
        expect(scope.mainResultList[1].title).toEqual('App Category 2');
    });

    it('should change location path when triggered by the search app directive', function() {
        var count = 0;
        spyOn(ytYoutubeService, "getResult").and.callFake(function() {
            var deferred = $q.defer();
            deferred.resolve(respond.initCategories[count]);
            count++;
            return deferred.promise;
        });
        spyOn($location, 'path').and.returnValue({search: function(){ return { replace: function(){}}}});
        $controller('DashboardCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('app:search-value', 'yetu');
        $rootScope.$digest();
        expect($location.path).toHaveBeenCalledWith('/dashboard/search/yetu');
    });

    it('should change location path when triggered by the search app reset directive', function() {
        var count = 0;
        spyOn(ytYoutubeService, "getResult").and.callFake(function() {
            var deferred = $q.defer();
            deferred.resolve(respond.initCategories[count]);
            count++;
            return deferred.promise;
        });
        spyOn($location, 'path').and.returnValue({search: function(){ return { replace: function(){}}}});
        $controller('DashboardCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('app:search-reset');
        $rootScope.$digest();
        expect($location.path).toHaveBeenCalledWith('/dashboard');
    });

    it('should show search results when appropriate routing parameters are present', function() {
        var deferred = $q.defer();
        deferred.resolve(respond.search);
        spyOn(ytYoutubeService, "getResult").and.returnValue(deferred.promise);
        $controller('DashboardCtrl', {$scope: scope, $routeParams: {action: 'search', param: 'testing'}});
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(1);
        expect(scope.searchQuery.value).toBe('testing');
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0].items[0].id).toBe(1234);
    });

    it('should show search results when appropriate routing parameters are present, but not react on the search directive event with the same value', function() {
        var deferred = $q.defer();
        deferred.resolve(respond.search);
        spyOn(ytYoutubeService, "getResult").and.returnValue(deferred.promise);
        $controller('DashboardCtrl', {$scope: scope, $routeParams: {action: 'search', param: 'testing'}});
        scope.$broadcast('app:search-value', 'testing');
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getResult).toHaveBeenCalled();
        expect(ytYoutubeService.getResult.calls.count()).toBe(1);
        expect(scope.searchQuery.value).toBe('testing');
        expect(scope.mainResultList.length).toBe(1);
        expect(scope.mainResultList[0].items[0].id).toBe(1234);
    });
});