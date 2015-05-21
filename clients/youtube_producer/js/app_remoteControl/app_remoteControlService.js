/* global module */
/**
 * Service for remote controling
 */
module.exports = (function($window, $timeout, appRemoteControlConfig) {
	'use strict';

    var registered = {},
        active,
        config,
        last,
        controllerCb;

    var init = function() {
        if($window.yetu) {
            $window.yetu.onAnyActionDetected = function(data, topic, channel){
                console.debug("yetu message received", data, topic, channel);
                action(topic.replace('control.', ''));
            };
        }
    };

    var action = function(command) {
        last = command;

        // TODO: if action special

        if(registered[active]) {
            registered[active](command);
        } else {
            // ...
        }
    };
    
    var setController = function(name, callback) {
        console.debug('appRemoteControlService.setController', name);
        if(appRemoteControlConfig[name]) {
            config = appRemoteControlConfig[name];
            console.debug('config', config);
            active = config.order[0];
            console.debug('active', active);
        } else {
            throw {message: 'Config of remote control doesnt exist for ' + name};
        }
        controllerCb = callback;
    };

    var register = function(name, callback) {
        console.debug('appRemoteControlService.register', name);
        registered[name] = callback;
        if(active === name) {
            // activate configured element after registration
            activate(name);
        }
    };

    var deregister = function(name) {
        registered[name] = null;
    };

    var activate = function(name) {
        if(registered[name]) {
            active = name;
            registered[name]('activate');
        } else {
            // ...
        }
    };

    var deactivate = function(name) {
        console.debug('appRemoteControlService.deactivate', name);
        switch(last) {
            case 'back': {
                active = null;
                controllerCb('back', name);
                break;
            }
            // TODO: depending on last command activate next/prev
        }
    };

    $timeout(init, 1000);

    return {
        setController: setController,
        register: register,
        deactivate: deactivate
    };
});
