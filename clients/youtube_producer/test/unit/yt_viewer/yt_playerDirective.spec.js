'use strict';

describe('Directive: yt-player', function () {
    var $compile, $rootScope, $window, $scope, appMode, appRemoteControlService,
        remote = {}, test = {};

    beforeEach(module('youtubeApp', function ($provide) {
        $provide.constant('ytPlayerConfig', {
            video: {
                tvQuality: 'hd333',
                fastRewind: -20,
                fastForward: 20
            }
        });
    }));

    beforeEach(function () {
        inject(function(_$compile_, _$rootScope_, _$window_, _appMode_, _appRemoteControlService_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $window = _$window_;
            appMode = _appMode_;
            appRemoteControlService = _appRemoteControlService_;
        });

        // isolate scope
        $scope = $rootScope.$new({});
        // mock YT iframe api
        $window.YT = {
            PlayerState: { PLAYING: '2'},
            Player: function(){
                return { 
                    loadVideoById: function(arg) { test.loadVideoById = arg; },
                    setPlaybackQuality: function(arg) { test.setPlaybackQuality = arg; },
                    playVideo: function(arg) { test.playVideo = arg; },
                    pauseVideo: function(arg) { test.pauseVideo = arg; },
                    seekTo: function(arg) { test.seekTo = arg; }
                };
            }
        };
    });

    afterEach(function() {
        $scope.$destroy();
        test = {};
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

    it('should init player and set special params if TV mode', function() {
        var args;
        $compile('<yt-player></yt-player>')($scope);
        spyOn($window.YT, 'Player');
        spyOn(appMode, 'isTV').and.returnValue(true);
        $scope.video = { id: 'video-id' };
        $window.onYouTubeIframeAPIReady();
        $rootScope.$digest();
        args = $window.YT.Player.calls.argsFor(0)[1];
        expect(args.playerVars.controls).toBe(0);
        expect(args.height).toBe('1080');
        expect(args.width).toBe('1920');
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
            expect(test.loadVideoById).toEqual('other-video-id');
        });

        it('should switch off playing on tv indicator on load new video', function() {
            $scope.video = { id: 'other-video-id' };
            $scope.playingOnTv = true;
            $rootScope.$digest();
            expect($scope.playingOnTv).toEqual(false);
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
        
        it('should react on initialDelivery event and set seek to time if specified', function() {
            $scope.video.startAt = 33;
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"initialDelivery","info":{}}'});
            expect(test.seekTo).toEqual(33);
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

        it('should react on infoDelivery event with playbackQuality and set force resolution on TV if different', function() {
            spyOn(appMode, 'isTV').and.returnValue(true);
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"infoDelivery","info":{"playbackQuality":"hd1280"}}'});
            expect(test.setPlaybackQuality).toEqual('hd333');
        });
        
        it('should react on infoDelivery event with playbackQuality and not force resolution on TV if the same', function() {
            spyOn(appMode, 'isTV').and.returnValue(true);
            angular.element($window).triggerHandler({type: 'message', data: '{"event":"infoDelivery","info":{"playbackQuality":"hd333"}}'});
            expect(typeof test.setPlaybackQuality).toEqual('undefined');
        });

        it('should react on appSendToTv sent message', function() {
            $rootScope.$broadcast('appSendToTv:send', { sent: true});
            expect(test).toEqual({pauseVideo: undefined});
        });

        it('should not react on appSendToTv sent failed message', function() {
            $rootScope.$broadcast('appSendToTv:send', { sent: false});
            expect(test).toEqual({});
        });

        it('should react on appSendToTv resume message', function() {
            $rootScope.$broadcast('appSendToTv:resume');
            expect(test).toEqual({playVideo: undefined});
        });
    });

    describe('with remote control', function () {
        var element;
        beforeEach(function() {
            appRemoteControlService.register = function(name, callback) {
                remote.name = name;
                remote.callback = callback;
            };
            element = $compile('<yt-player></yt-player>')($scope);
            $scope.video = { id: 'video-id', actTime: null };
            $window.onYouTubeIframeAPIReady();
            $rootScope.$digest();
        });

        it('should register itself', function() {
            expect(remote.name).toEqual('player');
            expect(typeof remote.callback).toEqual('function');
        });

        it('should activate element', function() {
            expect(typeof element.attr('activated')).toEqual('undefined');
            remote.callback('activate');
            expect(element.attr('activated')).toEqual('true');
        });

        it('should play video if stopped', function() {
            $scope.player.API.ready = true;
            remote.callback('play');
            expect(test).toEqual({playVideo: undefined});
        });

        it('should pause video if playing', function() {
            $scope.player.info.isPlaying = true;
            remote.callback('play');
            expect(test).toEqual({pauseVideo: undefined});
        });

        it('should fast rewind video', function() {
            $scope.player.info.actTime = 222;
            remote.callback('left');
            expect(test.seekTo).toEqual(202);
        });

        it('should fast rewind video not before start', function() {
            $scope.player.info.actTime = 15;
            remote.callback('left');
            expect(test.seekTo).toEqual(0);
        });

        it('should fast forward video', function() {
            $scope.player.info.actTime = 111;
            remote.callback('right');
            expect(test.seekTo).toEqual(131);
        });

        it('should rewind video not after end', function() {
            $scope.player.info.duration = 100
            $scope.player.info.actTime = 95;
            remote.callback('right');
            expect(test.seekTo).toEqual(100);
        });

        it('should stop video and deactivate directive', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('back');
            expect(test).toEqual({pauseVideo: undefined});
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('player');
        });
    });
});
