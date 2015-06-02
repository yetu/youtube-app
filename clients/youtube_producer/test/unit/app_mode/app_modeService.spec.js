'use strict';

describe('Component: app_mode', function () {

    var $routeParams, $location, mode;

    beforeEach(module('youtubeApp'), function($provide) {
        $provide.value('$window', { location: {href: 'dummyRef'}});
    });

    beforeEach(inject(function(_$routeParams_, _$location_, appMode){
        $routeParams = _$routeParams_;
        $location = _$location_;
        mode = appMode;
    }));

    it('should be in pc mode by default', function() {
        expect(mode.isPC()).toBe(true);
        expect(mode.isTV()).toBe(false);
    });

    it('should be in tv mode after setting tv', function() {
        mode.set('tv');
        expect(mode.isPC()).toBe(false);
        expect(mode.isTV()).toBe(true);
    });

    it('should be in pc mode after setting pc', function() {
        mode.set('pc');
        expect(mode.isPC()).toBe(true);
        expect(mode.isTV()).toBe(false);
    });

    it('should be in pc mode after setting dummy', function() {
        mode.set('dummy');
        expect(mode.isPC()).toBe(true);
        expect(mode.isTV()).toBe(false);
    });

    it('should get the default view and class', function() {
        expect(mode.getView()).toBeUndefined();
        expect(mode.getClass()).toBe('pcmode undefined');
    });

    it('should get the tv view and class', function() {
        mode.set('tv');
        expect(mode.getView()).toBeUndefined();
        expect(mode.getClass()).toBe('tvmode undefined');
    });

    it('should get the default view and class with routeParams mode appended', function() {
        $routeParams.mode = 'test';
        expect(mode.getView()).toBe('test');
        expect(mode.getClass()).toBe('pcmode test');
    });

    xit('should be in pc mode when the url does not contain "/level2tv"', function() {
        spyOn($location, 'absUrl').and.returnValue('http://server/#/dashboard');
        expect(mode.isPC()).toBe(true);
        expect(mode.isTV()).toBe(false);
    });

    xit('should be in tv mode when the url does contain "/level2tv"', function() {
        spyOn($location, 'absUrl').and.returnValue('http://server/level2tv/#/dashboard');
        expect(mode.isPC()).toBe(false);
        expect(mode.isTV()).toBe(true);
    });
});