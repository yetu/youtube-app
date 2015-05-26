'use strict';

describe('viewerController function', function() {
    var scope,
        $controller,
        ytYoutubeService,
        $timeout,
        $window,
        respond = {
            details: {
                video: ['video 1'],
                playlist: ['playlist']
            }
        };

    beforeEach(module('youtubeApp', function($provide) {
        $provide.value('$window', {location: {href: 'dummy'}});
    }));

    beforeEach(inject(function($rootScope, _$controller_, _ytYoutubeService_, _$window_, $q, _$timeout_) {
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        $window = _$window_;
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
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        scope.$broadcast('app:search-value', 'yetu');
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        scope.$digest();
        expect($window.location.href).toEqual("#/dashboard/search/yetu");
    });
});
