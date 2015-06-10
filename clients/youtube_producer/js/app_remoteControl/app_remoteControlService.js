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
        controller = { name: null, callback: null};

    var init = function() {
        if($window.yetu) {
            $window.yetu.onAnyActionDetected = function(data, topic, channel){
                // console.debug("yetu message received", data, topic, channel);
                action(topic.replace('control.', ''));
            };
            // simulates remote by keys
            document.onkeydown = function (evt) {
                var key = appRemoteControlConfig.keys[evt.which];
                // console.debug("document.onkeydown", evt.which, key);
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
        }
    };

    var action = function(command) {
        last = command;

        // TODO: if action special

        if(registered[active]) {
            registered[active](command);
            if(config.passthrough && config.passthrough[active]) {
                if(registered[config.passthrough[active]]) {
                    registered[config.passthrough[active]](command);
                }
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
            if(name !== active) {
                registered[active]('deactivate');
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
            activate(config.order[idx - 1]);
        }
    };

    var findNext = function(name) {
        var idx = config.order.indexOf(name);
        if(idx + 1 < config.order.length) {
            activate(config.order[idx + 1]);
        }
    };

    var deactivate = function(name) {
        // console.debug('appRemoteControlService.deactivate', name);
        switch(last) {
            case 'quit': {
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
