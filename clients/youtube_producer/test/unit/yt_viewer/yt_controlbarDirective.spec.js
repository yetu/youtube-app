'use strict';

describe('Directive: yt-controlbar', function () {
    var $compile, $rootScope, $scope, $timeout, appRemoteControlService,
        remote = {};

    beforeEach(module('youtubeApp', function ($provide) {
        $provide.constant('ytPlayerConfig', {
            video: {
                highlightTimeout: '100'
            }
        });
    }));

    beforeEach(function () {
        inject(function(_$compile_, _$rootScope_, _$timeout_, _appRemoteControlService_){
            $compile = _$compile_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            appRemoteControlService = _appRemoteControlService_;
        });
        // isolate scope
        $scope = $rootScope.$new({});
        appRemoteControlService.register = function(name, callback) {
            remote.name = name;
            remote.callback = callback;
        };
    });

    afterEach(function() {
        $scope.$destroy();
        remote = {};
    });

    it('should highlight rewind on "left" command and reset highlight after timeout', function() {
        var element = $compile('<yt-controlbar></yt-controlbar>')($scope);
        var elementScope = element.isolateScope();
        $rootScope.$digest();
        expect(elementScope.highlightRewind).toBeFalsy();
        remote.callback('left');
        expect(elementScope.highlightRewind).toBeTruthy();
        $timeout.flush();
        expect(elementScope.highlightRewind).toBeFalsy();
    });

    it('should highlight forward on "right" command and reset highlight after timeout', function() {
        var element = $compile('<yt-controlbar></yt-controlbar>')($scope);
        var elementScope = element.isolateScope();
        $rootScope.$digest();
        expect(elementScope.highlightForward).toBeFalsy();
        remote.callback('right');
        expect(elementScope.highlightForward).toBeTruthy();
        $timeout.flush();
        expect(elementScope.highlightForward).toBeFalsy();
    });

    it('should toggle visibility on "down" command', function() {
        var element = $compile('<yt-controlbar></yt-controlbar>')($scope);
        var elementScope = element.isolateScope();
        $rootScope.$digest();
        expect(elementScope.isVisible).toBeFalsy();
        remote.callback('down');
        expect(elementScope.isVisible).toBeTruthy();
        remote.callback('down');
        expect(elementScope.isVisible).toBeFalsy();
    });

    it('should hide on deactivation', function() {
        var element = $compile('<yt-controlbar></yt-controlbar>')($scope);
        var elementScope = element.isolateScope();
        $rootScope.$digest();
        elementScope.isVisible = true;
        expect(elementScope.isVisible).toBeTruthy();
        remote.callback('deactivate');
        expect(elementScope.isVisible).toBeFalsy();
    });
});
