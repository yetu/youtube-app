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