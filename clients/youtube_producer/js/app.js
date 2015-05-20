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

youtubeApp.run(function($location, $translate, $rootScope, appMode){
    var params = $location.search();
    if(params.lang){
        $translate.use(params.lang);
    }
    $rootScope.appMode = appMode;
});
