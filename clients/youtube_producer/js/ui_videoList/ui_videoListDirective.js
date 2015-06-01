/*
 * <ui-video-list ng-model="" display="floating" control="pc" play-link="" service="" load-more=""></ui-video-list>
 *
 * @attr ng-model array Scope model to be used as data feed - model containing: { etag, next, items }
 *                      where etag and next are part of data provided by service and used for getNext method,
 *                            items is array of { type, id, item, img, created, description, ...},
 *                                  where type: playlist|video
 * @attr display string Display type - 'horizontal', 'list' or 'floating' (default) for styling and controls behaviour
 * @attr control string Control style - 'tv' or 'pc' (default) - used for control and reacting on events @todo
 * @attr play-link string Link pattern to open video - will replace :attribute if found in element item properties (e.g. '#/show/:type/:id')
 * @attr service string Name of service with "load more" functionality (getNext method) - used by load-more functionality
 * @attr load-more string 'button' - indicates if button "load more" should be appended; 'scroll' - indicates if "load more" should be called on scroll bottom
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
            controlType: '@control',
            loadMore: '@?loadMore'
        },
        controller: function ($scope, $element, $attrs, $injector) {
            var myService;

            if ($attrs.service) {
                myService = $injector.get($attrs.service);
            }

            $scope.loadNext = function() {
                if(!$scope.videoList.etag || !$scope.videoList.next || $scope.loadingMore) {
                    return;
                }

                $scope.loadingMore = true;

                myService.getNext($scope.videoList.etag, $scope.videoList.next).then(
                    function(moreVideos){
                        var temparray = $scope.videoList.items;
                        $scope.videoList.items = temparray.concat(moreVideos.items);
                        $scope.videoList.next = moreVideos.next;
                    })
                    .finally(function() {
                        $scope.loadingMore = false;
                    });
            };

        },
        link: function (scope, element) {
            // default display type
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

            if(scope.loadMore === 'scroll') {
                // TODO: check in unbind necessary on $destroy
                element.bind('scroll', function () {
                    var elem = element[0],
                        distance = elem.scrollHeight * 0.1, // 10% to end
                        toBottom = elem.scrollHeight - elem.clientHeight - elem.scrollTop;
                    
                    if(toBottom < distance) {
                        scope.loadNext();
                    }
                });
            }
        }
    };
};