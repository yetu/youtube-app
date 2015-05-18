'use strict';

describe('Component: app_mode', function () {

    var $routeParams,
        mode;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$routeParams_, appMode){
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
    })
});