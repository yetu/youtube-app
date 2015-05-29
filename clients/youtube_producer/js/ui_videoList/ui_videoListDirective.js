/*
 * <ui-video-list ng-model="" display="floating" control="pc" play-link="" service=""></ui-video-list>
 *
 * @attr ng-model array Scope model to be used as data feed - model containing: { etag, next, items }
 *                      where etag and next are part of data provided by service and used for getNext method,
 *                            items is array of { type, id, item, img, created, description, ...},
 *                                  where type: playlist|video
 * @attr display string Display type - 'horizontal', 'list' or 'floating' (default) for styling and controls behaviour
 * @attr control string Control style - 'tv' or 'pc' (default) - used for control and reacting on events @todo
 * @attr play-link string Link pattern to open video - will replace :attribute if found in element item properties (e.g. '#/show/:type/:id')
 * @attr service string Link to service to open the video with
 */
module.exports = function () {
    return {
        restrict: 'E',
        template: require('./ui_videoListTemplate.html'),
        scope: {
            videoList: '=ngModel',
            playLink: '@playLink',
            playFn: '@playFn', // TODO: some function binding?
            displayType: '@display',
            controlType: '@control'
        },
        controller: function ($scope, $element, $attrs, $injector) {
            var myService;

            if ($attrs.service) {
                myService = $injector.get($attrs.service);
                console.debug("myService: ", myService);
            }


            $scope.loadMore = function(){
                myService.getNext($scope.videoList.etag, $scope.videoList.next).then(
                    function(moreVideos){
                        $scope.videoList.items = moreVideos.items;
                        $scope.videoList.next = moreVideos.next;
                    }
                );
            };

        },
        link: function (scope, element) {

            console.error('ui-video-directive scope: ', scope.videoList);

            if (!scope.displayType) {
                scope.displayType = 'floating';
            }

            scope.playFunction = function (index) {
                if (typeof(scope.$parent[scope.playFn]) === 'function') {
                    scope.$parent[scope.playFn](index);
                } else {
                    console.error('ui-video-directive: ' + scope.playFn + ' is not a function');
                }
            };
        }
    };
};