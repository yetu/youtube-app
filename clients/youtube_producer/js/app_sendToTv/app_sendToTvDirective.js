module.exports = function (appSendToTvService) {
	return {
		restrict: 'E',
		template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            data: '=ngModel'
        },
		link: function(scope){
            scope.onSendButtonClick = function(){
              appSendToTvService.sendToTv(scope.data);
			};
		}
	};
};
