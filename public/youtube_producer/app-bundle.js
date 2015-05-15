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
    .constant('ytYoutubeServiceConfig', require('./youtubeServiceConfig'))
    .constant('i18n', require('./i18nConfig'));

},{"./i18nConfig":2,"./serverPathsConfig":4,"./youtubeServiceConfig":5}],4:[function(require,module,exports){
/* global module */
module.exports = ({
    youtubeUrl: '/playlist',
    notificationUrl: '/notification',
    level2Url: '/level2tv',
    imageUrl: '/assets/youtube_producer/img/'
});
},{}],5:[function(require,module,exports){
/* global module */
module.exports = ({
    search: {
        url: 'https://www.googleapis.com/youtube/v3/search',
        type: 'playlist,video',
        part: 'snippet'
    },
    playlists: {
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        part: 'snippet,contentDetails'
    },
    videos: {
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'contentDetails'
    },
    maxResults: 8,
    regionCode: 'GB',
    relevanceLanguage: 'en',
    developerToken: config.youtubeDeveloperToken
});
},{}],6:[function(require,module,exports){
/* global module */
module.exports = (function($scope, ytYoutubeService, $routeParams, $location, appMode, $rootScope) {
    // dummy init list
    var dummyItem = [];
    for(i = 0; i < 8; i++) {
        dummyItem.push({ description: { text: 'To be implemented...'}});
    }
    $scope.mainResultList = [
        { title: 'Category 1', items: [dummyItem[0], dummyItem[1], dummyItem[2], dummyItem[3]]},
        { title: 'Category 2', items: [dummyItem[4], dummyItem[5], dummyItem[6], dummyItem[7]]}
    ];

    // temporary
    $rootScope.appMode = appMode;

    if($routeParams.action === 'search' && $routeParams.param) {
        ytYoutubeService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = data;
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
    }

    $scope.$on('app:search-value', function(event, query){
        // temporary start search here
        ytYoutubeService.getResult('search', query).then(function(data) {
            $scope.mainResultList = data;
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
module.exports = (function($scope, ytYoutubeService, appMode, $rootScope, $routeParams) {

    // temporary
    $rootScope.temporaryMode = appMode.get() + 'mode';
    $rootScope.temporaryType = $routeParams.mode;

    $scope.$on('app:search-value', function(event, query){
        // TODO: route to dashboard/search
    });
});

},{}],9:[function(require,module,exports){
/* global module */
module.exports = (function() {
    return function(time) {
        // http://stackoverflow.com/a/19094191
        var array = (time || '').match(/(\d+)(?=[MHS])/ig) || [];
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
	.filter('duration', require('./durationFilter'));

},{"./durationFilter":9}],11:[function(require,module,exports){
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
			template: require('./viewerTemplate.html')
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

},{"./_configs":3,"./_controllers":7,"./_filters":10,"./app_mode":13,"./app_search":16,"./app_sendToTv":19,"./dashboardTemplate.html":20,"./ui_videoList":21,"./viewerTemplate.html":26,"./yt_auth":27,"./yt_notification":29,"./yt_result":31,"./yt_search":34,"./yt_viewer":36}],12:[function(require,module,exports){
/**
 * Service detecting application mode
 */
module.exports = (function ($routeParams) {
	'use strict';

    var _mode = null;

    var set = function (mode) {
        _mode = mode;
    };

    /**
     * @returns string Application mode
     */
    var get = function() {
        return _mode;
    };

    /**
     * @returns bool Returns true if TV enviroment detected
     */
    var isTV = function() {
        return 'tv' === get();
    };

    /**
     * @returns bool Returns true if PC enviroment detected
     */
    var isPC = function() {
        return 'tv' !== get();
    };

    var _detect = function() {
        // temporary use link option
        _mode = $routeParams.device ? $routeParams.device : 'pc';
    };

    _detect();

    return {
        set: set,
        get: get,
        isTV: isTV,
        isPC: isPC
    };
});

},{}],13:[function(require,module,exports){
module.exports = angular.module('app_mode', [])
	.service('appMode', require('./app_modeService'));

},{"./app_modeService":12}],14:[function(require,module,exports){
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


},{"./app_searchTemplate.html":15}],15:[function(require,module,exports){
module.exports = "<div class=\"app-search\">\r\n  <input class=\"query\" ng-model=\"searchValue\" ng-model-options=\"{ debounce: 500 }\" ng-keyup=\"searchOnKeyUp($event)\" type=\"text\"\r\n         placeholder=\"{{placeholder}}\" value=\"{{searchValue}}\">\r\n  <button class=\"search\" ng-click=\"searchButtonClick()\">\r\n    <svg version=\"1.1\" id=\"Layer_1\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\r\n\t    viewBox=\"0 0 21.7 21.7\" enable-background=\"new 0 0 21.7 21.7\" xml:space=\"preserve\">\r\n      <path fill=\"#333\" d=\"M21.7,20.3l-6-6c1.2-1.5,1.9-3.4,1.9-5.5c0-4.9-4-8.8-8.8-8.8C4,0,0,4,0,8.8c0,4.9,4,8.8,8.8,8.8\r\n        c2.1,0,4-0.7,5.5-1.9l6,6L21.7,20.3z M8.8,15.6C5.1,15.6,2,12.6,2,8.8C2,5.1,5.1,2,8.8,2c3.8,0,6.8,3.1,6.8,6.8\r\n        C15.6,12.6,12.6,15.6,8.8,15.6z\"/>\r\n    </svg>\r\n  </button>\r\n</div>";

},{}],16:[function(require,module,exports){
module.exports = angular.module('app_search', ['pascalprecht.translate'])
	.directive('appSearch', require('./app_searchDirective'));

},{"./app_searchDirective":14}],17:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            type: '@dataType',
            id: '@id',
            title: '@dataTitle'
        },
		link: function(scope, element){
            scope.onSendButtonClick = function(e){
                alert('Not implemented yet');
			};
		}
	};
};

},{"./app_sendToTvTemplate.html":18}],18:[function(require,module,exports){
module.exports = "<button class=\"{{ class || 'app-send-to-tv'}}\" ng-click=\"onSendButtonClick($event)\">->[]</button>\r\n";

},{}],19:[function(require,module,exports){
module.exports = angular.module('app_sendToTv', ['ngResource'])
    .directive('appSendToTv', require('./app_sendToTvDirective'));
    //.service('appSendToTvService', require('./app_sendToTvService'));


},{"./app_sendToTvDirective":17}],20:[function(require,module,exports){
module.exports = "<app-search class=\"app-search\" placeholder=\"Search YouTube\" value=\"{{ searchValue }}\" trigger-search=\"button,enter,auto\" auto-delay=\"500\"></app-search>\r\n<!-- TODO: distinguish type on application mode tv/pc -> regular/inline -->\r\n<yt-result-set ng-model=\"mainResultList\" play-link=\"#/view/:type/:id\" display=\"\" control=\"\"></yt-result-set>\r\n";

},{}],21:[function(require,module,exports){
module.exports = angular.module('ui_videoList', ['ngResource', 'pascalprecht.translate'])
	.directive('uiVideoList', require('./ui_videoListDirective'))
	.directive('uiVideoListItem', require('./ui_videoListItemDirective'));


},{"./ui_videoListDirective":22,"./ui_videoListItemDirective":23}],22:[function(require,module,exports){
/*
 * <ui-video-list ng-model="" display="floating" control="pc" play-link=""></ui-video-list>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { type, id, item, img, created, description, ...}, where type: playlist|video
 * @attr display string Display type - 'horizontal' or 'floating' (default) for styling and controls behaviour
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
            displayType: '@display',
            controlType: '@control'
        },
		controller: function($scope){
		},
		link: function(scope, element){
		}
	};
};
},{"./ui_videoListTemplate.html":25}],23:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./ui_videoListItemTemplate.html'),
		link: function(scope, element){
		}
	};
};

},{"./ui_videoListItemTemplate.html":24}],24:[function(require,module,exports){
module.exports = "<div class=\"img\">\r\n    <img ng-if=\"item.img\" src=\"{{item.img}}\"/>\r\n    <a class=\"playimg\" ng-href=\"#/view/expand/{{item.type}}/{{item.id}}\"> <!-- TODO: replace href with {{ link | replaceParams }} -->\r\n        <img data-index=\"{{$index}}\" data-id=\"{{item.playlistId}}\" src=\"assets/youtube_producer/img/play-icon.svg\" />\r\n    </a>\r\n    <div ng-if=\"item.type == 'video'\" class=\"duration\"><span>{{ item.duration | duration }}</span></div>\r\n    <div ng-if=\"item.type == 'playlist'\" class=\"items\"><span>{{ item.totalItems}}</span></div>\r\n</div>\r\n<div class=\"metadata\">\r\n    <p class=\"title\">{{item.title}}</p>\r\n    <p class=\"subtitle\" ng-if=\"item.channel\">\r\n        <span>by {{item.channel}}</span><br />\r\n        <span>{{ item.description.createDate | timeAgo }}</span>\r\n    </p>\r\n    <p class=\"description\" data-type=\"description\" cw-reveal-label ng-if=\"item.description.text\">\r\n        {{item.description.text}}\r\n    </p>\r\n    <p class=\"description\" ng-if=\"!item.description.text\">No description available.</p>\r\n</div>\r\n<div class=\"buttons\">\r\n    <app-send-to-tv id=\"{{ item.id}}\" data-type=\"{{ item.type}}\" data-title=\"{{ item.title}}\"></app-send-to-tv>\r\n</div>\r\n<!-- TODO: <ng-transclude></ng-transclude> for send2tv component? -->";

},{}],25:[function(require,module,exports){
module.exports = "<ul class=\"{{ class || 'ui-video-list'}} clearfix\">\r\n    <li class=\"ui-video-list-item\" ng-repeat=\"item in videoList\">\r\n        <ui-video-list-item></ui-video-list-item>\r\n    </li>\r\n    <div ng-if=\"videoList.length == 0\">\r\n        {{ 'No results found' | translate }}\r\n    </div>\r\n</ul>\r\n";

},{}],26:[function(require,module,exports){
module.exports = "<yt-viewer></yt-viewer>\r\n";

},{}],27:[function(require,module,exports){
module.exports = angular.module('yt_auth', ['ngResource'])
	.directive('ytAuth', require('./yt_authDirective'));

},{"./yt_authDirective":28}],28:[function(require,module,exports){
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
},{}],29:[function(require,module,exports){
module.exports = angular.module('yt_notification', ['ngResource'])
.service('ytNotification', require('./ytNotification'));
},{"./ytNotification":30}],30:[function(require,module,exports){
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

},{}],31:[function(require,module,exports){
module.exports = angular.module('yt_result', ['ngResource', 'pascalprecht.translate', 'reactTo', 'ui_videoList'])
    .directive('ytResultSet', require('./yt_resultSetDirective'));


},{"./yt_resultSetDirective":32}],32:[function(require,module,exports){
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
},{"./yt_resultSetTemplate.html":33}],33:[function(require,module,exports){
module.exports = "<div class=\"{{ class || 'yt-result-set' }}\">\r\n  <div ng-repeat=\"videoList in resultLists\" class=\"result\">\r\n    <h2>{{ videoList.title }}</h2>\r\n    <ui-video-list ng-model=\"videoList.items\" play-link=\"{{ playLink }}\" type=\"{{ listType }}\"></ui-video-list>\r\n    <!-- TODO: prev/next links based on attributes in videoList -->\r\n  </div>\r\n</div>\r\n";

},{}],34:[function(require,module,exports){
module.exports = angular.module('yt_search', ['ngResource', 'yaru22.angular-timeago'])
	.service('ytYoutubeService', require('./yt_youtubeService'));

},{"./yt_youtubeService":35}],35:[function(require,module,exports){
/* global angular, module, config */
module.exports = (function ($http, $q, ytYoutubeServiceConfig) {
    'use strict';
    var settings = ytYoutubeServiceConfig || {
            search: {
                url: 'https://www.googleapis.com/youtube/v3/search',
                type: 'playlist,video',
                part: 'snippet'
            },
            playlists: {
                url: 'https://www.googleapis.com/youtube/v3/playlists',
                part: 'snippet,contentDetails'
            },
            videos: {
                url: 'https://www.googleapis.com/youtube/v3/videos',
                part: 'contentDetails'
            },
            maxResults: 8,
            regionCode: 'GB',
            relevanceLanguage: 'en',
            developerToken: config.youtubeDeveloperToken
        },
        searchValue;

    var processResultList = function(type, data){
        var list = [],
            playlists = [],
            playlists_map = [],
            durations = [],
            durations_map = [];
        
        data.items.forEach(function(item){
            var kind = item.id.kind.replace('youtube#', ''),
                id = item.id[kind+'Id'];
                
            var newListItem = {
                type: kind,
                id : id,
                title: item.snippet.title,
                img: item.snippet.thumbnails.medium.url,
                channel: 'video' === kind ? item.snippet.channelTitle : '',
                description: {
                    createDate: item.snippet.publishedAt,
                    text: item.snippet.description
                }
            };

            if(kind === 'playlist') {
                playlists.push(id);
                playlists_map[id] = list.length;
                // gets video id from image in case of video duration need
                // id = item.snippet.thumbnails.medium.url.match(/vi\/(.+?)\//)[1];
            } else {
                durations.push(id);
                durations_map[id] = list.length;
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

        if(durations.length) {
            $http.get(settings.videos.url, {
                params: {
                    id: durations.join(','),
                    key: settings.developerToken,
                    part: settings.videos.part,
                    maxResults: durations.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[durations_map[item.id]].duration = item.contentDetails.duration;
                });
            });
        }

        // TODO: distinguish result set depending on type
        return [
            {
                etag: data.etag,
                found: data.pageInfo.totalResults,
                perPage: data.pageInfo.resultsPerPage,
                type: type,
                title: 'Results for "' + searchValue + '"',
                next: data.nextPageToken,
                prev: data.prevPageToken,
                items: list
            }
        ];
    };

    var getResult = function(type, query, number) {
        var deferred = $q.defer();
        
        searchValue = query;
        $http.get(settings.search.url, {
            params: {
                maxResults: number || settings.maxResults,
                relevanceLanguage: settings.relevanceLanguage,
                regionCode: settings.regionCode,
                q: query,
                part: settings.search.part,
                key: settings.developerToken,
                type: settings.search.type
            }
        }).success(function(data){
            deferred.resolve(processResultList(type, data));
        }).error(function(data){
            console.error("error happening on .setSearchResult:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    return {
        getResult: getResult
        // TODO:
        // getNext: getNext,
        // getPrev: getPrev
        // setMaxResults
        // setRegionCode
        // setRelevanceLanguage
        // getDetails
    };
});
},{}],36:[function(require,module,exports){
module.exports = angular.module('yt_viewer', ['ngResource', 'pascalprecht.translate'])
    .directive('ytViewer', require('./yt_viewerDirective'))
    .directive('ytPlayer', require('./yt_playerDirective'))
    .directive('ytVideoDescription', require('./yt_videoDescriptionDirective'))
    .directive('ytPlaylist', require('./yt_playlistDirective'));


},{"./yt_playerDirective":37,"./yt_playlistDirective":39,"./yt_videoDescriptionDirective":41,"./yt_viewerDirective":43}],37:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_playerTemplate.html'),
		controller: function($scope) {
		},
		link: function(scope, element){
		}
	};
};
},{"./yt_playerTemplate.html":38}],38:[function(require,module,exports){
module.exports = "<div class=\"yt-player\">\r\nPlayer\r\n</div>";

},{}],39:[function(require,module,exports){

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
},{"./yt_playlistTemplate.html":40}],40:[function(require,module,exports){
module.exports = "<div class=\"yt-playlist\">\r\nPlaylist\r\n</div>";

},{}],41:[function(require,module,exports){

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
},{"./yt_videoDescriptionTemplate.html":42}],42:[function(require,module,exports){
module.exports = "<div class=\"yt-video-description\">\r\nDescription\r\n</div>";

},{}],43:[function(require,module,exports){

module.exports = function () {
	return {
		restrict: 'E',
		template: require('./yt_viewerTemplate.html'),
        scope: {
            class: '@class'
        },
		controller: function($scope) {
		},
		link: function(scope, element){
		}
	};
};
},{"./yt_viewerTemplate.html":44}],44:[function(require,module,exports){
module.exports = "<div class=\"{{ class || 'yt-viewer' }}\">\r\n  <div class=\"video\">\r\n    <yt-player>Player</yt-player>\r\n    <div class=\"yt-controls\">Controls</div><!-- TODO: separate directive -->\r\n    <yt-video-description>Description</yt-video-description>\r\n  </div>\r\n  <div class=\"playlist\">\r\n    <yt-playlist></yt-playlist>\r\n  </div>\r\n</div>";

},{}]},{},[1])