'use strict';

describe('Directive: app-send-to-tv', function () {
    var $compile,
        $rootScope,
        appSendToTvService;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_, _appSendToTvService_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
        appSendToTvService = _appSendToTvService_;
    }));

    it('should compile to button with default class', function() {
        var element = $compile('<app-send-to-tv></app-send-to-tv>')($rootScope);
        $rootScope.$digest();
        expect(element.find('button').eq(0).attr('class')).toBe('app-send-to-tv');
    });

    it('should compile to button with specified class', function() {
        var element = $compile('<app-send-to-tv class="some class"></app-send-to-tv>')($rootScope);
        $rootScope.$digest();
        expect(element.find('button').eq(0).attr('class')).toBe('some class');
    });

    it('should react on click', function() {
        var element = $compile('<app-send-to-tv ng-model="data"></app-send-to-tv>')($rootScope);
          $rootScope.data = {
          "test":true
        };
        spyOn(appSendToTvService, 'sendToTv');
        $rootScope.$digest();
        element.find('button').eq(0).triggerHandler('click');
        expect(appSendToTvService.sendToTv).toHaveBeenCalledWith($rootScope.data);
    });
});
