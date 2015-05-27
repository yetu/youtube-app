'use strict';

describe('Service: appSendToTvService', function () {
    var $rootScope, $httpBackend, $location, $filter, service;

    beforeEach(module('youtubeApp'));

    beforeEach(function () {

        var dataIn = {
          title: 'testTitle',
          actTime: 123,
          type: 'video',
          id: '123'
        };

        inject(function (_$rootScope_, _$httpBackend_, _$location_, _$filter_, appSendToTvService) {
            $rootScope = _$rootScope_;
            $rootScope.testDataIn = dataIn;
            $httpBackend = _$httpBackend_;
            $location = _$location_;
            $filter = _$filter_;
            service = appSendToTvService;
        });
    });

    it('should emit appSendToTv:send when called and sent successfull', function () {
        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(200, {});
        service.sendToTv($rootScope.testDataIn);
        $httpBackend.flush();
        $rootScope.$digest();
        
        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: $rootScope.testDataIn.title, sent: true}]);
    });

    it('should emit appSendToTv:send when called and sent failed with unauthorized', function () {
        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(401, {});
        service.sendToTv($rootScope.testDataIn);
        $httpBackend.flush();
        $rootScope.$digest();

        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: $rootScope.testDataIn.title, sent: 401}]);
    });

    it('should emit appSendToTv:send when called and sent failed with other error', function () {
        spyOn($rootScope, '$broadcast').and.callThrough();
        $httpBackend.expectPOST('/playlist').respond(500, {});
        service.sendToTv($rootScope.testDataIn);
        $httpBackend.flush();
        $rootScope.$digest();

        expect($rootScope.$broadcast.calls.mostRecent().args).toEqual(['appSendToTv:send', {name: $rootScope.testDataIn.title, sent: false}]);
    });
});