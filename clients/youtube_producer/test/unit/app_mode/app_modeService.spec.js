'use strict';

describe('Component: app_mode', function () {

    var $routeParams, $location, appMode,
        testUrl = 'http://server/#/dashboard';

    beforeEach(module('youtubeApp', function($provide) {
        $provide.value('$location', {
            search: function() { return {}; },
            absUrl: function() { return testUrl; }
        });
    }));
    
    beforeEach(inject(function(_$routeParams_, _$location_, _appMode_){
            $routeParams = _$routeParams_;
            $location = _$location_;
            appMode = _appMode_;
        })
    );

    it('should be in pc mode by default', function() {
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    });

    it('should be in tv mode after setting tv', function() {
        appMode.set('tv');
        expect(appMode.isPC()).toBe(false);
        expect(appMode.isTV()).toBe(true);
    });

    it('should be in pc mode after setting pc', function() {
        appMode.set('pc');
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    });

    it('should be in pc mode after setting dummy', function() {
        appMode.set('dummy');
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    });

    it('should get the default view and class', function() {
        expect(appMode.getView()).toBeUndefined();
        expect(appMode.getClass()).toBe('pcmode undefined');
    });

    it('should get the tv view and class', function() {
        appMode.set('tv');
        expect(appMode.getView()).toBeUndefined();
        expect(appMode.getClass()).toBe('tvmode undefined');
    });

    it('should get the default view and class with routeParams mode appended', function() {
        $routeParams.mode = 'test';
        expect(appMode.getView()).toBe('test');
        expect(appMode.getClass()).toBe('pcmode test');
    });

    it('should be in pc mode when the url does not contain "/level2tv"', function() {
        expect(appMode.isPC()).toBe(true);
        expect(appMode.isTV()).toBe(false);
    });
    
    describe('in TV mode', function() {
        beforeEach(function() {
            testUrl = 'http://server/level2tv#/something';
        });

        it('initial change of abs url', function() {
            // do nothing
        });
        
        it('should be in tv mode when the url does contain "/level2tv"', function() {
            expect(appMode.isPC()).toBe(false);
            expect(appMode.isTV()).toBe(true);
        });
    });
});