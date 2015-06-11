'use strict';

describe('Service: app_remoteControl', function () {
    var $window, $timeout, service, config, controller, directive, initialized = {};

    beforeEach(module('youtubeApp', function($provide) {
        // simulates having yetu library loaded and TV mode
        $provide.value('$window', { yetu: {dummy: 'true'}});
        $provide.value('appMode', { get: function() { return 'tv'; }});
    }));

    beforeEach(inject(function(_$window_, _$timeout_, _appRemoteControlConfig_, _appRemoteControlService_){
        $window = _$window_;
        $timeout = _$timeout_;
        config = _appRemoteControlConfig_;
        config.controllers['viewer-fullscreen'].order = ['playlist', 'player', 'other'];
        service = _appRemoteControlService_;
        controller = {
            callback: function(action) {}
        };
        directive = {
            callback: function(action) {}
        };
        if(initialized.events) {
            $timeout.flush();
        }
        if(initialized.controller) {
            service.setController('viewer-fullscreen', controller.callback);
        }
    }));

    it('should register event listeners and grab focus on document', function() {
        expect(typeof $window.yetu.onAnyActionDetected).toBe('undefined');
        expect(document.onkeydown).toBe(null);
        spyOn(document.body, 'focus');
        $timeout.flush();
        expect(typeof $window.yetu.onAnyActionDetected).toBe('function');
        expect(typeof document.onkeydown).toBe('function');
        expect(document.body.focus).toHaveBeenCalled();
        // for next tests simplified
        initialized.events = true;
    });

    it('should throw error if controller not configured', function() {
        expect(function() {
            service.setController('someunknown', controller.callback);
        }).toThrowError('Config of remote control doesnt exist for someunknown');
        // for next tests simplified
        initialized.controller = true;
    });

    it('should register directive and do nothing if not first', function() {
        spyOn(directive, 'callback');
        service.register('some', directive.callback);
        expect(directive.callback).not.toHaveBeenCalled();
    });

    it('should register directive and activate if first', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        expect(directive.callback).toHaveBeenCalledWith('activate');
    });

    it('should call callback action on remote control', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);        
        $window.yetu.onAnyActionDetected('data', 'control.left', 'channel');
        expect(directive.callback.calls.argsFor(1)).toEqual(['left']);
    });

    it('should not callback action on remote control if directive not active', function() {
        spyOn(directive, 'callback');
        service.register('some', directive.callback);
        $window.yetu.onAnyActionDetected('data', 'control.left', 'channel');
        expect(directive.callback).not.toHaveBeenCalled();
    });

    it('should call callback action for configured passthrough on remote control', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        service.register('controlbar', directive.callback);
        $window.yetu.onAnyActionDetected('data', 'control.left', 'channel');
        // given the same twice so activate for player, left for player and controlbar
        expect(directive.callback.calls.allArgs()).toEqual([['activate'], ['left'], ['left']]);
    });

    it('should call controller callback action on deactivation of directive', function() {
        spyOn(controller, 'callback');
        service.setController('viewer-fullscreen', controller.callback);
        $window.yetu.onAnyActionDetected('data', 'control.quit', 'channel');
        service.deactivate('player');
        expect(controller.callback).toHaveBeenCalledWith('quit', 'player');
    });

    it('should call callback action on keyboard', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        document.onkeydown({which:68});
        expect(directive.callback.calls.argsFor(1)).toEqual(['right']);
    });

    it('should not call callback action on key not mapped', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        document.onkeydown({which:111});
        expect(directive.callback.calls.argsFor(1)).toEqual([]);
    });

    it('should deactivate previous directive on activate next', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        service.register('other', directive.callback);
        service.activate('other');
        expect(directive.callback.calls.argsFor(0)).toEqual(['activate']);
        expect(directive.callback.calls.argsFor(1)).toEqual(['deactivate']);
        expect(directive.callback.calls.argsFor(2)).toEqual(['activate']);
    });

    it('should activate next directive deactivate after remote down', function() {
        spyOn(directive, 'callback');
        service.register('player', directive.callback);
        service.register('other', directive.callback);
        service.deactivate('player', 'down');
        expect(directive.callback.calls.argsFor(0)).toEqual(['activate']);
        expect(directive.callback.calls.argsFor(1)).toEqual(['deactivate']);
        expect(directive.callback.calls.argsFor(2)).toEqual(['activate']);
    });

    it('should activate next directive deactivate after remote up', function() {
        spyOn(directive, 'callback');
        service.register('playlist', directive.callback);
        service.register('player', directive.callback);
        service.deactivate('player', 'up');
        expect(directive.callback.calls.argsFor(0)).toEqual(['activate']);
        expect(directive.callback.calls.argsFor(1)).toEqual(['deactivate']);
        expect(directive.callback.calls.argsFor(2)).toEqual(['activate']);
    });
});