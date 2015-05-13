
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
