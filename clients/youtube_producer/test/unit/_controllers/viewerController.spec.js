'use strict';

describe('viewerController function', function() {
    var $rootScope,
        scope,
        $controller,
        ytYoutubeService,
        $timeout,
        $location,
        Notification,
        respond = {
            details: {
                video: ['video 1'],
                playlist: ['playlist']
            }
        };

    beforeEach(module('youtubeApp', function($provide) {
        $provide.value('$window', {location: {href: 'dummy'}});
    }));

    beforeEach(inject(function(_$rootScope_, _$controller_, _ytYoutubeService_, _$location_, $q, _$timeout_, _Notification_) {
        $rootScope = _$rootScope_;
        scope = $rootScope.$new();
        $controller = _$controller_;
        ytYoutubeService = _ytYoutubeService_;
        $timeout = _$timeout_;
        $location = _$location_;
        Notification = _Notification_;
        var deferred = $q.defer();
        deferred.resolve(respond.details);
        spyOn(ytYoutubeService, "getDetails").and.returnValue(deferred.promise);
    }));

    it('should show the details without given start time', function() {
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService, $routeParams: {type: 'playlist', id: 1}});
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getDetails).toHaveBeenCalled();
        expect(scope.video).toEqual(['video 1']);
        expect(scope.video.startAt).toBeUndefined();
        expect(scope.playlist).toEqual(['playlist']);
    });

    it('should show the details with given start time', function() {
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService, $routeParams: {type: 'playlist', id: 1, time: '03:15'}});
        scope.$digest();
        $timeout.flush();
        $timeout.verifyNoPendingTasks();
        expect(ytYoutubeService.getDetails).toHaveBeenCalled();
        expect(scope.video).toEqual(['video 1']);
        expect(scope.video.startAt).toBe('03:15');
        expect(scope.playlist).toEqual(['playlist']);
    });

    it('should redirect to dashboard with search results when triggered by the app search event', function() {
        spyOn($location, 'path');
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('app:search-value', 'yetu');
        $rootScope.$digest();
        expect($location.path).toHaveBeenCalledWith('/dashboard/search/yetu');
    });

    it('should create an error notification if the data was not sent when triggered by the appSendToTv:send event', function() {
        spyOn(Notification, 'error');
        $controller('ViewerCtrl', {$scope: scope, ytYoutubeService: ytYoutubeService});
        $rootScope.$broadcast('appSendToTv:send', { name: 'dataName', sent: false });
        $rootScope.$digest();
        expect(Notification.error).toHaveBeenCalledWith({
                message: 'The video could not be played on TV. Please retry later.',
                title: 'Play video on TV'
            });
    });
});
