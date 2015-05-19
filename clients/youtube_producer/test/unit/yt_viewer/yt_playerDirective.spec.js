'use strict';

describe('Directive: yt-player', function () {
    var $compile, $rootScope, $window, $scope,
        test = null;

    beforeEach(module('youtubeApp', function ($provide) {
        $provide.constant('ytPlayerConfig', {});
    }));

    beforeEach(function () {
        inject(function(_$compile_, _$rootScope_, _$window_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $window = _$window_;
        });

        // isolate scope
        $scope = $rootScope.$new({});
        // mock YT iframe api
        $window.YT = {
            PlayerState: { PLAYING: '2'},
            Player: function(){
                return { loadVideoById: function(arg) {
                    test = arg;
                }};
            }
        };
    });

    afterEach(function() {
        $scope.$destroy();
        test = null;
    });

    it('should init scope player info', function() {
        $compile('<yt-player></yt-player>')($scope);
        $rootScope.$digest();
        expect($scope.player.API).toBeDefined();
        expect($scope.player.info).toBeDefined();
    });

    it('should update player info after api started', function() {
        $compile('<yt-player></yt-player>')($scope);
        $window.onYouTubeIframeAPIReady();
        $rootScope.$digest();
        expect($scope.player.API.loaded).toBeTruthy();
    });

    it('should init player on player available first, video second', function() {
        $compile('<yt-player></yt-player>')($scope);
        $window.onYouTubeIframeAPIReady();
        $rootScope.$digest();
        $scope.video = { id: 'video-id' };
        $rootScope.$digest();
        expect($scope.player.API.initialized).toBeTruthy();
    });

    it('should init player on video available first, player second', function() {
        var args;
        $compile('<yt-player></yt-player>')($scope);
        spyOn($window.YT, 'Player');
        $scope.video = { id: 'video-id' };
        $rootScope.$digest();
        $window.onYouTubeIframeAPIReady();
        $rootScope.$digest();

        expect($scope.player.API.initialized).toBeTruthy();
        expect($window.YT.Player).toHaveBeenCalled();
        args = $window.YT.Player.calls.argsFor(0)[1];
        expect(args.videoId).toEqual('video-id');
    });

    it('should init player and set api ready', function() {
        var args;
        $compile('<yt-player></yt-player>')($scope);
        spyOn($window.YT, 'Player');
        $scope.video = { id: 'video-id' };
        $window.onYouTubeIframeAPIReady();
        $rootScope.$digest();
        args = $window.YT.Player.calls.argsFor(0)[1];
        expect(typeof args.events.onReady).toBe('function');
        args.events.onReady();
        expect($scope.player.API.ready).toBeTruthy();
    });

    describe('after initialization', function () {
        var element;
        beforeEach(function() {
            element = $compile('<yt-player></yt-player>')($scope);
            $scope.video = { id: 'video-id', actTime: null };
            $window.onYouTubeIframeAPIReady();
            $rootScope.$digest();
        });

        it('should load video if changed in scope', function() {
            $scope.video = { id: 'other-video-id' };
            $rootScope.$digest();
            expect(test).toEqual('other-video-id');
        });

        it('should not react on messages from different origin', function() {
            spyOn(angular, 'fromJson');
            angular.element($window).triggerHandler({type: 'message', origin: 'http://some.com'});
            expect(angular.fromJson).not.toHaveBeenCalled();
        });

        it('should react on initialDelivery event and set duration', function() {
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"initialDelivery","info":{"duration":"111"}}'});
            expect($scope.player.info.duration).toEqual('111');
        });

        it('should react on infoDelivery event with playerState and set playing state', function() {
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"infoDelivery","info":{"playerState":"2"}}'});
            expect($scope.player.info.isPlaying).toBeTruthy();
        });

        it('should react on infoDelivery event with currentTime and set playing time', function() {
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"initialDelivery","info":{"duration":"111"}}'});
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"infoDelivery","info":{"currentTime":"55"}}'});
            expect($scope.video.actTime).toEqual(55);
            expect($scope.player.info.percentage).toBeCloseTo(50);
        });
    });
});
