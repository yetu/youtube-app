'use strict';

describe('viewerController function', function() {
    var $rootScope,
        scope,
        $controller,
        ytYoutubeService,
        $timeout,
        $location,
        respond = {
            details: {
                video: ['video 1'],
                playlist: ['playlist']
            }
        };

    beforeEach(module('youtubeApp', function($provide) {
        $provide.value('$window', {location: {href: 'dummy'}});
    }));

    beforeEach(inject(function(_$rootScope_, _$controller_, _ytYoutubeService_, _$location_, $q, _$timeout_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        $location = _$location_;
        var deferred = $q.defer();
        deferred.resolve(respond.details);
        spyOn(ytYoutubeService, "getDetails").and.returnValue(deferred.promise);
    }));

    it('should show the details', function() {
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService, $routeParams: {type: 'playlist', id: 1}});
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getDetails).toHaveBeenCalled();
        expect(scope.video).toEqual(['video 1']);
        expect(scope.playlist).toEqual(['playlist']);
    });

    it('should redirect to dashboard with search results when triggered by the search app directive', function() {
        spyOn($location, 'path');
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('app:search-value', 'yetu');
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        $rootScope.$digest();
        expect($location.path).toHaveBeenCalledWith('/dashboard/search/yetu');
    });
});
