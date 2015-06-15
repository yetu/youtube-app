/* global module */
/**
 * Service for remote controling
 */
module.exports = (function($window, $location, $timeout, appRemoteControlConfig) {
    'use strict';

    var registered = {},
        active,
        config,
        last,
        initialized = false,
        controller = { name: null, callback: null};

    var init = function() {
        // console.debug('appRemoteControlService.init');
        if($window.yetu) {
            $window.yetu.onAnyActionDetected = function(data, topic, channel){
                console.debug("yetu message received", data, topic, channel);
                action(topic.replace('control.', ''));
            };
            // simulates remote by keys
            document.onkeydown = function (evt) {
                var key = appRemoteControlConfig.keys[evt.which];
                console.debug("document.onkeydown", evt.which, key);
                if(key) {
                    action(key);
                }
            };
            // get focus back from player
            document.body.addEventListener('blur' /* 'focusout' */, function() { // TODO: check why not really working
                // console.debug('onfocusout');
                document.body.focus();
            });
            document.body.focus();
            // activate first element
            activate(active);
            initialized = true;
        }
    };

    var action = function(command) {
        console.debug('appRemoteControlService.action', command, 'active:', active);
        last = command;

        // call global special action if defined
        if(appRemoteControlConfig.special && appRemoteControlConfig.special[command]) {
            // route handling
            if(appRemoteControlConfig.special[command].route) {
                $location.path(appRemoteControlConfig.special[command].route);
            }
        }

        // call controller special action if defined
        if(config.special && config.special[command]) {
            // send handling
            if(config.special[command].send && $window.yetu[config.special[command].send]) {
                $window.yetu[config.special[command].send]();
            }
        }

        // call component specific action
        if(registered[active]) {
            registered[active](command);
            if(config.passthrough && config.passthrough[active]) {
                angular.forEach(config.passthrough[active], function(value) {
                    if(registered[value]) {
                        registered[value](command);
                    }
                });
            }
        } else {
            // ...
        }
    };

    var setController = function(name, callback) {
        // console.debug('appRemoteControlService.setController', name);
        if(appRemoteControlConfig.controllers[name]) {
            config = appRemoteControlConfig.controllers[name];
            active = config.order[config.first || 0];
            // in case of already initialized service activate first after controler if set
            if(initialized) {
                $timeout(function() { activate(active); });
            }
        } else {
            throw new Error('Config of remote control doesnt exist for ' + name);
        }
        controller.name = name;
        controller.callback = callback;
    };

    var setOrder = function(order) {
        config.order = order;
    };

    var register = function(name, callback) {
        // console.debug('appRemoteControlService.register', name);
        registered[name] = callback;
        if(active === name && initialized) {
            // activate configured element after registration
            activate(name);
        }
    };

    var deregister = function(name) {
        registered[name] = null;
    };

    var activate = function(name) {
        // console.debug('appRemoteControlService.activate', name);
        if(registered[name]) {
            if(name !== active) {
                action('deactivate');
            }
            active = name;
            registered[name]('activate');
        } else {
            // ...
        }
    };

    var findPrev = function(name) {
        var idx = config.order.indexOf(name);
        if(idx - 1 >= 0) {
            return config.order[idx - 1];
        }
    };

    var findNext = function(name) {
        var idx = config.order.indexOf(name);
        if(idx + 1 < config.order.length) {
            return config.order[idx + 1];
        }
    };

    var deactivate = function(name, force) {
        // console.debug('appRemoteControlService.deactivate', name, force);
        switch(force || last) {
            case 'back': {
                active = null;
                controller.callback(last, name);
                break;
            }
            case 'up':
            case 'left': {
                activate(findPrev(name));
                break;
            }
            case 'down':
            case 'right': {
                activate(findNext(name));
                break;
            }

            // TODO: depending on last command activate next/prev
        }
    };

    $timeout(init, 1000);

    return {
        setController: setController,
        setOrder: setOrder,
        register: register,
        deregister: deregister,
        activate: activate,
        deactivate: deactivate
    };
});
