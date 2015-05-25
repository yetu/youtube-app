var youtubeApp = angular.module('youtubeApp',
	[
		'ngRoute',
		'ngResource',
        'ngCookies',
		'pascalprecht.translate',
		'reactTo',
        'LocalStorageModule',
        'ui-notification',
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
        .when('/view/:mode/:type/:id/:time?/:device?', {
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
        appMode.detectViewType();
    });
    if(appMode.get() !== 'tv') {
        $window.yetu = null;
        $rootScope.authEnabled = true;
    }
});
