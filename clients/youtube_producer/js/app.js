var youtubeApp = angular.module('youtubeApp',
	[
		'ngRoute',
		'ngResource',
		'pascalprecht.translate',
		'reactTo',
        require('./app_search').name,
        require('./app_mode').name,
        require('./app_sendToTv').name,
        require('./ui_videoList').name,
		require('./yt_result').name,
        require('./yt_search').name,
		require('./yt_auth').name,
		require('./yt_notification').name,
        require('./yt_viewer').name
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
    };
    $translateProvider.preferredLanguage('en');
});

youtubeApp.run(function($location, $translate){
    var params = $location.search();
    if(params.lang){
        $translate.use(params.lang);
    }
});

youtubeApp.constant("SERVERPATHS", {
    youtubeUrl: "/playlist",
		notificationUrl: "/notification",
		level2Url: "/level2tv",
		imageUrl: "/assets/youtube_producer/img/"
});

youtubeApp.constant("SPECIALPURPOSE", {
    notificationTriggers: ["yetu", "is", "awesome"],
		successOnSentNotification: "A general notification was sent successfully!",
		errorOnSentNotification: "There was an error sending the general notification",
		displayTimeout: 2000
});

youtubeApp.constant("YOUTUBEREQUESTS", {
    maxResults: 1,
    playlistItems: {
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        part: 'snippet'
    },
    video: {
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet,contentDetails,statistics'
    }
});
youtubeApp.constant('i18n', {
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

// TODO: refactor to separated files
// require('./dashboardController.js'); ???
// require('./_controllers'); ???
youtubeApp.controller('DashboardCtrl', ['$scope', 'ytSearchService', '$routeParams', '$location', 'appMode', '$rootScope', 
  function($scope, ytSearchService, $routeParams, $location, appMode, $rootScope) {
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
        ytSearchService.getResult('search', $routeParams.param).then(function(data) {
            $scope.mainResultList = data;
            $scope.searchValue = $routeParams.param; // temporary as search inside
        });
    }

    $scope.$on('app:search-value', function(event, query){
        // temporary start search here
        ytSearchService.getResult('search', query).then(function(data) {
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
}]);

youtubeApp.controller('ViewerCtrl', ['$scope', 'ytSearchService', 'appMode', '$rootScope', '$routeParams',
  function($scope, ytSearchService, appMode, $rootScope, $routeParams) {

    // temporary
    $rootScope.temporaryMode = appMode.get() + 'mode';
    $rootScope.temporaryType = $routeParams.mode;

    $scope.$on('app:search-value', function(event, query){
        // TODO: route to dashboard/search
    });
}]);
