
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
