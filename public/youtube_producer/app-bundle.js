(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./js/app');
},{"./js/app":11}],2:[function(require,module,exports){
/* global module */
module.exports = ({
    languagesAvailable: ['en', 'de'],
    languages: {
        en:{
            COMMIT_BUTTON_LABEL: 'Play'
        },
        de:{
            COMMIT_BUTTON_LABEL: 'Abspielen'
        }
    }
});

},{}],3:[function(require,module,exports){
/* global module, angular */
module.exports = angular.module('_configs', [])
	.constant('serverPathsConfig', require('./serverPathsConfig'))
    .constant('i18n', require('./i18nConfig'));

},{"./i18nConfig":2,"./serverPathsConfig":4}],4:[function(require,module,exports){
/* global module */
module.exports = ({
    youtubeUrl: '/playlist',
    notificationUrl: '/notification',
    level2Url: '/level2tv',
    imageUrl: '/assets/youtube_producer/img/'
});
},{}],5:[function(require,module,exports){
/*jshint -W083 */
/* global module, config */

/*
 * Dashbord controller
 */
module.exports = (function($scope, ytYoutubeService, $route, $routeParams, $location, $rootScope, $filter, appRemoteControlService) {

    var startSearch = function(value) {
        ytYoutubeService.getResult('search', value).then(function(data) {
            $scope.mainResultList = [data];
        });
    };

    if($routeParams.action === 'search' && $routeParams.param) {
        $rootScope.searchQuery = { value: $routeParams.param };
        startSearch($routeParams.param);
    } else {
        var categoryId, list = [], order = [],
            numberOfCategories = config.dashboardCategories.length;
        // default categories view
        $scope.mainResultList = [];
        // TODO: handle no categories defined
        for(var i = 0; i < numberOfCategories; i++) {
            categoryId = config.dashboardCategories[i].id;
            order.push(categoryId);
            ytYoutubeService.getResult('popular', categoryId).then(function(data) {
                data.order = order.indexOf(data.categoryId);
                // overwrite youtube category name with configured one
                data.title = config.dashboardCategories[data.order].name;
                list.push(data);
                if(numberOfCategories === list.length) {
                    // TODO: decide if defined order of categories is more important than loading time
                    // in this case sort and assigng at once after load all
                    $scope.mainResultList = $filter('orderBy')(list, 'order');
                }
            });
        }
        // TODO: seems always the same videos - should be rerquested more and shuffle?
    }

    appRemoteControlService.setController('dashboard', function(action, name) {

    });

    $rootScope.$on('app:search-value', function(event, query){
        var url = '/dashboard/search/' + query;
        if(url === $location.path()) {
            startSearch(query);
        } else {
            $location.path(url);
        }
    });

    $rootScope.$on('app:search-reset', function(){
        $location.path('/dashboard');
    });
});
},{}],6:[function(require,module,exports){
module.exports = angular.module('_controllers', [])
	.controller('DashboardCtrl', require('./dashboardController'))
    .controller('ViewerCtrl', require('./viewerController'));

},{"./dashboardController":5,"./viewerController":7}],7:[function(require,module,exports){
/* global module */
/*
 * Viewer controller
 */
module.exports = (function($scope, $rootScope, ytYoutubeService, $filter, $routeParams, $location, appRemoteControlService, Notification) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        if($routeParams.time) {
            data.video.startAt = $routeParams.time.replace(/&.+/, ''); // TODO: do it with $routeProvider?
        }
        $scope.video = data.video;
        data.playlist.currentPlaying = 0;
        $scope.playlist = [data.playlist];
    }, function(error) {
        // TODO: error handling
    });

    $rootScope.$on('app:search-value', function(event, query){
        var action = '/dashboard/search/' + query;
        $location.path(action);
    });

    appRemoteControlService.setController('viewer-' + $routeParams.mode, function(action, name) {
        console.debug("appRemoteControlService.setController: $routeParams.mode, action, name;", $routeParams.mode, action, name);
        if(action === 'back' && name === 'player' && $routeParams.mode === 'fullscreen') {
            var url = '/dashboard';
            if($rootScope.searchQuery && $rootScope.searchQuery.value) {
                url += '/search/' + $rootScope.searchQuery.value;
            }
            $location.path(url);
        }
    });

    $rootScope.$on('appSendToTv:send', function(event, data){
        if(data.sent !== true) {
            Notification.error({
                message: $filter('translate')('The video could not be played on TV. Please retry later.'),
                title: $filter('translate')('Play video on TV')
            });
        }
    });
});

},{}],8:[function(require,module,exports){
/* global module */
/*
 * Duration Filter to convert the youtube duration or integer seconds to format [hh:]mm:ss
 */
module.exports = (function() {
    return function(time) {
        var array = [];
        
        if(typeof time === 'number') {
            var hours = parseInt(time / 3600) % 24;
            var minutes = parseInt(time / 60) % 60;
            var seconds = parseInt(time % 60);
            array = [minutes, seconds];
            if(hours) {
                array.unshift(hours);
            }
        } else if(typeof time !== 'undefined' && time !== null) {
            // http://stackoverflow.com/a/19094191
            array = (time || '').match(/(\d+)(?=[MHS])/ig);
        } else {
            return '';
        }

        if(array.length === 1) {
            array.unshift('0');
        }

        return array.map(function(item) {
            if((''+item).length < 2) return '0' + item;
            return item;
        })
        .join(':');
    };
});
},{}],9:[function(require,module,exports){
/* global angular, module */
module.exports = angular.module('_filters', [])
	.filter('duration', require('./durationFilter'))
    .filter('nl2br', require('./nl2brFilter'));

},{"./durationFilter":8,"./nl2brFilter":10}],10:[function(require,module,exports){
/* global module */
/*
 * Filter to convert new lines to br tags
 */
module.exports = (function() {
    return function(text){
        return text ? text.replace(/\n/g, '<br/>') : '';
    };
});
},{}],11:[function(require,module,exports){
var youtubeApp = angular.module('youtubeApp',
    [
        'ngRoute',
        'ngResource',
        'ngCookies',
        'pascalprecht.translate',
        'LocalStorageModule',
        'ui-notification',
        // app modules
        require('./app_input').name,
        require('./app_search').name,
        require('./app_mode').name,
        require('./app_remoteControl').name,
        require('./app_sendToTv').name,
        require('./ui_videoList').name,
        require('./yt_result').name,
        require('./yt_search').name,
        require('./yt_auth').name,
        require('./yt_viewer').name,
        // app main
        require('./_controllers').name,
        require('./_configs').name,
        require('./_filters').name
    ]);

youtubeApp.config(function ($routeProvider, $translateProvider, $httpProvider, i18n) {
    $httpProvider.defaults.useXDomain = true;
    delete $httpProvider.defaults.headers.common['X-Requested-With'];

    // $locationProvider.html5Mode(true);

    var resolve = {
        // needed to init categories first for detailed views
        YouTubeCategories: function(ytYoutubeService) {
            return ytYoutubeService.initialize();
        }
    };

    $routeProvider
        .when('/dashboard/:action?/:param?', {
            controller: 'DashboardCtrl',
            template: require('./dashboardTemplate.html'),
            resolve: resolve
        })
        .when('/view/:mode/:type/:id/:time?', {
            controller: 'ViewerCtrl',
            template: require('./viewerTemplate.html'),
            resolve: resolve
        })
        .otherwise({
            redirectTo: '/dashboard'
        });

    //initialize the $translateProvider with all languages including their strings that are in i18n config file
    for(var i=0; i<i18n.languagesAvailable.length; i++){
        var language = i18n.languagesAvailable[i];
        $translateProvider.translations(language, i18n.languages[language]);
    }
    $translateProvider.preferredLanguage('en');
});

youtubeApp.run(function($location, $translate, appMode, $rootScope, $window){
    var params = $location.search();
    if(params.lang){
        $translate.use(params.lang);
    }
    $rootScope.$on('$routeChangeSuccess', function(){
        $rootScope.appModeClass = appMode.getClass();
        $rootScope.appMode = appMode;
    });
    if(appMode.get() !== 'tv') {
        $window.yetu = null;
        $rootScope.authEnabled = true;
    }
});

},{"./_configs":3,"./_controllers":6,"./_filters":9,"./app_input":15,"./app_mode":17,"./app_remoteControl":20,"./app_search":23,"./app_sendToTv":27,"./dashboardTemplate.html":28,"./ui_videoList":29,"./viewerTemplate.html":38,"./yt_auth":39,"./yt_result":41,"./yt_search":44,"./yt_viewer":47}],12:[function(require,module,exports){
/* global module */
module.exports = ({
    letters: config.input ? config.input.letters.split(' ') : [],
    numbers: config.input ? config.input.numbers.split(' ') : []
});
},{}],13:[function(require,module,exports){
/* global module */
/*
 * <app-key-input ng-model="" remote-control="" activate-parent=""></app-key-input>
 *
 * @attr ng-model object Scope objects with .value field to be used as model for update
 * @attr remote-control string Element name to be registered within remote control service
 * @attr activate-parent string Indicates if parent element with given name should be set as activated on remote control activation
 */
module.exports = function (appKeyInputConfig, appRemoteControlService) {
    return {
        restrict: 'E',
        template: require('./app_keyInputTemplate.html'),
        scope: {
            inputValue: '=ngModel'
        },
        link: function(scope, element, attr){
            var _unbinder = [];

            scope.letters = appKeyInputConfig.letters;
            scope.numbers = appKeyInputConfig.numbers;

            scope.switchList = function(type) {
                type = type || scope.next;
                scope.keyList = scope[type];
                scope.current = 0;
                scope.next = 'letters' === type ? 'numbers' : 'letters';
            };

            scope.addChar = function(event) {
                if(event.target) {
                    var char = angular.element(event.target).attr('char'),
                        value = scope.inputValue.value || '';

                    scope.inputValue.value = value + char;
                }
            };

            scope.deleteChar = function() {
                var value = scope.inputValue.value || '',
                    length = value.length;
                if(length > 0) {
                    scope.inputValue.value = value.substring(0, length - 1);
                }
            };

            var findParent = function(el, name) {
                var tag = name.toUpperCase();
                if(el.parentNode && el.parentNode.tagName === tag) {
                    return angular.element(el.parentNode);
                } else if(el.parentNode) {
                    return findParent(el.parentNode, name);
                } else {
                    throw new Error('Parent tag not found: ' + name);
                }
            };

            var remoteControl = function(command) {

                switch(command) {
                    case 'activate': {
                        if(scope.current === -1) {
                            scope.current = 0;
                        }
                        element.attr('activated', true);
                        if(attr.activateParent) {
                            findParent(element[0], attr.activateParent).attr('activated', true);
                        }
                        break;
                    }
                    case 'deactivate': {
                        scope.current = -1;
                        element.attr('activated', false);
                        if(attr.activateParent) {
                            findParent(element[0], attr.activateParent).attr('activated', false);
                        }
                        break;
                    }
                    case 'enter': {
                        var el = angular.element(element.find('li')[scope.current]);
                        el.triggerHandler('click');
                        break;
                    }
                    case 'left': {
                        scope.current--;
                        if(scope.current < 0) {
                            scope.current = scope.keyList.length + 1;
                        }
                        break;
                    }
                    case 'right': {
                        scope.current++;
                        if(scope.current > scope.keyList.length + 1) {
                            scope.current = 0;
                        }
                        break;
                    }
                    case 'up':
                    case 'down':
                    case 'back': {
                        appRemoteControlService.deactivate(attr.remoteControl);
                        break;
                    }
                }

                if (!scope.$$phase) {
                    scope.$apply();
                }
            };

            // on init
            scope.switchList('letters');
            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }
            
            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};


},{"./app_keyInputTemplate.html":14}],14:[function(require,module,exports){
module.exports = "<li class=\"char c-{{ ::key }}\" char=\"{{ ::key }}\" ng-click=\"addChar($event)\" activated=\"{{ $index == current }}\" ng-repeat=\"key in keyList\">\r\n    <span char=\"{{ ::key }}\">{{ ::key }}</span>\r\n</li>\r\n<li class=\"button del\" ng-click=\"deleteChar()\" activated=\"{{ keyList.length == current }}\"></li>\r\n<li class=\"button switch {{ next }}\" activated=\"{{ keyList.length + 1 == current }}\" ng-click=\"switchList()\"></li>";

},{}],15:[function(require,module,exports){
module.exports = angular.module('app_input', [])
    .constant('appKeyInputConfig', require('./app_keyInputConfig'))
	.directive('appKeyInput', require('./app_keyInputDirective'));

},{"./app_keyInputConfig":12,"./app_keyInputDirective":13}],16:[function(require,module,exports){
/**
 * Service detecting application mode
 */
module.exports = (function ($routeParams, $rootScope, $location, $timeout) {
	'use strict';

    var _mode = null;

    var set = function (mode) {
        _mode = mode;
    };

    /**
     * @returns {String} Application mode
     */
    var get = function() {
        return _mode;
    };

    /**
     * @returns {Boolean} Returns true if TV enviroment detected
     */
    var isTV = function() {
        return 'tv' === get();
    };

    /**
     * @returns {Boolean} Returns true if PC enviroment detected
     */
    var isPC = function() {
        return 'tv' !== get();
    };

    /**
     * @returns {String} Classes names depending on application mode and view type (if applied)
     */
    var getClass = function() {
        return get() + 'mode ' + $routeParams.mode;
    };

    /**
     * @returns {String} View mode depending on view type (if applied)
     */
    var getView = function() {
        return $routeParams.mode;
    };

    /**
     * @returns {String} Application mode depending on system ('tv'|'pc')
     */
    var _detect = function() {
        if($location.absUrl().match(/\/level2tv[\/#]/)) {
            _mode = 'tv';
        } else {
            _mode = 'pc';
        }
    };

    _detect();

    return {
        set: set,
        get: get,
        isTV: isTV,
        isPC: isPC,
        getClass: getClass,
        getView: getView
    };
});

},{}],17:[function(require,module,exports){
module.exports = angular.module('app_mode', [])
	.service('appMode', require('./app_modeService'));

},{"./app_modeService":16}],18:[function(require,module,exports){
/* global module */

/**
 * Configuration for remote control service. It contains:
 * - keys: key binding for simulating remote controls with keyboard
 * - special: general key handler - mainly for controllers independent actions - for particular key action can be:
 *      - route: change location path to given
 *      - ...
 * - controllers: controller actions configuration (key as name used by setController method), which can contain:
 *      - order: order of modules used for navigation between them
 *      - special: special action to be executed if particular key is pressed, can be:
 *              - activate: activation of other module
 *              - send: calls given method to yetu library
 *      - passthrough: passes event to other module if currentmodule is active now (syntax: { currentmodule: 'other' })
 */

module.exports = ({
    // key configuration to simulate remote control events with keyboard
    keys: {
        87: 'up',    // w
        65: 'left',  // a
        68: 'right', // d
        69: 'enter', // e
        83: 'down',  // s
        81: 'back',  // q
        72: 'home',  // h
        77: 'menu',  // m
        80: 'play'   // p
    },

    special: {
        home: {
            route: '/'
        }
    },
    
    controllers: {
        dashboard: {
            order: ['input', 'result'],
            first: 0,
            special: {
                menu: { activate: 'search' },
                back: { send: 'sendQuit' }
            }
        },

        // viewer has different controls based on display type
        'viewer-fullscreen': {
            order: ['playlist', 'player'],
            first: 1,
            passthrough: {
                player: ['controlbar']
            }
        },
        'viewer-expand': {
            order: ['search', 'playlist'],
            first: 1
        },
        'viewer-normal': {
            order: ['search', 'playlist'],
            first: 1
        },
        'viewer-undefined': {
            order: ['search', 'playlist'],
            first: 1
        }
    }
});
},{}],19:[function(require,module,exports){
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
            // activate first element
            activate(active);
            initialized = true;
        }
    };

    var action = function(command) {
        // console.debug('appRemoteControlService.action', command, 'active:', active);
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
                console.debug( "config.special[command].send: ", command, $window.yetu[config.special[command].send]);
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

},{}],20:[function(require,module,exports){
module.exports = angular.module('app_remoteControl', [])
    .constant('appRemoteControlConfig', require('./app_remoteControlConfig'))
	.service('appRemoteControlService', require('./app_remoteControlService'));
    /* TODO: attribute directive as decorator?? */
},{"./app_remoteControlConfig":18,"./app_remoteControlService":19}],21:[function(require,module,exports){
/* global module */
/*
 * <app-search placeholder="" ng-model="" value="" trigger-search="enter,button,auto" auto-delay="" allow-repeat="" on-search="" on-reset="" 
 *             key-input="" remote-control=""></app-search>
 *
 * @attr placeholder string Placeholder text
 * @attr ng-model object Scope objects with .value field to be used as model for update
 * @attr value string Predefined value
 * @attr trigger-search string Comma separated triggers for searching start: enter - by Enter key, button - search button, auto - automatically started on typing
 * @attr auto-delay integer Triggering search after X ms of change (0 for disable) - for auto trigger
 * @attr allow-repeat boolean Allow repeatition of the same value if not changed (for example on enter and button)
 * @attr on-search string|fn Search event name (default 'app:search-value') or callback function
 * @attr on-reset string|fn Reset search event name (default 'app:search-reset') or callback function
 * @attr remote-control string Element name to be registered within remote control service
 * @attr key-input boolean [optional] Indicates if app-input directive has to be added
 */
module.exports = function (appRemoteControlService) {
    return {
        restrict: 'E',
        template: require('./app_searchTemplate.html'),
        scope: {
            searchQuery: '=?ngModel',
            placeholder: '@placeholder',
            keyInput: '@?'
        },
        link: function(scope, element, attr){
            var _unbinder = [],
                triggerButton = attr.triggerSearch && attr.triggerSearch.indexOf('button') > -1,
                triggerEnter = attr.triggerSearch && attr.triggerSearch.indexOf('enter') > -1,
                triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1,
                input = element.find('input')[0],
                $input = angular.element(input);

            if(!scope.searchQuery) {
                scope.searchQuery = {};
            }

            if(attr.value) {
                scope.searchQuery.value = attr.value;
            }

            scope.searchButtonClick = function() {
                if (triggerButton === true) {
                    scope.initSearch(input.value);
                }
            };
            scope.searchOnKeyUp = function (event) {
                if (triggerEnter === true && event.keyCode === 13) {
                    scope.initSearch(event.target.value);
                }
            };
            scope.initSearch = function(value, auto) {
                if (scope.emitted === value && attr.allowRepeat !== "true") {
                    return;
                }
                // fixes late binding of auto param
                if(auto) {
                    triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1;
                    if(!triggerAuto) {
                        return;
                    }
                }
                if (value) {
                    scope.$emit(attr.eventSearch || 'app:search-value', value);
                } else {
                    scope.$emit(attr.eventReset || 'app:search-reset');
                }
                scope.emitted = value;
            };

            $input.on('click', function() {
                if(!input.isFocused) {
                    input.select();
                    input.isFocused = true;
                }
            });

            $input.on('blur', function(event) {
                input.isFocused = false;
            });

            _unbinder.push(scope.$watchCollection('searchQuery', function (model) {
                if(model) {
                    scope.initSearch(model.value, true);
                }
            }));

            var remoteControl = function(command) {

                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        break;
                    }
                    case 'up':
                    case 'down': {
                        appRemoteControlService.deactivate(attr.remoteControl);
                        break;
                    }
                    case 'enter': {
                        var el = angular.element(element.find('button')[0]);
                        el.triggerHandler('click');
                        break;
                    }
                }
            };
            
            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }

            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl, remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
        }
    };
};


},{"./app_searchTemplate.html":22}],22:[function(require,module,exports){
module.exports = "<div class=\"app-search\">\r\n    <input class=\"query\" ng-model=\"searchQuery.value\" ng-model-options=\"{ debounce: 500 }\" ng-keyup=\"searchOnKeyUp($event)\" type=\"text\"\r\n        placeholder=\"{{placeholder}}\" value=\"{{searchQuery.value}}\">\r\n    <button class=\"search\" ng-click=\"searchButtonClick()\">\r\n        <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n            viewBox=\"0 0 21.7 21.7\" enable-background=\"new 0 0 21.7 21.7\" xml:space=\"preserve\">\r\n            <path fill=\"#777\" d=\"M21.7,20.3l-6-6c1.2-1.5,1.9-3.4,1.9-5.5c0-4.9-4-8.8-8.8-8.8C4,0,0,4,0,8.8c0,4.9,4,8.8,8.8,8.8\r\n                c2.1,0,4-0.7,5.5-1.9l6,6L21.7,20.3z M8.8,15.6C5.1,15.6,2,12.6,2,8.8C2,5.1,5.1,2,8.8,2c3.8,0,6.8,3.1,6.8,6.8\r\n                C15.6,12.6,12.6,15.6,8.8,15.6z\"/>\r\n        </svg>\r\n    </button>\r\n    <app-key-input class=\"clearfix\" ng-model=\"searchQuery\" ng-if=\"keyInput\" remote-control=\"input\" activate-parent=\"app-search\"></app-key-input>\r\n</div>";

},{}],23:[function(require,module,exports){
module.exports = angular.module('app_search', ['pascalprecht.translate'])
	.directive('appSearch', require('./app_searchDirective'));

},{"./app_searchDirective":21}],24:[function(require,module,exports){
module.exports = function($rootScope, appSendToTvService) {
    return {
        restrict: 'E',
        template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            data: '=ngModel',
            playingOnTv: '=?'
        },
        link: function(scope) {
            scope.onSendButtonClick = function() {
                if(!scope.playingOnTv) {
                    if(!scope.pendingSend) {
                        scope.pendingSend = true;
                        appSendToTvService.sendToTv(scope.data)
                            .then(function() {
                                scope.playingOnTv = true;
                            })
                            .finally(function() {
                                scope.pendingSend = false;
                            });
                    }
                } else {
                    scope.playingOnTv = false;
                    $rootScope.$broadcast('appSendToTv:resume');
                }
            };
        }
    };
};

},{"./app_sendToTvTemplate.html":26}],25:[function(require,module,exports){
module.exports = (function ($rootScope, $http, $location, $filter, serverPathsConfig) {
    'use strict';

    var buildPayload = function (data) {
        var url = $location.protocol() + '://' + $location.host() + ":" + $location.port(),
            actTime = !data.actTime || data.actTime - 5 < 0 ? 0 : data.actTime - 5,
            // for localhost testing set target url explicitly
            // url = 'https://youtubeapp-dev.yetu.me',
            payload = {
                action: {
                    url: url + serverPathsConfig.level2Url + "#/view/fullscreen/" + data.type + "/" + data.id + "/" + actTime,
                    type: "open",
                    button: {
                        icon: url + serverPathsConfig.imageUrl + "notification_play.svg",
                        label: "Play" //TODO: add i18n.COMMIT_BUTTON_LABEL
                    }
                },
                headline: encodeURI(data.title),
                stream: {
                    owner: data.channel,
                    title: encodeURI(data.title),
                    image: data.img,
                    duration: $filter('duration')(data.duration),
                    publishDate: $filter('timeAgo')(data.created),
                    viewCount: data.views,
                    resolution: data.resolution
                }
            };

        return payload;
    };

    var sendPayload = function (payload) {

        var sendResult = {
            name: decodeURI(payload.headline || ''),
            sent: true
        };

        return $http.post(serverPathsConfig.youtubeUrl, payload)
            .success(function () {
                $rootScope.$broadcast('appSendToTv:send', sendResult);
            })
            .error(function (data, status) {
                // replace default success with error
                sendResult.sent = status === 401 ? 401 : false;
                $rootScope.$broadcast('appSendToTv:send', sendResult);
            });
    };

    var sendToTv = function (data) {
        return sendPayload(buildPayload(data));
    };

    return {
        sendToTv: sendToTv
    };
});

},{}],26:[function(require,module,exports){
module.exports = "<button class=\"{{ class || 'app-send-to-tv'}}\" ng-click=\"onSendButtonClick($event)\">\r\n    <span class=\"label_sendToTv\" ng-hide=\"playingOnTv\">\r\n        <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 30 20\" enable-background=\"new 0 0 30 20\" xml:space=\"preserve\">\r\n            <g>\r\n                <g>\r\n                    <g>\r\n                        <path fill=\"#FFFFFF\" d=\"M28.4,0.9h-21v4h1v-3h19v14h-19v-2.8h-1v3.8h8.3c-0.8,0.5-1.4,1.3-1.5,2.2l7.6,0c-0.2-0.9-0.7-1.7-1.5-2.2h8.3V0.9z\"/>\r\n                    </g>\r\n                </g>\r\n                <polygon fill=\"#FFFFFF\" points=\"1.6,2.7 1.6,15 12.3,8.9\"/>\r\n            </g>\r\n        </svg>\r\n        <span class=\"btnLabel\">{{ ::('Play video on TV' | translate) }}</span>\r\n    </span>\r\n    <span class=\"label_stopStreaming\" ng-show=\"playingOnTv\">\r\n        <svg version=\"1.1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 28.8 19.6\" enable-background=\"new 0 0 28.8 19.6\" xml:space=\"preserve\">\r\n            <g>\r\n                <g>\r\n                    <g>\r\n                        <path fill=\"#FFFFFF\" d=\"M27.1,1.4H6v4h1v-3h19v14H7v-2.8H6v3.8h8.3c-0.8,0.5-1.4,1.3-1.5,2.2l7.6,0c-0.2-0.9-0.7-1.7-1.5-2.2h8.3V1.4z\"/>\r\n                        <polygon fill=\"#FFFFFF\" points=\"0.3,3.3 0.3,15.6 11,9.4\"/>\r\n                    </g>\r\n                </g>\r\n            </g>\r\n            <g>\r\n                <g>\r\n                    <rect fill=\"#FFFFFF\" x=\"1.7\" y=\"9\" transform=\"matrix(0.7965 -0.6046 0.6046 0.7965 -2.3774 11.9133)\" width=\"29.6\" height=\"1\"/>\r\n                </g>\r\n            </g>\r\n        </svg>\r\n        <span class=\"btnLabel\">{{ ::('Resume playing' | translate) }}</span>\r\n    </span>\r\n</button>\r\n";

},{}],27:[function(require,module,exports){
module.exports = angular.module('app_sendToTv', ['ngResource'])
  .service('appSendToTvService', require('./app_sendToTvService'))
  .directive('appSendToTv', require('./app_sendToTvDirective'));



},{"./app_sendToTvDirective":24,"./app_sendToTvService":25}],28:[function(require,module,exports){
module.exports = "<!-- TODO: distinguish type on application mode tv/pc -> regular/inline -->\r\n<yt-result-set ng-model=\"mainResultList\" play-link=\"#/view/:type/:id\" display=\"floating\" control=\"{{ ::appMode.get() }}\" service=\"ytYoutubeService\" remote-control=\"result\"></yt-result-set>\r\n";

},{}],29:[function(require,module,exports){
module.exports = angular.module('ui_videoList', ['ngResource', 'pascalprecht.translate'])
        .directive('uiVideoList', require('./ui_videoListDirective'))
        .directive('uiVideoListItem', require('./ui_videoListItemDirective'))
        .directive('uiVideoListPlayArrow', require('./ui_videoListPlayArrowDirective'))
        .directive('uiVideoListPlaylistIcon', require('./ui_videoListPlaylistIconDirective'));


},{"./ui_videoListDirective":30,"./ui_videoListItemDirective":31,"./ui_videoListPlayArrowDirective":33,"./ui_videoListPlaylistIconDirective":35}],30:[function(require,module,exports){
/*
 * <ui-video-list ng-model="" display="floating" control="pc" play-link="" service="" load-more=""></ui-video-list>
 *
 * @attr ng-model array Scope model to be used as data feed - model containing: { etag, next, items }
 *                      where etag and next are part of data provided by service and used for getNext method,
 *                            items is array of { type, id, item, img, created, description, ...},
 *                                  where type: playlist|video
 * @attr display string Display type - 'horizontal', 'list' or 'floating' (default) for styling and controls behaviour
 * @attr control string Control style - 'tv' or 'pc' (default) - used for control and reacting on events @todo
 * @attr play-link string Link pattern to open video - will replace :attribute if found in element item properties (e.g. '#/show/:type/:id')
 * @attr service string Name of service with "load more" functionality (getNext method) - used by load-more functionality
 * @attr load-more string 'button' - indicates if button "load more" should be appended; 'scroll' - indicates if "load more" should be called on scroll bottom
 * @attr play-fn string Function name to open video - should be defined in scope and accept list index param ($index of ng-repeat is used).
 *                      Note: if play-fn is defined the whole item element is bind to click handler
 */
module.exports = function ($window, $timeout) {
    return {
        restrict: 'E',
        template: require('./ui_videoListTemplate.html'),
        scope: {
            videoList: '=ngModel',
            playLink: '@?playLink',
            playFn: '@?playFn', // TODO: some function binding?
            displayType: '@display',
            controlType: '@control',
            loadMore: '@?loadMore'
        },
        controller: function ($scope, $element, $attrs, $injector) {
            var myService;

            if ($attrs.service) {
                myService = $injector.get($attrs.service);
            }

            /**
             * Internal function for finding function wherever defined in parent scope (given as fn name)
             * @param {object} scpe Initial scope
             * @param {string} name Function name
             * @returns {function|null} Found function or null
             */
            $scope.findFunction = function(scpe, name) {
                if(typeof(scpe[name]) === 'function') {
                    return scpe[name];
                } else if (scpe.$parent && typeof(scpe.$parent[name]) === 'function') {
                    return scpe.$parent[name];
                } else if(scpe.$parent) {
                    return $scope.findFunction(scpe.$parent, name);
                } else {
                    return null;
                }
            };

            $scope.loadNext = function(callback) {
                if(!$scope.videoList || !$scope.videoList.etag || !$scope.videoList.next || $scope.loadingMore) {
                    return;
                }

                $scope.loadingMore = true;

                myService.getNext($scope.videoList.etag, $scope.videoList.next).then(
                    function(moreVideos){
                        var temparray = $scope.videoList.items;
                        $scope.videoList.items = temparray.concat(moreVideos.items);
                        $scope.videoList.next = moreVideos.next;
                        if(callback) {
                            $timeout(callback); // after compilation
                        }
                    })
                    .finally(function() {
                        $scope.loadingMore = false;
                    });
            };

        },
        link: function (scope, element){
            var container = element[0],
                playFunction = null;

            // default display type
            if (!scope.displayType) {
                scope.displayType = 'floating';
            }

            // find play function if defined
            if(scope.playFn) {
                playFunction = scope.findFunction(scope, scope.playFn);
            }

            // add display type as a class also
            element.addClass(scope.displayType);

            scope.playFunction = function (index) {
                if (typeof(playFunction) === 'function') {
                    playFunction(index);
                } else {
                    console.error('ui-video-directive: ' + scope.playFn + ' is not a function');
                }
            };

            if(scope.loadMore === 'scroll') {
                // TODO: check in unbind necessary on $destroy
                element.bind('scroll', function () {
                        var distance = container.scrollHeight * 0.1; // 10% from the end
                        var toBottom = container.scrollHeight - container.clientHeight - container.scrollTop;

                    if(toBottom < distance) {
                        scope.loadNext();
                    }
                });

                angular.element($window).bind('scroll', function() {
                    if (container.scrollHeight - container.clientHeight !== 0 ||
                            scope.videoList && scope.videoList.items.length === 0 ||
                            element.hasClass('ng-hide')) {
                        // in case of container has scroll or there is no items or is hidden - do nothing
                        return;
                    }

                    var distance = document.body.scrollHeight * 0.1; // 10% to end
                    var toBottom = document.body.scrollHeight - window.innerHeight - window.scrollY;

                    if(toBottom < distance) {
                        scope.loadNext();
                    }
                });
            }
        }
    };
};
},{"./ui_videoListTemplate.html":37}],31:[function(require,module,exports){
/* global angular, module */

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListItemTemplate.html'),
		link: function(scope, element){
        }
	};
};

},{"./ui_videoListItemTemplate.html":32}],32:[function(require,module,exports){
module.exports = "<div class=\"img\">\r\n    <a ng-if=\"::playLink\" class=\"playimg\" ng-href=\"#/view/{{::(controlType == 'tv' ? 'fullscreen' : 'expand') }}/{{::item.type}}/{{::item.id}}\"> <!-- TODO: replace href with {{ playLink | replaceParams }} -->\r\n        <ui-video-list-play-arrow></ui-video-list-play-arrow>\r\n        <img ng-if=\"::item.img\" ng-src=\"{{::item.img}}\"/>\r\n    </a>\r\n    <a ng-if=\"::playFn\" class=\"playimg\">\r\n        <div class=\"index\">{{ ::($index + 1) }}</div>\r\n        <ui-video-list-play-arrow></ui-video-list-play-arrow>\r\n        <img ng-if=\"::item.img\" ng-src=\"{{::item.img}}\"/>\r\n    </a>\r\n    <div ng-if=\"::(item.type == 'video')\" class=\"duration\"><span>{{ item.duration | duration }}</span></div><!-- TODO: one-time binding with filter? -->\r\n    <div ng-if=\"::(item.type == 'playlist')\" class=\"items\"><ui-video-list-playlist-icon></ui-video-list-playlist-icon><span>{{ ::item.totalItems }}</span></div>\r\n</div>\r\n<div class=\"metadata\">\r\n    <a class=\"title\" ng-if=\"::playLink\" class=\"playimg\" ng-href=\"#/view/{{::(controlType == 'tv' ? 'fullscreen' : 'expand') }}/{{::item.type}}/{{::item.id}}\"> <!-- TODO: replace href with {{ playLink | replaceParams }} -->\r\n        {{::item.title | limitTo : 50 }}<span ng-show=\"item.title.length >= 50\">...</span>\r\n    </a>\r\n    <a class=\"title\" ng-if=\"::playFn\" class=\"playimg\">\r\n        {{::item.title | limitTo : 50 }}<span ng-show=\"item.title.length >= 50\">...</span>\r\n    </a>\r\n    <p class=\"subtitle\" ng-if=\"::item.channel\">\r\n        <span class=\"channel\">by {{::item.channel}}</span><br />\r\n        <span class=\"created\">{{ ::item.created | timeAgo }}</span>\r\n    </p>\r\n    <p class=\"description\" data-type=\"description\" cw-reveal-label ng-if=\"::item.description\">\r\n        {{::item.description | limitTo : 75 }}<span ng-show=\"item.description.length >= 75\">...</span>\r\n    </p>\r\n    <p class=\"description\" ng-if=\"::(!item.description)\">No description available.</p>\r\n</div>\r\n<div class=\"buttons\">\r\n    <app-send-to-tv ng-model=\"::item\"></app-send-to-tv>\r\n</div>\r\n";

},{}],33:[function(require,module,exports){
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListPlayArrowTemplate.html'),
		link: function(){
		}
	};
};

},{"./ui_videoListPlayArrowTemplate.html":34}],34:[function(require,module,exports){
module.exports = "<svg version=\"1.1\" id=\"arrow\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 12 13\" enable-background=\"new 0 0 12 13\" xml:space=\"preserve\">\r\n    <defs>\r\n        <filter id=\"dropshadow\" x=\"-25%\" y=\"-25%\" height=\"150%\" width=\"150%\">\r\n            <feGaussianBlur in=\"SourceAlpha\" stdDeviation=\"1\"/>\r\n            <feOffset dx=\"0.25\" dy=\"0.25\" result=\"offsetblur\"/>\r\n            <feMerge>\r\n                <feMergeNode/>\r\n                <feMergeNode in=\"SourceGraphic\"/>\r\n            </feMerge>\r\n        </filter>\r\n    </defs>\r\n    <polygon filter=\"url(#dropshadow)\" fill=\"#FFFFFF\" points=\"1,0.5 11,6.5 1,12.5\"/>\r\n</svg>";

},{}],35:[function(require,module,exports){
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListPlaylistIconTemplate.html'),
		link: function(){
		}
	};
};

},{"./ui_videoListPlaylistIconTemplate.html":36}],36:[function(require,module,exports){
module.exports = "<svg version=\"1.1\" id=\"playlist-icon\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n\t viewBox=\"0 0 22 14.9\" enable-background=\"new 0 0 22 14.9\" xml:space=\"preserve\">\r\n<g>\r\n\t<rect x=\"0.6\" y=\"0.7\" fill=\"#FFFFFF\" stroke=\"#000000\" stroke-miterlimit=\"10\" width=\"17\" height=\"9.6\"/>\r\n\t<rect x=\"2.4\" y=\"2.6\" fill=\"#FFFFFF\" stroke=\"#000000\" stroke-miterlimit=\"10\" width=\"17\" height=\"9.6\"/>\r\n\t<rect x=\"4.3\" y=\"4.6\" fill=\"#FFFFFF\" stroke=\"#000000\" stroke-miterlimit=\"10\" width=\"17\" height=\"9.6\"/>\r\n</g>\r\n</svg>";

},{}],37:[function(require,module,exports){
module.exports = "<ui-video-list-item class=\"ui-video-list-item\" ng-repeat=\"item in videoList.items\" ng-click=\"playFn ? playFunction($index) : null\"></ui-video-list-item>\r\n<div class=\"load-more-wrap clearfix\">\r\n    <button class=\"load-more\" ng-if=\"::(loadMore == 'button' && videoList.items.length > 0)\" ng-click=\"loadNext()\">\r\n        {{ ::('Load more videos' | translate) }}\r\n        <ui-video-list-play-arrow class=\"arrow-svg\"></ui-video-list-play-arrow>\r\n    </button>\r\n</div>\r\n\r\n<div class=\"spinner\" ng-class=\"{ loading: loadingMore }\">Loading...</div>\r\n<div ng-if=\"videoList.items.length == 0\">\r\n    {{ ::('No results found' | translate) }}\r\n</div>\r\n";

},{}],38:[function(require,module,exports){
module.exports = "<yt-viewer video-model=\"video\" playlist-model=\"playlist\"></yt-viewer>\r\n";

},{}],39:[function(require,module,exports){
module.exports = angular.module('yt_auth', ['ngResource'])
	.directive('ytAuth', require('./yt_authDirective'));

},{"./yt_authDirective":40}],40:[function(require,module,exports){
/* global angular, module, config */
module.exports = function ($window, $http, $interval, $log, $timeout, $rootScope) {
    'use strict';
    return {
        restrict: 'E',
        link: function (scope, element, attr) {
            //TODO: use more angular.js methods instead of mix of native and angular stuff
            var openidIframe, timerID;

            function init() {
                openidIframe = document.createElement('iframe');
                openidIframe.src = config.authServer + '/assets/login_status.html';
                openidIframe.id = 'openid-provider';
                openidIframe.style.visibility = 'hidden';
                openidIframe.style.display = 'none';
                document.body.appendChild(openidIframe);
                openidIframe.onload = check_session;
                timerID = setInterval(check_session, config.sessionPollingInterval * 1000);
                angular.element($window).on('message', receiveMessageP);
            }

            function check_session() {
                var win = openidIframe.contentWindow;
                win.postMessage('youtubeApp ' + config.userUUID, config.authServer);
            }

            function receiveMessageP(event) {
                if (event.originalEvent) {
                    event = event.originalEvent;
                }
                if (event.origin !== config.authServer) {
                    // $log.log('event.origin domain [' + event.origin + '] does not match the configured domain [' + config.authServer + ']');
                    return;
                }
                var stat = event.data;
                // $log.log('poller | received message:' + stat);
                if (stat === 'invalid') {
                    $log.log('session=invalid! Logging out and redirecting');
                    clearInterval(timerID);
                    $window.location.href = '/signOut';
                }
            }

            init();
        }
    };
};

},{}],41:[function(require,module,exports){
module.exports = angular.module('yt_result', ['ngResource', 'pascalprecht.translate', 'ui_videoList'])
    .directive('ytResultSet', require('./yt_resultSetDirective'));


},{"./yt_resultSetDirective":42}],42:[function(require,module,exports){
/*
 * <yt-result-set ng-model="" display="" control="" play-link="" play-fn="" load-more=""></yt-result-set>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { type, title, items, ...@see ui-video-list},
 *                      where type determines search strategy - used by search/load
 * @attr display @see ui-video-list
 * @attr control @see ui-video-list
 * @attr play-link @see ui-video-list
 * @attr play-fn @see ui-video-list
 * @attr load-more @see ui-video-list
 *
 */
module.exports = function (appRemoteControlService, $location) {
	return {
		restrict: 'E',
		template: require('./yt_resultSetTemplate.html'),
        scope: {
            resultLists: '=ngModel',
            playLink: '@?playLink',
            playFn: '@?playFn',
            displayType: '@display',
            controlType: '@control',
            loadMore: '@loadMore'
        },
		controller: function($scope) {
		},
		link: function(scope, element, attr){
            var _unbinder = [], items = [], rows = [],
                current, $current, parent, $parent, $container, lists, loadNext, row, elementDistance, perRow;

            var activate = function(act) {
                // deactivate old
                if(items[current]) {
                    angular.element(items[current]).attr('activated', false);
                    if(lists.length > 1) {
                        parent = items[current].parentNode;
                        $parent = angular.element(parent);
                        $parent.css({transform: 'translate(0, 0)'});
                        angular.element(parent.parentNode.parentNode).removeClass('row-' + items[current].rowNumber + '-activated');
                        // check if row switched and reset to first in row, but not for left (-1)
                        if(items[act] && items[current].rowNumber !== items[act].rowNumber &&  current - act !== 1) {
                            act = items.indexOf(rows[items[act].rowNumber - 1][0]);
                        }
                    }
                }
                // activate new
                current = act;
                if(current !== null) {
                    parent = items[current].parentNode;
                    $container = angular.element(parent.parentNode.parentNode);
                    $parent = angular.element(parent);
                    $current = angular.element(items[current]).attr('activated', true);

                    if(lists.length > 1) {
                        $container.addClass('row-' + items[current].rowNumber + '-activated');
                        // TODO: adapt to calculate different number of elements in row if needed
                        $parent.css({transform: 'translate(-' + (( current - perRow * ( items[current].rowNumber - 1 )) * elementDistance.x) + 'px, 0px)'});
                    } else {
                        $parent.css({transform: 'translate(-' + (current * elementDistance.x) + 'px, 0px)'}); // TODO: evantually add control of Y
                    }
                }
            };

            var populateItems = function() {
                lists = element.find('ui-video-list');
                angular.forEach(lists, function(val, key) {
                    var its = angular.element(val).find('ui-video-list-item');
                    rows[key] = [];
                    angular.forEach(its, function(it, pos) {
                        it.rowNumber = key + 1;
                        it.positionIndex = pos;
                        rows[key].push(it);
                        if(items.indexOf(it) === -1) {
                            items.push(it);
                        }
                    });
                });
                perRow = items.length / lists.length;
            };

            var remoteControl = function(command) {
                var num;
                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        populateItems();
                        if(lists[0]) {
                            loadNext = angular.element(lists[0]).isolateScope().loadNext;
                        }
                        elementDistance = {
                            x: items[1] && items[0] ? items[1].offsetLeft - items[0].offsetLeft : 0,
                            y: items[1] && items[0] ? items[1].offsetTop - items[0].offsetTop : 0
                        };
                        activate(current || 0);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        if(lists.length !== 1) {
                            // reset to first if multiline
                            activate(null);
                        } else {
                            // just remove attribute without calling full deactivation otherwise
                            angular.element(items[current]).attr('activated', false);
                        }
                        break;
                    }
                    case 'up': {
                        if(lists.length === 1) {
                            // deactivate to go to top element (search)
                            appRemoteControlService.deactivate(attr.remoteControl);
                            return;
                        }
                        // no break;
                    }
                    case 'left': {
                        num = command === 'left' ? 1 : 4;
                        if(current - num > 0) {
                            activate(current - num);
                        } else {
                            if(current === 0) {
                                // deaxtivate on next press of first element
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(0);
                        }
                        break;
                    }

                    case 'down': {
                        if(lists.length === 1) {
                            // deactivate to go to bottom element (player)
                            appRemoteControlService.deactivate(attr.remoteControl);
                            return;
                        }
                        // no break;
                    }
                    case 'right': {
                        num = command === 'right' ? 1 : 4;
                        if(current + num < items.length) {
                            activate(current + num);
                        } else {
                            if(current === items.length - 1 && attr.remoteControl !== 'playlist') {
                                // deaxtivate on next press of last element; but not for playlist
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(items.length - 1);
                        }
                        // load more if button with method exists and list is single type
                        if(current + num >= items.length - 8) {
                            if(loadNext && lists.length === 1) {
                                loadNext(function() {
                                    populateItems();
                                });
                            }
                        }
                        break;
                    }
                    case 'play':
                    case 'enter': {
                        var el = $current.find('a')[0];
                        if(el.hash) {
                            $location.path(el.hash.substring(1));
                        } else {
                            $current.triggerHandler('click');
                            appRemoteControlService.deactivate(attr.remoteControl, 'down');
                        }
                        break;
                    }
                }
            };

            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }

            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl, remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
		}
	};
};
},{"./yt_resultSetTemplate.html":43}],43:[function(require,module,exports){
module.exports = "<div class=\"{{ class || 'yt-result-set' }}\">\r\n  <div ng-repeat=\"videoList in resultLists\" class=\"result\">\r\n    <h2 class=\"list-title {{ videoList.type }}\">{{ videoList.title }}</h2>\r\n    <ui-video-list row=\"{{ $index + 1 }}\" class=\"{{ ::(class || 'ui-video-list') }} {{ ::displayType }} {{ ::videoList.type }} clearfix\" ng-model=\"videoList\"\r\n        play-link=\"{{ ::playLink }}\" play-fn=\"{{ ::playFn }}\" display=\"{{ ::displayType }}\" control=\"{{ ::controlType }}\" service=\"ytYoutubeService\" load-more=\"{{ ::( loadMore || 'button') }}\">\r\n    </ui-video-list>\r\n  </div>\r\n</div>\r\n";

},{}],44:[function(require,module,exports){
module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
    .constant('ytYoutubeServiceConfig', require('./yt_youtubeServiceConfig'))
	.service('ytYoutubeService', require('./yt_youtubeService'));

},{"./yt_youtubeService":45,"./yt_youtubeServiceConfig":46}],45:[function(require,module,exports){
/* global angular, module, config */
module.exports = (function ($http, $q, ytYoutubeServiceConfig, localStorageService) {
    'use strict';
    var queries = {},
        settings = ytYoutubeServiceConfig,
        _initialized = false,
        categories = {};

    var processResultList = function(type, data, query){
        var list = [],
            playlists = [],
            playlists_map = [],
            videos = [],
            videos_map = [],
            meta = null;
        
        data.items.forEach(function(item){
            var kind, id;

            if(type === 'playlist') {
                kind = item.snippet.resourceId.kind.replace('youtube#', '');
                id = item.snippet.resourceId[kind+'Id'];
            } else {
                // for search result kind is inside id
                kind = (item.id.kind || item.kind).replace('youtube#', '');
                id = item.id[kind+'Id'] || item.id;
            }

            var newListItem = {
                type: kind,
                id : id,
                title: item.snippet.title,
                img: item.snippet.thumbnails ? item.snippet.thumbnails.medium.url : null, // deleted videos have no image
                channel: 'video' === kind ? item.snippet.channelTitle : '',
                created: item.snippet.publishedAt,
                description: item.snippet.description,
                views: item.statistics ? item.statistics.viewCount : null
            };

            if(kind === 'playlist') {
                playlists.push(id);
                playlists_map[id] = list.length;
                // gets video id from image in case of video duration need
                // id = item.snippet.thumbnails.medium.url.match(/vi\/(.+?)\//)[1];
            } else if(item.snippet && item.contentDetails && item.statistics) {
                // if already get just use without next request
                newListItem.duration = item.contentDetails.duration;
                newListItem.category = categories[item.snippet.categoryId] ? categories[item.snippet.categoryId].title : null;
                newListItem.views = item.statistics.viewCount;
            } else {
                videos.push(id);
                videos_map[id] = list.length;
            }

            list.push(newListItem);
        });

        if(playlists.length) {
            $http.get(settings.playlists.url, {
                params: {
                    id: playlists.join(','),
                    key: settings.developerToken,
                    part: settings.playlists.part,
                    maxResults: playlists.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[playlists_map[item.id]].channel = item.snippet.channelTitle;
                    list[playlists_map[item.id]].totalItems = item.contentDetails.itemCount;
                });
            });
        }

        if(videos.length) {
            $http.get(settings.video.url, {
                params: {
                    id: videos.join(','),
                    key: settings.developerToken,
                    // duration, categoyId and views for detailed views, duration only for search/categories
                    part: 'search' === type || 'popular' === type ? 'contentDetails' : 'snippet,contentDetails,statistics',
                    maxResults: videos.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    if(item.snippet) {
                        list[videos_map[item.id]].category = categories[item.snippet.categoryId] ? categories[item.snippet.categoryId].title : null;
                    }
                    if(item.contentDetails) {
                        list[videos_map[item.id]].duration = item.contentDetails.duration;
                    }
                    if(item.statistics) {
                        list[videos_map[item.id]].views = item.statistics.viewCount;
                    }
                });
            });
        }
                
        meta = {
            etag: data.etag,
            found: data.pageInfo.totalResults,
            perPage: data.pageInfo.resultsPerPage,            
            next: data.nextPageToken,
            prev: data.prevPageToken
        };

        switch(type) {
            case 'search': {
                meta.type = type;
                meta.title = 'Results for "' + query + '"';
                meta.items = list;
                return meta;
            }
            case 'related': {
                meta.type = type;
                meta.title = 'Related videos';
                meta.items = list;
                return meta;
            }
            case 'video': {
                return list[0];
            }
            case 'playlist': {
                meta.type = type;
                meta.title = 'Playlist videos';
                meta.items = list;
                return meta;
            }
            case 'popular': {
                meta.type = type;
                meta.title = getCategory(query).title;
                meta.categoryId = query;
                meta.items = list;
                return meta;
            }
        }
    };

    /**
     *
     * @param {String} type Query type: 'search'|'related'|'popular'
     * @param {String} query Query - searched phrase for search type, video id for related, category id for popular
     * @param {Number} number Optional number of results
     * @returns {Promise} Then data -
     */
    var getResult = function(type, query, number) {
        var deferred = $q.defer(),
            params = {
                maxResults: number || settings.search.maxResults,
                regionCode: settings.regionCode,
                part: settings.search.part,
                key: settings.developerToken
            },
            url;

        switch(type) {
            case 'search': {
                url = settings.search.url;
                params.q = query;
                params.type = settings.search.type;
                params.relevanceLanguage = settings.relevanceLanguage;
                break;
            }
            case 'related': {
                url = settings.search.url;
                params.relevanceLanguage = settings.relevanceLanguage;
                params.relatedToVideoId = query;
                params.type = 'video';
                break;
            }
            case 'popular': {
                url = settings.video.url;
                params.videoCategoryId = query;
                params.chart = 'mostPopular';
                params.type = settings.search.type;
                params.maxResults = settings.popular.maxResults;
                break;
            }
        }

        $http.get(url, {
            params: params
        }).success(function(data){
            queries[data.etag] = {
                type: type,
                query: query,
                url: url,
                params: params
            };
            deferred.resolve(processResultList(type, data, query));
        }).error(function(data){
            console.error("error happening on .getResult:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    var getDetails = function(type, id) {
        var deferred = $q.defer();
        var params = {
            maxResults: settings[type].maxResults,
            part: settings[type].part,
            key: settings.developerToken
        };
        params[settings[type].id] = id;

        $http.get(settings[type].url, {
            params: params
        })
        .success(function(data){
            var items, result;
            items = processResultList(type, data);

            queries[data.etag] = {
                type: type,
                query: id,
                url: settings[type].url,
                params: params
            };

            switch(type) {
                case 'playlist': {
                    result = {
                        playlist: items,
                        video: items.items[0]
                    };
                    deferred.resolve(result);
                    break;
                }
                case 'video': {
                    // in case of backend youtube error for related videos there will be empty list returned
                    result = {
                        playlist: { type: 'related', title: 'Related videos', items: [{ title: 'Unavailable'}]},
                        video: items
                    };
                    getResult('related', id, settings.video.maxResults)
                        .then(function(data) {
                            result.playlist = data;
                        })
                        .finally(function() {
                            deferred.resolve(result);
                        });
                    break;
                }
            }
        })
        .error(function(data){
            console.error("error happening on .getDetails:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    var getCategory = function(id) {
        if(_initialized) {
            return categories[id] ? categories[id] : {};
        } else {
            console.error('Categories unitialized - use initialize() first and then()');
        }
    };

    var getNext = function(etag, token) {
        var deferred = $q.defer(),
            params;

        if(!queries[etag]) {
            throw 'yt_youtubeService: No given etag found: ' + etag;
        }
        
        params = queries[etag].params;
        params.pageToken = token;
        
        $http.get(queries[etag].url, {
            params: params
        }).success(function(data){
            deferred.resolve(processResultList(queries[etag].type, data, queries[etag].query));
        }).error(function(data){
            console.error("error happening on .getNext:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    var initialize = function() {
        var promise, data;
        
        // check if already stored locally and return
        data = localStorageService.get('youtube:categories:' + settings.regionCode);
        if(data) {
            categories = data;
            _initialized = true;
            return true;
        }
        // get and store otherwide
        promise = $http.get(settings.category.url, {
            params: {
                regionCode: settings.regionCode,
                key: settings.developerToken,
                part: 'snippet'
            }
        })
        .success(function(data){
            data.items.forEach(function(item) {
                categories[item.id] = {
                    title: item.snippet.title
                };
            });
            localStorageService.set('youtube:categories:' + settings.regionCode, categories);
            _initialized = true;
        })
        .error(function(data){
            console.error("error happening on .initCategories:", data);
        });
        return promise;
    };

    return {
        initialize: initialize,
        getResult: getResult,
        getDetails: getDetails,
        getCategory: getCategory,
        getNext: getNext
        // TODO:
        // getPrev: getPrev?
        // setMaxResults
        // setRegionCode
        // setRelevanceLanguage
    };
});
},{}],46:[function(require,module,exports){
/* global module */
module.exports = ({
    search: {
        url: 'https://www.googleapis.com/youtube/v3/search',
        type: 'playlist,video',
        part: 'snippet',
        maxResults: config.maxSearchResults || 8
    },
    playlists: {
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        part: 'snippet,contentDetails'
    },
    playlist: {
        id: 'playlistId',
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        part: 'snippet',
        maxResults: 16
    },
    video: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet,contentDetails,statistics',
        maxResults: 16
    },
    category: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videoCategories',
        part: 'snippet',
        maxResults: 20
    },
    popular: {
        id: 'videoCategoryId',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet',
        maxResults: config.maxPopularResults || 4
    },
    regionCode: config.regionCode || 'GB',
    relevanceLanguage: config.relevanceLanguage || 'en',
    developerToken: config.youtubeDeveloperToken
});
},{}],47:[function(require,module,exports){
module.exports = angular.module('yt_viewer', ['ngResource', 'pascalprecht.translate'])
    .directive('ytViewer', require('./yt_viewerDirective'))
    .constant('ytPlayerConfig', require('./yt_playerConfig'))
    .directive('ytPlayer', require('./yt_playerDirective'))
    .directive('ytVideoDescription', require('./yt_videoDescriptionDirective'))
    .directive('ytPlaylist', require('./yt_playlistDirective'))
    .directive('ytControlbar', require('./yt_controlbarDirective'));

},{"./yt_controlbarDirective":48,"./yt_playerConfig":50,"./yt_playerDirective":51,"./yt_playlistDirective":53,"./yt_videoDescriptionDirective":55,"./yt_viewerDirective":57}],48:[function(require,module,exports){
module.exports = function ($timeout, $window, $location, ytPlayerConfig, appRemoteControlService) {
    'use strict';
    return {
        restrict: 'E',
        template: require('./yt_controlbarTemplate.html'),
        scope: {
            info: '='
        },
        link: function (scope, element, attrs) {

            var remoteControl = function(command) {
                switch(command) {
                    case 'left': {
                        scope.highlightRewind = true;
                        $timeout(resetHighlight, ytPlayerConfig.video.highlightTimeout);
                        break;
                    }
                    case 'right': {
                        scope.highlightForward = true;
                        $timeout(resetHighlight, ytPlayerConfig.video.highlightTimeout);
                        break;
                    }
                    case 'down': {
                        scope.isVisible = !scope.isVisible;
                        break;
                    }
                    case 'deactivate': {
                        scope.isVisible = false;
                        break;
                    }
                }
                if (!scope.$$phase) {
                    scope.$apply();
                }
            };

            var resetHighlight = function() {
                scope.highlightForward = false;
                scope.highlightRewind = false;
            };

            appRemoteControlService.register('controlbar', remoteControl);

            scope.$on('$destroy', function() {
                appRemoteControlService.deregister('controlbar');
            });
        }
    };
};
},{"./yt_controlbarTemplate.html":49}],49:[function(require,module,exports){
module.exports = "<div class=\"controlbar-overlay\" style=\"transform: translate(0px, 400px);\" ng-style=\"{'transform': isVisible ? 'translate(0px,0px)':'translate(0px, 400px)'}\">\r\n    <div class=\"controlbar-container\">\r\n        <div class=\"button rewind\" ng-class=\"{highlight: highlightRewind }\"></div>\r\n        <div class=\"button pause\" ng-show=\"info.isPlaying\"></div>\r\n        <div class=\"button play\" ng-show=\"!info.isPlaying\"></div>\r\n        <div class=\"button forward\" ng-class=\"{highlight: highlightForward }\"></div>\r\n\r\n    <div class=\"time\">{{ info.actTime | duration }}</div>\r\n    <progress id=\"progressbar\" max=\"100\" value=\"{{info.percentage}}\"></progress>\r\n    <div class=\"duration\">{{ info.duration | duration }}</div>\r\n  </div>\r\n  <div class=\"title\">\r\n    {{ info.video.title }}\r\n  </div>\r\n</div>\r\n";

},{}],50:[function(require,module,exports){
/* global module */
module.exports = ({
    origin: 'https://www.youtube.com',
    api: '/iframe_api',
    video: {
        tvQuality: 'hd720',
        highlightTimeout: 250,
        fastForward: 20,
        fastRewind: -20
    },
    suggestedQuality: 'highres',
    playlistMaxItemCount: 20,
    pathToLogo: '/assets/appMetaData/assets/logo.svg'
});

},{}],51:[function(require,module,exports){
module.exports = function(ytPlayerConfig, $window, $rootScope, appMode, appRemoteControlService) {
    'use strict';
    return {
        restrict: 'E',
        template: require('./yt_playerTemplate.html'),
        transclude: true,
        controller: function($scope) {
        },
        link: function(scope, element, attrs) {
            var _unbinder = [],
                player,
                firstScriptTag = document.getElementsByTagName('script')[0];

            scope.player = {
                API: {
                    loaded: false,
                    initialized: false,
                    ready: false
                },
                info: {
                    actTime: 0,
                    percentage: 0
                }
            };

            $window.onYouTubeIframeAPIReady = function() {
                scope.player.API.loaded = true;
                $rootScope.YTloaded = true;
            };

            if(!$rootScope.YTloaded) {
                var tag = document.createElement('script');
                tag.src = ytPlayerConfig.origin + ytPlayerConfig.api;
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            var initPlayer = function() {
                var properties = {
                    videoId: scope.video.id,
                    playerVars: {
                        autoplay: 1,
                        controls: 1,
                        showinfo: 0
                    },                    
                    events: {
                        onReady: function() {
                            scope.player.API.ready = true;
                            if(scope.video.startAt) {
                                player.seekTo(scope.video.startAt);
                            }
                        }
                    }
                };
                
                if(appMode.isTV()) {
                    properties.playerVars.controls = 0;
                }
                
                scope.player.API.initialized = true;
                
                player = new YT.Player('yt-player', properties);

                if(appMode.isTV()) {
                    var playerContainer = document.getElementById('yt-player');
                    var fullHdWidth = 1920;
                    var scaleFactor = fullHdWidth / playerContainer.width;

                    if (scaleFactor !== 1){
                        playerContainer.style.transform = 'scale('+ scaleFactor +')';
                    } else {
                        playerContainer.style.transform = '';
                    }
                }
                angular.element($window).on('message', receiveMessage);
            };

            var loadVideo = function() {
                if(scope.playingOnTv) {
                    scope.playingOnTv = false;
                }
                // on load video there is no new initialDelivery message
                scope.player.info.video = scope.video;
                scope.player.info.duration = null;
                player.loadVideoById(scope.video.id);
            };

            var receiveMessage = function(message) {
                if(message.origin !== ytPlayerConfig.origin) {
                    // ignore other origin messages
                    return;
                }
                var data = angular.fromJson(message.data);
                // console.debug(data.event, data.info);
                switch(data.event) {
                    case 'initialDelivery': {
                        scope.player.info.video = scope.video;
                        scope.player.info.duration = data.info.duration;
                        break;
                    }
                    case 'infoDelivery': {
                        if(!scope.player.info.duration && data.info.duration) {
                            scope.player.info.duration = data.info.duration;
                        }
                        if(data.info.currentTime) {
                            var actTime = +data.info.currentTime;
                            scope.player.info.actTime = actTime;
                            scope.player.info.percentage = Math.round(actTime / scope.player.info.duration * 100);
                            scope.video.actTime = parseInt(scope.player.info.actTime); // update model for send button
                        }
                        if(data.info.playerState) {
                            scope.player.info.isPlaying = data.info.playerState === YT.PlayerState.PLAYING;
                        }
                        break;
                    }
                }
            };

            var remoteControl = function(command) {
                var position;
                
                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        break;
                    }
                    case 'play': {
                        if(scope.player.info.isPlaying) {
                            player.pauseVideo();
                        } else if(scope.player.API.ready) {
                            player.playVideo();
                        }
                        break;
                    }
                    case 'left': {
                        position = scope.player.info.actTime + ytPlayerConfig.video.fastRewind;
                        if(position < 0) {
                            position = 0;
                        }
                        player.seekTo(position, true);
                        break;
                    }
                    case 'right': {
                        position = scope.player.info.actTime + ytPlayerConfig.video.fastForward;
                        if(position > scope.player.info.duration) {
                            position = scope.player.info.duration;
                        }
                        player.seekTo(position, true);
                        break;
                    }
                    case 'up':
                    case 'back': {
                        player.pauseVideo();
                        appRemoteControlService.deactivate('player');
                        break;
                    }
                }
            };

            appRemoteControlService.register('player', remoteControl);

            _unbinder.push($rootScope.$on('appSendToTv:send', function(event, data){
                if(data.sent === true) {
                    player.pauseVideo();
                }
            }));

            _unbinder.push($rootScope.$on('appSendToTv:resume', function(event, data){
                player.playVideo();
            }));

            scope.$watchCollection('player.API', function(n) {
                if(n.loaded && scope.video && !n.initialized) {
                    initPlayer();
                }
            });

            scope.$watch('video', function(n, o) {
                if(n && (scope.player.API.loaded || YT && YT.loaded) && !scope.player.API.initialized) {
                    initPlayer();
                }
                if(n && o && n.id !== o.id) {
                    loadVideo();
                }
            });

            scope.$on('$destroy', function() {
                appRemoteControlService.deregister('player');
                player = null;
                angular.element($window).off('message', receiveMessage);
                _unbinder.forEach(function(unbind) {
                    unbind();
                });
            });
        }
    };
};

},{"./yt_playerTemplate.html":52}],52:[function(require,module,exports){
module.exports = "<div class=\"yt-player\" id=\"yt-player\"></div>\r\n<ng-transclude></ng-transclude>";

},{}],53:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_playlistTemplate.html'),
		controller: function($scope) {
		},
		link: function(scope, element){
		}
	};
};
},{"./yt_playlistTemplate.html":54}],54:[function(require,module,exports){
module.exports = "<div class=\"yt-playlist\">\r\n    <span>Playlist</span>\r\n</div>";

},{}],55:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_videoDescriptionTemplate.html'),
		controller: function($scope) {
		},
		link: function(scope, element){
		}
	};
};
},{"./yt_videoDescriptionTemplate.html":56}],56:[function(require,module,exports){
module.exports = "<div class=\"yt-video-description\">\r\n    <h2 class=\"title\">{{ video.title }} </h2>\r\n    <div class=\"text\">\r\n        <span ng-show=\"!expanded\">{{ video.description | limitTo : 300 }}</span><!-- TODO: trust as html and | nl2br filter? -->\r\n        <span ng-show=\"!expanded\" ng-if=\"video.description.length > 300\" ng-click=\"expanded = true\">...</span>\r\n        <span ng-show=\"expanded\">{{ video.description }}</span>\r\n    </div>\r\n    <div class=\"metadata\">\r\n        <div class=\"row\">{{ ::('From' | translate) }}: {{ video.channel }}</div>\r\n        <div>{{ ::('Added' | translate) }}: {{ video.created | date }}</div>\r\n        <div class=\"row\">{{ ::('Category' | translate) }}: {{ video.category }}</div>\r\n        <div>{{ ::('Views' | translate) }}: {{ video.views }}</div>\r\n    </div>\r\n</div>";

},{}],57:[function(require,module,exports){

module.exports = function ($timeout, appMode) {
	return {
		restrict: 'E',
		template: require('./yt_viewerTemplate.html'),
        scope: {
            class: '@class',
            video: '=videoModel',
            playlist: '=playlistModel'
        },
		controller: function($scope) {
		},
		link: function(scope, element){

            scope.playVideo = function(index) {
                var list = scope.playlist[0] || scope.playlist;
                // check if exists and is contains video id (dummy unavailable list handling)
                if(list.items[index] && list.items[index].id) {
                    scope.activatePlaylistItem(index, list.currentPlaying);
                    list.currentPlaying = index;
                    scope.video = list.items[index];
                }
            };

            scope.activatePlaylistItem = function(curr, prev) {
                var items = element.find('ui-video-list-item');
                if(prev !== 'undefined' && items[prev]) {
                    angular.element(items[prev]).removeClass('playing');
                }
                if(items[curr]) {
                    angular.element(items[curr]).addClass('playing');
                }
            };

            scope.$watch('playlist', function(n) {
                if(n) {
                    // activate (styling) first playlist item after rendering
                    $timeout(function(){
                        scope.activatePlaylistItem(0);
                    });
                }
            });

            scope.playlistVisible = appMode.getView() === 'normal';
		}
	};
};
},{"./yt_viewerTemplate.html":58}],58:[function(require,module,exports){
module.exports = "<div class=\"{{ class || 'yt-viewer' }}\" ng-class=\"{ 'playlist-visible': playlistVisible }\">\r\n    <div class=\"video\">\r\n        <yt-player>\r\n            <div ng-if=\"playingOnTv\" class=\"overlay\">\r\n                <div>{{ ::('Playing on TV' | translate) }}</div>\r\n            </div>\r\n        </yt-player>\r\n        <yt-controlbar info=\"player.info\"></yt-controlbar>\r\n        <div class=\"buttons\">\r\n            <app-send-to-tv ng-model=\"video\" playing-on-tv=\"playingOnTv\"></app-send-to-tv>\r\n            <button class=\"toggle-playlist\" ng-click=\"playlistVisible = !playlistVisible\">\r\n                <span class=\"label_hidePlaylist\" ng-show=\"playlistVisible\">\r\n                    <span class=\"btnLabel\">{{ ::('Hide video list' | translate) }}</span>\r\n                    <svg version=\"1.1\" id=\"arrow\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 12 13\" enable-background=\"new 0 0 12 13\" xml:space=\"preserve\">\r\n                        <polygon fill=\"#FFFFFF\" points=\"1,0.5 11,6.5 1,12.5\"/>\r\n                    </svg>\r\n                </span>\r\n                <span class=\"label_showPlaylist\" ng-hide=\"playlistVisible\">\r\n                    <svg version=\"1.1\" id=\"arrow\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\" viewBox=\"0 0 12 13\" enable-background=\"new 0 0 12 13\" xml:space=\"preserve\">\r\n                        <polygon fill=\"#FFFFFF\" points=\"1,0.5 11,6.5 1,12.5\"/>\r\n                    </svg>\r\n                    <span class=\"btnLabel\">{{ ::('Show video list' | translate) }}</span>\r\n                </span>\r\n            </button>\r\n        </div>\r\n        <yt-video-description></yt-video-description>\r\n    </div>\r\n    <yt-result-set class=\"playlist\" ng-model=\"playlist\" display=\"list\" play-fn=\"playVideo\" load-more=\"scroll\" service=\"ytYoutubeService\" control=\"{{ ::appMode.get() }}\" remote-control=\"playlist\"></yt-result-set>\r\n</div>\r\n";

},{}]},{},[1])