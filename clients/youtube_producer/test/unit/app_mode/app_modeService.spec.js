'use strict';

describe('Component: app_mode', function () {

    var $routeParams, $location, locationSpy;

    beforeEach(module('youtubeApp'), function($provide) {
        $provide.value('$window', { location: {href: 'dummyRef'}});
    });
    
    beforeEach(inject(function(_$routeParams_, _$location_){
            $routeParams = _$routeParams_;
            $location = _$location_;
            locationSpy = spyOn($location, 'absUrl');
        })
    );

    it('should be in pc mode by default', inject(function(appMode) {
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    }));

    it('should be in tv mode after setting tv', inject(function(appMode) {
        appMode.set('tv');
        expect(appMode.isPC()).toBe(false);
        expect(appMode.isTV()).toBe(true);
    }));

    it('should be in pc mode after setting pc', inject(function(appMode) {
        appMode.set('pc');
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    }));

    it('should be in pc mode after setting dummy', inject(function(appMode) {
        appMode.set('dummy');
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    }));

    it('should get the default view and class', inject(function(appMode) {
        expect(appMode.getView()).toBeUndefined();
        expect(appMode.getClass()).toBe('pcmode undefined');
    }));

    it('should get the tv view and class', inject(function(appMode) {
        appMode.set('tv');
        expect(appMode.getView()).toBeUndefined();
        expect(appMode.getClass()).toBe('tvmode undefined');
    }));

    it('should get the default view and class with routeParams mode appended', inject(function(appMode) {
        $routeParams.mode = 'test';
        expect(appMode.getView()).toBe('test');
        expect(appMode.getClass()).toBe('pcmode test');
    }));

    xit('should be in pc mode when the url does not contain "/level2tv"', inject(function(appMode) {
        locationSpy.and.returnValue('http://server/#/dashboard');
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    }));

    xit('should be in tv mode when the url does contain "/level2tv"', inject(function(appMode) {
        locationSpy.and.returnValue('http://server/level2tv#/dashboard');
        expect(appMode.isPC()).toBe(false);
        expect(appMode.isTV()).toBe(true);
    }));
});