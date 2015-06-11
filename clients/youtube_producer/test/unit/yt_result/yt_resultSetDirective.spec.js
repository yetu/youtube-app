'use strict';

describe('Directive: yt-result-set', function () {
    var $compile, $rootScope, $scope, $location, appRemoteControlService,
        remote = {};

    beforeEach(module('youtubeApp'));

    beforeEach(function () {
        inject(function(_$compile_, _$rootScope_, _$location_, _appRemoteControlService_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $location = _$location_;
            appRemoteControlService = _appRemoteControlService_;
        });
        // isolate scope
        $scope = $rootScope.$new({});
        $scope.result = [{type: 'video', title: 'Title 1', items: [{id: 'video-1'}]},
                         {type: 'popular', title: 'Title 2', items: [{id: 'video-2'}]}];
        appRemoteControlService.register = function(name, callback) {
            remote.name = name;
            remote.callback = callback;
        };
    });

    afterEach(function() {
        $scope.$destroy();
        remote = {};
    });

    it('should compile properly', function() {
        var element = $compile('<yt-result-set ng-model="result"></yt-result-set>')($scope);
        $rootScope.$digest();
        var h2 = element.find('h2');
        expect(angular.element(h2[0]).hasClass('video'));
        expect(angular.element(h2[1]).hasClass('popular'));
        expect(h2[0].innerText).toBe('Title 1');
    });

    it('should not register on create if control not specified', function() {
        var element = $compile('<yt-result-set></yt-result-set>')($scope);
        $rootScope.$digest();
        expect(remote).toEqual({});
    });

    it('should register on create if remote defined', function() {
        var element = $compile('<yt-result-set remote-control="result"></yt-result-set>')($scope);
        $rootScope.$digest();
        expect(remote.name).toEqual('result');
        expect(typeof remote.callback).toBe('function');
    });

    describe('on remote control multi row', function() {
        var element;

        beforeEach(function () {
            element = $compile('<yt-result-set ng-model="result" remote-control="result"></yt-result-set>')($scope);
            $rootScope.$digest();
        });

        it('should react on remote control activate', function() {
            remote.callback('activate');
            var container = angular.element(element.children()[0]);
            expect(container.hasClass('row-1-activated')).toBeTruthy();
            var videoListElements = element.find('ui-video-list');
            var videoListItemElements = element.find('ui-video-list-item');
            expect(angular.element(videoListElements[0]).attr('row')).toBe('1');
            expect(angular.element(videoListElements[1]).attr('row')).toBe('2');
            expect(angular.element(videoListItemElements[0]).attr('activated')).toBe('true');
            expect(angular.element(videoListItemElements[1]).attr('activated')).toBe(undefined);
        });

        it('should react on remote control down', function() {
            remote.callback('activate');
            remote.callback('down');
            var container = angular.element(element.children()[0]);
            expect(container.hasClass('row-2-activated')).toBeTruthy();
            expect(container.hasClass('row-1-activated')).toBeFalsy();
            var videoListElements = element.find('ui-video-list');
            var videoListItemElements = element.find('ui-video-list-item');
            expect(angular.element(videoListElements[0]).css('transform')).not.toBe(undefined);
            expect(angular.element(videoListItemElements[0]).attr('activated')).toBe('false');
            expect(angular.element(videoListItemElements[1]).attr('activated')).toBe('true');
        });

        it('should react on remote deactivate', function() {
            remote.callback('activate');
            remote.callback('deactivate');
            var container = angular.element(element.children()[0]);
            expect(container.hasClass('row-2-activated')).toBeFalsy();
            expect(container.hasClass('row-1-activated')).toBeFalsy();
        });
    });

    describe('on remote control single row', function() {
        var element;

        beforeEach(function () {
            $scope.result = [{type: 'video', title: 'Title 1', items: [{id: 'video-1', type: 'video'}, {id: 'video-2'}]}];
            element = $compile('<yt-result-set ng-model="result" play-link="link" remote-control="result"></yt-result-set>')($scope);
            $rootScope.$digest();
        });

        it('should react on remote control right', function() {
            remote.callback('activate');
            remote.callback('right');
            var container = angular.element(element.children()[0]);
            var videoListItemElements = element.find('ui-video-list-item');
            expect(container.css('transform')).not.toBe(undefined);
            expect(angular.element(videoListItemElements[0]).attr('activated')).toBe('false');
            expect(angular.element(videoListItemElements[1]).attr('activated')).toBe('true');
        });

        it('should react on remote control left', function() {
            remote.callback('activate');
            remote.callback('right');
            remote.callback('left');
            var container = angular.element(element.children()[0]);
            var videoListItemElements = element.find('ui-video-list-item');
            expect(container.css('transform')).not.toBe(undefined);
            expect(angular.element(videoListItemElements[0]).attr('activated')).toBe('true');
            expect(angular.element(videoListItemElements[1]).attr('activated')).toBe('false');
        });

        it('should react on remote control right of last element', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('right');
            remote.callback('right');
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('result');
        });

        it('should react on remote control left of first element', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('left');
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('result');
        });

        it('should react on remote control enter', function() {
            spyOn($location, 'path');
            remote.callback('activate');
            remote.callback('enter');
            expect($location.path).toHaveBeenCalledWith('/view/expand/video/video-1');
        });
    });

    describe('on remote control playlist', function() {
        var element;

        beforeEach(function () {
            $scope.play = function(){};
            spyOn($scope, 'play');
            $scope.result = [{type: 'video', title: 'Title 1', items: [{id: 'video-1'}, {id: 'video-2'}, {id: 'video-3'}]}];
            element = $compile('<yt-result-set ng-model="result" load-next="scroll" remote-control="playlist" play-fn="play"></yt-result-set>')($scope);
            $rootScope.$digest();
        });

        it('should react on remote control right of last element', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('right');
            remote.callback('right');
            remote.callback('right');
            expect(appRemoteControlService.deactivate).not.toHaveBeenCalledWith('playlist');
        });

        it('should react on remote control left', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('right');
            remote.callback('right');
            remote.callback('left');
            expect(appRemoteControlService.deactivate).not.toHaveBeenCalledWith('playlist');
        });

        it('should react on remote control down', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('down');
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('playlist');
        });

        it('should react on remote control up', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('up');
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('playlist');
        });

        it('should react on remote control play', function() {
            spyOn(appRemoteControlService, 'deactivate');
            remote.callback('activate');
            remote.callback('play');
            expect(appRemoteControlService.deactivate).toHaveBeenCalledWith('playlist', 'down');
            expect($scope.play).toHaveBeenCalledWith(0);
        });
    });
});
