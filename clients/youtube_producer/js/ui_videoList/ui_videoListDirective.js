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