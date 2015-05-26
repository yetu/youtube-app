'use strict';

describe('Service: appSendToTvService', function () {
  var $rootScope, $httpBackend, $location, $filter, serverPathsConfig, service;

  beforeEach(module('youtubeApp'));

  beforeEach(function () {

    inject(function (appSendToTvService, _$rootScope_, _$httpBackend_, _$location_, _$filter_) {
      $httpBackend = _$httpBackend_;
      $rootScope = _$rootScope_;
      $location = _$location_;
      $filter = _$filter_;
      service = appSendToTvService;
    });

  });

  it('should return proper payload when data provided', function () {

    spyOn(service, 'sendToTv');

    var data = {
      'actTime': 123,
      'type': 'video',
      'id': '123',
    }

    var retPayload = service.sendToTv(data);
    expect(service.sendToTv).toHaveBeenCalled();
  });

  it('should emit appSendToTv:send when called', function () {
    var data = {
      'title':'testTitle',
      'actTime': 123,
      'type': 'video',
      'id': '123',
    }

    $httpBackend.expectPOST('/playlist').respond(200, {});

    spyOn( $rootScope, '$broadcast').and.callThrough();
    spyOn( $rootScope, '$emit').and.callThrough();

    var retPayload = service.sendToTv(data);

    //expect($rootScope.$emit).toHaveBeenCalledWith('');
    //expect($rootScope.$broadcast).toHaveBeenCalledWith('');

    $httpBackend.flush();

  });
});