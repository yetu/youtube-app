(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
require('./js/app');
},{"./js/app":12}],2:[function(require,module,exports){
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
    .constant('i18n', require('./i18nConfig'))
    .constant('ytPlayerConfig', require('./playerConfig'));

},{"./i18nConfig":2,"./playerConfig":4,"./serverPathsConfig":5}],4:[function(require,module,exports){
/* global module */
module.exports = ({
    video: {
        highlightTimeout: 250,
        fastForward: 20,
        fastRewind: -20
    },
    suggestedQuality: 'highres',
    playlistMaxItemCount: 20,
    pathToLogo: '/assets/appMetaData/assets/logo.svg'
});

},{}],5:[function(require,module,exports){
/* global module */
module.exports = ({
    youtubeUrl: '/playlist',
    notificationUrl: '/notification',
    level2Url: '/level2tv',
    imageUrl: '/assets/youtube_producer/img/'
});
},{}],6:[function(require,module,exports){
/* global module */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, appMode, $rootScope) {
    // dummy init list
    var dummyItem = [];
    for(i = 0; i < 8; i++) {
        dummyItem.push({ description: 'To be implemented...'});
    }
    $scope.mainResultList = [
        { title: 'Category 1', items: [dummyItem[0], dummyItem[1], dummyItem[2], dummyItem[3]]},
        { title: 'Category 2', items: [dummyItem[4], dummyItem[5], dummyItem[6], dummyItem[7]]}
    ];

    if($routeParams.action === 'search' && $routeParams.param) {
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
    }

    $scope.$on('app:search-value', function(event, query){
        // temporary start search here but not again for search in url
        if($routeParams.action === 'search' && $routeParams.param === query) {
            return;
        }
        ytYoutubeService.getResult('search', query).then(function(data) {
            $scope.mainResultList = [data];
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
        /* TODO: make path replace without reload
        var action = '#/dashboard/search/' + query;
        if(decodeURIComponent(window.location.hash) !== action) {
            window.location = action; // replace with $location
        }
        */
    });
});
},{}],7:[function(require,module,exports){
module.exports = angular.module('_controllers', [])
	.controller('DashboardCtrl', require('./dashboardController'))
    .controller('ViewerCtrl', require('./viewerController'));

},{"./dashboardController":6,"./viewerController":8}],8:[function(require,module,exports){
/* global module */
module.exports = (function($scope, ytYoutubeService, appMode, $routeParams) {

    ytYoutubeService.getDetails($routeParams.type, $routeParams.id).then(function(data) {
        $scope.video = data.video;
        $scope.playlist = data.playlist;
    }, function(error) {
        // TODO: error handling
    });

    $scope.$on('app:search-value', function(event, query){
        var action = '#/dashboard/search/' + query;
        window.location = action; // replace with $location
    });
});

},{}],9:[function(require,module,exports){
/* global module */
module.exports = (function() {
    return function(time) {
        // http://stackoverflow.com/a/19094191
        var array = (time || '').match(/(\d+)(?=[MHS])/ig) || [];
        if(array.length === 1) {
            array.unshift('0');
        }
        return array.map(function(item) {
            if(item.length < 2) return '0' + item;
            return item;
        })
        .join(':');
    };
});
},{}],10:[function(require,module,exports){
/* global angular, module */
module.exports = angular.module('_filters', [])
	.filter('duration', require('./durationFilter'))
    .filter('nl2br', require('./nl2brFilter'));

},{"./durationFilter":9,"./nl2brFilter":11}],11:[function(require,module,exports){
/* global module */
module.exports = (function() {
    return function(text){
        return text ? text.replace(/\n/g, '<br/>') : '';
    };
});
},{}],12:[function(require,module,exports){
var youtubeApp = angular.module('youtubeApp',
	[
		'ngRoute',
		'ngResource',
		'pascalprecht.translate',
		'reactTo',
        // app modules
        require('./app_search').name,
        require('./app_mode').name,
        require('./app_sendToTv').name,
        require('./ui_videoList').name,
		require('./yt_result').name,
        require('./yt_search').name,
		require('./yt_auth').name,
		require('./yt_notification').name,
        require('./yt_viewer').name,
        // app main
        require('./_controllers').name,
        require('./_configs').name,
        require('./_filters').name
	]);

youtubeApp.config(function ($routeProvider, $translateProvider, $httpProvider, $locationProvider, i18n) {
	$httpProvider.defaults.useXDomain = true;
	delete $httpProvider.defaults.headers.common['X-Requested-With'];

	// $locationProvider.html5Mode(true);

	$routeProvider
		.when('/dashboard/:action?/:param?', {
            controller: 'DashboardCtrl',
			template: require('./dashboardTemplate.html')
		})
        .when('/view/:mode/:type/:id/:device?', {
            controller: 'ViewerCtrl',
			template: require('./viewerTemplate.html'),
            resolve: {
                // needed to init categories first for detailed views
                YouTubeCategories: function(ytYoutubeService) {
                    return ytYoutubeService.initialize();
                }
            }
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

youtubeApp.run(function($location, $translate){
    var params = $location.search();
    if(params.lang){
        $translate.use(params.lang);
    }
});

},{"./_configs":3,"./_controllers":7,"./_filters":10,"./app_mode":14,"./app_search":17,"./app_sendToTv":20,"./dashboardTemplate.html":21,"./ui_videoList":22,"./viewerTemplate.html":27,"./yt_auth":28,"./yt_notification":30,"./yt_result":32,"./yt_search":35,"./yt_viewer":38}],13:[function(require,module,exports){
/**
 * Service detecting application mode
 */
module.exports = (function ($routeParams, $rootScope) {
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
        // temporary use link option
        _mode = $routeParams.device ? $routeParams.device : 'pc';

        // set global application class directly
        $rootScope.appModeClass = getClass();
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

},{}],14:[function(require,module,exports){
module.exports = angular.module('app_mode', [])
	.service('appMode', require('./app_modeService'));

},{"./app_modeService":13}],15:[function(require,module,exports){
/* global module */
/*
 * <app-search placeholder="" value="" trigger-search="enter,button,auto" auto-delay="" allow-repeat="" on-search="" on-reset=""></app-search>
 *
 * @attr placeholder string Placeholder text
 * @attr value string Predefined value
 * @attr trigger-search string Comma separated triggers for searching start: enter - by Enter key, button - search button, auto - automatically started on typing
 * @attr auto-delay integer Triggering search after X ms of change (0 for disable) - for auto trigger
 * @attr allow-repeat boolean Allow repeatition of the same value if not changed (for example on enter and button)
 * @attr on-search string|fn Search event name (default 'app:search-value') or callback function
 * @attr on-reset string|fn Reset search event name (default 'app:search-reset') or callback function
 */
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./app_searchTemplate.html'),
        scope: {
            searchValue: '@value',
            placeholder: '@placeholder'
        },
		link: function(scope, element, attr){
            var _unbinder = [],
                triggerButton = attr.triggerSearch && attr.triggerSearch.indexOf('button') > -1,
                triggerEnter = attr.triggerSearch && attr.triggerSearch.indexOf('enter') > -1,
                triggerAuto = attr.triggerSearch && attr.triggerSearch.indexOf('auto') > -1;
			
			scope.searchButtonClick = function() {
                if (triggerButton === true) {
                    scope.initSearch(element.find('input')[0].value);
                }
			};
			scope.searchOnKeyUp = function (event) {
				if (triggerEnter === true && event.keyCode === 13 && event.target.value !== "") {
					scope.initSearch(event.target.value);
				}
			};
			scope.initSearch = function(value) {
                if (scope.emitted === value && attr.allowRepeat !== "true") {
                    return;
                }
                if (value) {
                    scope.$emit(attr.eventSearch || 'app:search-value', value);
                } else {
                    scope.$emit(attr.eventReset || 'app:search-reset');
                }
                scope.emitted = value;
			};

            if(triggerAuto) {
                _unbinder.push(scope.$watch('searchValue', function (value) {
                    if (value !== "") {
                        scope.initSearch(value);
                    }
                }));
            }

            scope.$on('$destroy', function() {
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
		}
	};
};


},{"./app_searchTemplate.html":16}],16:[function(require,module,exports){
module.exports = "<div class=\"app-search\">\n  <input class=\"query\" ng-model=\"searchValue\" ng-model-options=\"{ debounce: 500 }\" ng-keyup=\"searchOnKeyUp($event)\" type=\"text\"\n         placeholder=\"{{placeholder}}\" value=\"{{searchValue}}\">\n  <button class=\"search\" ng-click=\"searchButtonClick()\">\n    <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n\t    viewBox=\"0 0 21.7 21.7\" enable-background=\"new 0 0 21.7 21.7\" xml:space=\"preserve\">\n      <path fill=\"#333\" d=\"M21.7,20.3l-6-6c1.2-1.5,1.9-3.4,1.9-5.5c0-4.9-4-8.8-8.8-8.8C4,0,0,4,0,8.8c0,4.9,4,8.8,8.8,8.8\n        c2.1,0,4-0.7,5.5-1.9l6,6L21.7,20.3z M8.8,15.6C5.1,15.6,2,12.6,2,8.8C2,5.1,5.1,2,8.8,2c3.8,0,6.8,3.1,6.8,6.8\n        C15.6,12.6,12.6,15.6,8.8,15.6z\"/>\n    </svg>\n  </button>\n</div>";

},{}],17:[function(require,module,exports){
module.exports = angular.module('app_search', ['pascalprecht.translate'])
	.directive('appSearch', require('./app_searchDirective'));

},{"./app_searchDirective":15}],18:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            data: '=ngModel'
        },
		link: function(scope, element){
            scope.onSendButtonClick = function(e){
                alert('Not implemented yet');
			};
		}
	};
};

},{"./app_sendToTvTemplate.html":19}],19:[function(require,module,exports){
module.exports = "<button class=\"{{ class || 'app-send-to-tv'}}\" ng-click=\"onSendButtonClick($event)\">->[]</button>\n";

},{}],20:[function(require,module,exports){
module.exports = angular.module('app_sendToTv', ['ngResource'])
    .directive('appSendToTv', require('./app_sendToTvDirective'));
    //.service('appSendToTvService', require('./app_sendToTvService'));


},{"./app_sendToTvDirective":18}],21:[function(require,module,exports){
module.exports = "<app-search class=\"app-search\" placeholder=\"Search YouTube\" value=\"{{ searchValue }}\" trigger-search=\"button,enter,auto\" auto-delay=\"500\"></app-search>\n<!-- TODO: distinguish type on application mode tv/pc -> regular/inline -->\n<yt-result-set ng-model=\"mainResultList\" play-link=\"#/view/:type/:id\" display=\"\" control=\"\"></yt-result-set>\n";

},{}],22:[function(require,module,exports){
module.exports = angular.module('ui_videoList', ['ngResource', 'pascalprecht.translate'])
	.directive('uiVideoList', require('./ui_videoListDirective'))
	.directive('uiVideoListItem', require('./ui_videoListItemDirective'));


},{"./ui_videoListDirective":23,"./ui_videoListItemDirective":24}],23:[function(require,module,exports){
/*
 * <ui-video-list ng-model="" display="floating" control="pc" play-link=""></ui-video-list>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { type, id, item, img, created, description, ...},
 *                      where type: playlist|video
 * @attr display string Display type - 'horizontal', 'list' or 'floating' (default) for styling and controls behaviour
 * @attr control string Control style - 'tv' or 'pc' (default) - used for control and reacting on events @todo
 * @attr play-link string Link pattern to open video - will replace :attribute if found in element item properties (e.g. '#/show/:type/:id')
 */
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListTemplate.html'),
        scope: {
            class: '@class',
            videoList: '=ngModel',
            playLink: '@playLink',
            playFn: '@playFn', // TODO: some function binding?
            displayType: '@display',
            controlType: '@control'
        },
		controller: function($scope){
		},
		link: function(scope, element){
            scope.playFunction = function(index) {
                if( typeof(scope.$parent[scope.playFn]) === 'function') {
                    scope.$parent[scope.playFn](index);
                } else {
                    console.error('ui-video-directive: ' + scope.playFn + ' is not a function');
                }
            };
		}
	};
};
},{"./ui_videoListTemplate.html":26}],24:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListItemTemplate.html'),
		link: function(scope, element){
		}
	};
};

},{"./ui_videoListItemTemplate.html":25}],25:[function(require,module,exports){
module.exports = "<li class=\"ui-video-list-item\">\n  <div class=\"img\">\n    <img ng-if=\"item.img\" ng-src=\"{{::item.img}}\"/>\n    <a ng-if=\"playLink\" class=\"playimg\" ng-href=\"#/view/expand/{{::item.type}}/{{::item.id}}\"> <!-- TODO: replace href with {{ playLink | replaceParams }} -->\n      <img src=\"assets/youtube_producer/img/play-icon.svg\" />\n    </a>\n    <a ng-if=\"playFn\" class=\"playimg\" ng-click=\"playFunction($index)\">\n      <img src=\"assets/youtube_producer/img/play-icon.svg\" />\n    </a>\n    <div ng-if=\"item.type == 'video'\" class=\"duration\"><span>{{ item.duration | duration }}</span></div><!-- TODO: one-time binding with filter? -->\n    <div ng-if=\"item.type == 'playlist'\" class=\"items\"><span>{{ ::item.totalItems }}</span></div>\n  </div>\n  <div class=\"metadata\">\n    <p class=\"title\">{{::item.title}}</p>\n    <p class=\"subtitle\" ng-if=\"item.channel\">\n      <span>by {{::item.channel}}</span><br />\n      <span>{{ ::item.created | timeAgo }}</span>\n    </p>\n    <p class=\"description\" data-type=\"description\" cw-reveal-label ng-if=\"item.description\">\n      {{::item.description}}\n    </p>\n    <p class=\"description\" ng-if=\"!item.description\">No description available.</p>\n  </div>\n  <div class=\"buttons\">\n      <app-send-to-tv ng-model=\"::item\"></app-send-to-tv>\n  </div>\n</li>";

},{}],26:[function(require,module,exports){
module.exports = "<ul class=\"{{ class || 'ui-video-list'}} {{ displayType }}\">\n  <ui-video-list-item ng-repeat=\"item in videoList\">\n  </ui-video-list-item>\n  <div ng-if=\"videoList.length == 0\">\n    {{ 'No results found' | translate }}\n  </div>\n</ul>\n";

},{}],27:[function(require,module,exports){
module.exports = "<yt-viewer video-model=\"video\" playlist-model=\"playlist\"></yt-viewer>\n";

},{}],28:[function(require,module,exports){
module.exports = angular.module('yt_auth', ['ngResource'])
	.directive('ytAuth', require('./yt_authDirective'));

},{"./yt_authDirective":29}],29:[function(require,module,exports){
/* global angular, module, config */
module.exports = function ($window, $http, $interval, $log) {
    'use strict';
    return {
        restrict: 'E',
        link: function (scope, element, attr) {
            //TODO: use more angular.js methods instead of mix of native and angular stuff

            var openidIframe = document.createElement('iframe');

            openidIframe.src = config.authServer + '/assets/login_status.html';
            openidIframe.id = 'openid-provider';
            openidIframe.style.visibility = 'hidden';
            openidIframe.style.display = 'none';

            document.body.appendChild(openidIframe);

            openidIframe.onload = check_session;

            var timerID = setInterval(check_session, config.sessionPollingInterval * 1000);

            function check_session() {
                var win = openidIframe.contentWindow;
                win.postMessage('youtubeApp ' + config.userUUID, config.authServer);
            }


            function receiveMessageP(event) {
                if (event.originalEvent) {
                    event = event.originalEvent;
                }
                if (event.origin !== config.authServer) {
                    $log.log('event.origin domain [' + event.origin + '] does not match the configured domain [' + config.authServer + ']');
                    return;
                }
                var stat = event.data;
                $log.log('poller | received message:' + stat);
                if (stat === 'invalid') {
                    $log.log('session=invalid! Logging out and redirecting');
                    clearInterval(timerID);
                    $window.location.href = '/signOut';
                }
            }

            angular.element($window).on('message', receiveMessageP);
        }
    };
};
},{}],30:[function(require,module,exports){
module.exports = angular.module('yt_notification', ['ngResource'])
.service('ytNotification', require('./ytNotification'));
},{"./ytNotification":31}],31:[function(require,module,exports){
module.exports = function($http, SERVERPATHS, SPECIALPURPOSE) {
	'use strict';
	//array object with possible payloads
	var payloads = [{
        headline: 'CamBot',
		notification: {
			subTitle: 'motion detected outside back window',
			image: 'http://i4.mirror.co.uk/incoming/article141978.ece/alternates/s2197/burglar-trying-to-pry-open-window-on-house-pic-getty-images-123608196.jpg'
		}
	}, {
        headline: 'WaterBot',
		notification: {
			subTitle: 'basement water sensor activated',
			image: 'http://www.smbywills.com/core/images/waterproofing/basement-flooding/flooded-basement-home-lg.jpg'
		}
	}, {
        headline: 'DoorBot',
		notification: {
			subTitle: 'doorbell activated',
			image: 'http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2011/9/4/1315149322196/Man-at-front-door-007.jpg'
		}
	}];
	//checks if the special triggerphrase was entered
	this.isSpecialTrigger = function(inputValue) {
		var result = [];
		angular.forEach(SPECIALPURPOSE.notificationTriggers, function(value, key) {
			if (inputValue.toLowerCase().indexOf(value) === -1) {
				result.push(0);
			} else {
				result.push(1);
			}
		});
		if (result.indexOf(0) !== -1) {
			return false;
		} else {
			return true;
		}
	};
	//returns a random element of the payloads object
	this.sendGeneralNotification = function() {
		return $http.post(SERVERPATHS.notificationUrl, payloads[Math.floor((Math.random() * payloads.length))]);
	};
};

},{}],32:[function(require,module,exports){
module.exports = angular.module('yt_result', ['ngResource', 'pascalprecht.translate', 'reactTo', 'ui_videoList'])
    .directive('ytResultSet', require('./yt_resultSetDirective'));


},{"./yt_resultSetDirective":33}],33:[function(require,module,exports){
/*
 * <yt-result-set ng-model="" display="" control="" play-link=""></yt-result-set>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { list_type, title, items},
 *                      where list_type determines search strategy - used by search/load
 * @attr display @see ui-video-list
 * @attr control @see ui-video-list
 * @attr play-link @see ui-video-list
 *
 */
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_resultSetTemplate.html'),
        scope: {
            class: '@class',
            resultLists: '=ngModel',
            playLink: '@playLink',
            displayType: '@display',
            controlType: '@control'
        },
		controller: function($scope) {
		},
		link: function(scope, element){
            // TODO: handling next/prev links using ytYoutubeService
		}
	};
};
},{"./yt_resultSetTemplate.html":34}],34:[function(require,module,exports){
module.exports = "<div class=\"{{ class || 'yt-result-set' }}\">\n  <div ng-repeat=\"videoList in resultLists\" class=\"result\">\n    <h2>{{ videoList.title }}</h2>\n    <ui-video-list ng-model=\"videoList.items\" play-link=\"{{ playLink }}\" type=\"{{ listType }}\"></ui-video-list>\n    <!-- TODO: prev/next links based on attributes in videoList -->\n  </div>\n</div>\n";

},{}],35:[function(require,module,exports){
module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
    .constant('ytYoutubeServiceConfig', require('./yt_youtubeServiceConfig'))
	.service('ytYoutubeService', require('./yt_youtubeService'));

},{"./yt_youtubeService":36,"./yt_youtubeServiceConfig":37}],36:[function(require,module,exports){
/* global angular, module, config */
module.exports = (function ($http, $q, ytYoutubeServiceConfig) {
    'use strict';
    var settings = ytYoutubeServiceConfig,
        searchValue,
        categories = [];

    var processResultList = function(type, data){
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
                kind = (item.id.kind || item.kind).replace('youtube#', ''),
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
                    part: 'snippet,contentDetails,statistics', // needed for duration, categoyId and views
                    maxResults: videos.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[videos_map[item.id]].category = categories[item.snippet.categoryId] ? categories[item.snippet.categoryId].title : null;
                    list[videos_map[item.id]].duration = item.contentDetails.duration;
                    list[videos_map[item.id]].views = item.statistics.viewCount;
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
                meta.title = 'Results for "' + searchValue + '"';
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
        }
    };

    /**
     *
     * @param {String} type Query type: 'search'|'related'
     * @param {String} query Query - searched phrase for search type, video id for related
     * @param {Number} number Optional number of results
     * @returns {Promise} Then data -
     */
    var getResult = function(type, query, number) {
        var deferred = $q.defer(),
            params = {
                maxResults: number || settings.search.maxResults,
                relevanceLanguage: settings.relevanceLanguage,
                regionCode: settings.regionCode,
                part: settings.search.part,
                key: settings.developerToken
            };

        switch(type) {
            case 'search': {
                searchValue = query;
                params.q = query;
                params.type = settings.search.type;
                break;
            }
            case 'related': {
                params.relatedToVideoId = query;
                params.type = 'video';
                break;
            }
        }

        $http.get(settings.search.url, {
            params: params
        }).success(function(data){
            deferred.resolve(processResultList(type, data));
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
                    getResult('related', id, 20).then(function(data) {
                        result = {
                            playlist: data,
                            video: items
                        };
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
        if(categories.length) {
            return categories[id] ? categories[id] : {};
        } else {
            console.error('Categories unitialized - use initialize() first and then()');
        }
    };

    var initialize = function() {
        var promise = $http.get(settings.category.url, {
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
        getCategory: getCategory
        // TODO:
        // getNext: getNext,
        // getPrev: getPrev
        // setMaxResults
        // setRegionCode
        // setRelevanceLanguage
    };
});
},{}],37:[function(require,module,exports){
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
        maxResults: 20
    },
    video: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet,contentDetails,statistics',
        maxResults: 20
    },
    category: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videoCategories',
        part: 'snippet',
        maxResults: 20
    },
    regionCode: config.regionCode || 'GB',
    relevanceLanguage: config.relevanceLanguage || 'en',
    developerToken: config.youtubeDeveloperToken
});
},{}],38:[function(require,module,exports){
module.exports = angular.module('yt_viewer', ['ngResource', 'pascalprecht.translate'])
    .directive('ytViewer', require('./yt_viewerDirective'))
    .directive('ytPlayer', require('./yt_playerDirective'))
    .directive('ytVideoDescription', require('./yt_videoDescriptionDirective'))
    .directive('ytPlaylist', require('./yt_playlistDirective'));


},{"./yt_playerDirective":39,"./yt_playlistDirective":41,"./yt_videoDescriptionDirective":43,"./yt_viewerDirective":45}],39:[function(require,module,exports){
module.exports = function($window, $rootScope, appMode) {
	'use strict';
	return {
		restrict: 'E',
		template: require('./yt_playerTemplate.html'),
        controller: function($scope) {
        },
		link: function(scope, element, attrs) {
			var _unbinder = [],
                player,
                firstScriptTag = document.getElementsByTagName('script')[0];

            scope.playerAPI = {
                ready: false,
                initialized: false
            };

            $window.onYouTubeIframeAPIReady = function() {
                scope.playerAPI.ready = true;
                $rootScope.YTloaded = true;
            };
            
            if(!$rootScope.YTloaded) {
                var tag = document.createElement('script');
                tag.src = "https://www.youtube.com/iframe_api";
                firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
            }

            var initPlayer = function() {
                scope.playerAPI.initialized = true;
                player = new YT.Player('yt-player', {
                    //height: '1080',
                    //width: '1920',
                    playerVars: {
                        autoplay: 0,
                        controls: appMode.isPC() ? 1 : 0,
                        showinfo: 0
                    },
                    videoId: scope.video.id,
                    events: {
                        //onStateChange: onStateChange,
                        //onReady: onReady
                    }
                });
            };

            var loadVideo = function() {
                player.loadVideoById(scope.video.id);
            };

            _unbinder.push(scope.$watchCollection('playerAPI', function(n) {
				if(n.ready && scope.video && !n.initialized) {
                    initPlayer();
                }
			}));

            _unbinder.push(scope.$watch('video', function(n, o) {
				if(n && (scope.playerAPI.ready || YT && YT.loaded) && !scope.playerAPI.initialized) {
                    initPlayer();
                }
                if(n && o && n.id !== o.id) {
                    loadVideo();
                }
			}));

			scope.$on('$destroy', function() {
				player = null;
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
			});
		}
	};
};

},{"./yt_playerTemplate.html":40}],40:[function(require,module,exports){
module.exports = "<div class=\"yt-player\" id=\"yt-player\"></div>";

},{}],41:[function(require,module,exports){

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
},{"./yt_playlistTemplate.html":42}],42:[function(require,module,exports){
module.exports = "<div class=\"yt-playlist\">\nPlaylist\n</div>";

},{}],43:[function(require,module,exports){

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
},{"./yt_videoDescriptionTemplate.html":44}],44:[function(require,module,exports){
module.exports = "<div class=\"yt-video-description\">\n    <div class=\"text\">\n        <span ng-show=\"!expanded\">{{ video.description | limitTo : 300 }}</span><!-- TODO: trust as html and | nl2br filter? -->\n        <span ng-show=\"!expanded\" ng-if=\"video.description.length > 300\" ng-click=\"expanded = true\">...</span>\n        <span ng-show=\"expanded\">{{ video.description }}</span>\n    </div>\n    <div class=\"metadata\">\n        <div class=\"row\">{{ ::('From' | translate) }}: {{ video.channel }}</div>\n        <div>{{ ::('Added' | translate) }}: {{ video.created | date }}</div>\n        <div class=\"row\">{{ ::('Category' | translate) }}: {{ video.category }}</div>\n        <div>{{ ::('Views' | translate) }}: {{ video.views }}</div>\n    </div>\n</div>";

},{}],45:[function(require,module,exports){

module.exports = function (appMode) {
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
                scope.video = scope.playlist.items[index];
            };

            scope.playlistVisible = appMode.getView() !== 'expand';
		}
	};
};
},{"./yt_viewerTemplate.html":46}],46:[function(require,module,exports){
module.exports = "<app-search class=\"app-search\" placeholder=\"Search YouTube\" value=\"{{ searchValue }}\" trigger-search=\"button,enter,auto\" auto-delay=\"500\"></app-search>\n\n<div class=\"{{ class || 'yt-viewer' }}\" ng-class=\"{ 'playlist-visible': playlistVisible }\">\n  <h2 class=\"title\">{{ video.title }} </h2>\n  <div class=\"video\">\n    <yt-player></yt-player>\n    <div class=\"yt-controls\">Controls</div><!-- TODO: separate directive -->\n    <div class=\"buttons\">\n        <app-send-to-tv ng-model=\"video\"></app-send-to-tv>\n        <button class=\"toggle-playlist\" ng-click=\"playlistVisible = !playlistVisible\">\n            <span ng-show=\"playlistVisible\">{{ ::('Hide video list' | translate) }}</span>\n            <span ng-hide=\"playlistVisible\">{{ ::('Show video list' | translate) }}</span>\n        </button>\n    </div>\n    <yt-video-description></yt-video-description>\n  </div>\n  <div class=\"playlist\" ng-show=\"playlistVisible\">\n    <h3>{{ ::(playlist.title | translate) }}</h3>\n    <ui-video-list ng-model=\"playlist.items\" display=\"list\" play-fn=\"playVideo\"></ui-video-list>\n  </div>\n</div>\n<!-- TODO: remove ng-show/hide and base on css visibility? -->";

},{}]},{},[1])