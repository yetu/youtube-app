
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