
module.exports = function () {
	return {
		restrict: 'E',
		template: require('./app_sendToTvTemplate.html'),
        scope: {
            class: '@class',
            type: '@data-type',
            id: '@id',
            title: '@data-title'
        },
		link: function(scope, element){
            scope.onSendButtonClick = function(e){
                alert('Not implemented yet');
			};
		}
	};
};
