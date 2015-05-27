'use strict';

describe('Service: appSendToTvService', function () {
    var $rootScope, $httpBackend, $location, $filter, serverPathsConfig, service;

    beforeEach(module('youtubeApp'));

    beforeEach(function () {
        inject(function (_$rootScope_, _$httpBackend_, _$location_, _$filter_, appSendToTvService) {
            $rootScope = _$rootScope_;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $filter = _$filter_;
            service = appSendToTvService;
        });
    });

    it('should emit appSendToTv:send when called and sent successfull', function () {
        var data = {
            title: 'testTitle',
            actTime: 123,
            type: 'video',
            id: '123'
        };
        
        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(200, {});

        service.sendToTv(data);
        
        $httpBackend.flush();
        $rootScope.$digest();
        
        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: data.title, sent: true}]);
    });

    it('should emit appSendToTv:send when called and sent failed with unauthorized', function () {
        var data = {
            title: 'testTitle',
            actTime: 123,
            type: 'video',
            id: '123'
        };

        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(401, {});

        service.sendToTv(data);

        $httpBackend.flush();
        $rootScope.$digest();

        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: data.title, sent: 401}]);
    });

    it('should emit appSendToTv:send when called and sent failed with other error', function () {
        var data = {
            title: 'testTitle',
            actTime: 123,
            type: 'video',
            id: '123'
        };

        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(500, {});

        service.sendToTv(data);

        $httpBackend.flush();
        $rootScope.$digest();

        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: data.title, sent: false}]);
    });
});