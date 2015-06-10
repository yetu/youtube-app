'use strict';

describe('Directive: yt-viewer', function () {
    var $compile, $rootScope, $scope, appMode;

    beforeEach(module('youtubeApp', function ($provide) {
        $provide.constant('ytPlayerConfig', {});
    }));

    beforeEach(function () {
        inject(function(_$compile_, _$rootScope_, _appMode_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            appMode = _appMode_;
        });

        // isolate scope
        $scope = $rootScope.$new({});
    });

    afterEach(function() {
        $scope.$destroy();
    });

    it('should define playlist visbility in scope', function() {
        spyOn(appMode, 'getView').and.returnValue('normal');
        var element = $compile('<yt-viewer></yt-viewer>')($scope),
            isolatedScope = element.isolateScope();
        expect(isolatedScope.playlistVisible).toBeTruthy();
    });

    it('should change video in scope on playVideo function', function() {
        $scope.vid = { id: 'video-1' };
        $scope.ply = { items: [{ id: 'video-1' }, { id: 'video-2' }] };
        var element = $compile('<yt-viewer video-model="vid" playlist-model="ply"></yt-viewer>')($scope),
            isolatedScope = element.isolateScope();
        expect(isolatedScope.video.id).toEqual('video-1');
        isolatedScope.playVideo(1);
        expect(isolatedScope.video.id).toEqual('video-2');
    });

    it('should change currentPlaying in scope on playVideo function', function() {
        $scope.vid = { id: 'video-1' };
        $scope.ply = [{ items: [{ id: 'video-1' }, { id: 'video-2' }] }];
        var element = $compile('<yt-viewer video-model="vid" playlist-model="ply"></yt-viewer>')($scope),
            isolatedScope = element.isolateScope();
        $scope.$digest();
        expect(isolatedScope.playlist[0].currentPlaying).toBeUndefined();
        isolatedScope.playVideo(1);
        expect(isolatedScope.playlist[0].currentPlaying).toBe(1);
        expect(element.find('ui-video-list-item').eq(1).hasClass('playing')).toBeTruthy();
        expect(element.find('ui-video-list-item').eq(0).hasClass('playing')).toBeFalsy();
        isolatedScope.playVideo(0);
        expect(isolatedScope.playlist[0].currentPlaying).toBe(0);
        expect(element.find('ui-video-list-item').eq(0).hasClass('playing')).toBeTruthy();
        expect(element.find('ui-video-list-item').eq(1).hasClass('playing')).toBeFalsy();
    });
});
