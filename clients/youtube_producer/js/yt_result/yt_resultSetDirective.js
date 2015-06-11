/*
 * <yt-result-set ng-model="" display="" control="" play-link="" play-fn="" load-more=""></yt-result-set>
 *
 * @attr ng-model array Scope model to be used as data feed - with elements containing: { type, title, items, ...@see ui-video-list},
 *                      where type determines search strategy - used by search/load
 * @attr display @see ui-video-list
 * @attr control @see ui-video-list
 * @attr play-link @see ui-video-list
 * @attr play-fn @see ui-video-list
 * @attr load-more @see ui-video-list
 *
 */
module.exports = function (appRemoteControlService, $location) {
	return {
		restrict: 'E',
		template: require('./yt_resultSetTemplate.html'),
        scope: {
            resultLists: '=ngModel',
            playLink: '@?playLink',
            playFn: '@?playFn',
            displayType: '@display',
            controlType: '@control',
            loadMore: '@loadMore'
        },
		controller: function($scope) {
		},
		link: function(scope, element, attr){
            var _unbinder = [], items = [], rows = [],
                current, $current, parent, $parent, $container, lists, loadNext, row, elementDistance, perRow;

            var activate = function(act) {
                // deactivate old
                if(items[current]) {
                    angular.element(items[current]).attr('activated', false);
                    if(lists.length > 1) {
                        parent = items[current].parentNode;
                        $parent = angular.element(parent);
                        $parent.css({transform: 'translate(0, 0)'});
                        angular.element(parent.parentNode.parentNode).removeClass('row-' + items[current].rowNumber + '-activated');
                        // check if row switched and reset to first in row, but not for left (-1)
                        if(items[act] && items[current].rowNumber !== items[act].rowNumber &&  current - act !== 1) {
                            act = items.indexOf(rows[items[act].rowNumber - 1][0]);
                        }
                    }
                }
                // activate new
                current = act;
                if(current !== null) {
                    parent = items[current].parentNode;
                    $container = angular.element(parent.parentNode.parentNode);
                    $parent = angular.element(parent);
                    $current = angular.element(items[current]).attr('activated', true);

                    if(lists.length > 1) {
                        $container.addClass('row-' + items[current].rowNumber + '-activated');
                        // TODO: adapt to calculate different number of elements in row if needed
                        $parent.css({transform: 'translate(-' + (( current - perRow * ( items[current].rowNumber - 1 )) * elementDistance.x) + 'px, 0px)'});
                    } else {
                        $container.css({transform: 'translate(-' + (current * elementDistance.x) + 'px, 0px)'}); // TODO: evantually add control of Y
                    }
                }
            };

            var remoteControl = function(command) {
                var num;
                switch(command) {
                    case 'activate': {
                        element.attr('activated', true);
                        lists = element.find('ui-video-list');
                        angular.forEach(lists, function(val, key) {
                            var its = angular.element(val).find('ui-video-list-item');
                            rows[key] = [];
                            angular.forEach(its, function(it, pos) {
                                it.rowNumber = key + 1;
                                it.positionIndex = pos;
                                items.push(it);
                                rows[key].push(it);
                            });
                        });
                        perRow = items.length / lists.length;
                        if(lists[0]) {
                            loadNext = angular.element(lists[0]).isolateScope().loadNext;
                        }
                        elementDistance = {
                            x: items[1] && items[0] ? items[1].offsetLeft - items[0].offsetLeft : 0,
                            y: items[1] && items[0] ? items[1].offsetTop - items[0].offsetTop : 0
                        };
                        activate(current || 0);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        if(attr.remoteControl !== 'playlist') {
                            activate(null);
                        }
                        break;
                    }
                    case 'up': {
                        if(attr.remoteControl === 'playlist') {
                            // deactivate to go to top element (search)
                            appRemoteControlService.deactivate(attr.remoteControl);
                            return;
                        }
                        // no break;
                    }
                    case 'left': {
                        num = command === 'left' ? 1 : 4;
                        if(current - num > 0) {
                            activate(current - num);
                        } else {
                            if(current === 0) {
                                // deaxtivate on next press of first element
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(0);
                        }
                        break;
                    }

                    case 'down': {
                        if(attr.remoteControl === 'playlist') {
                            // deactivate to go to bottom element (player)
                            appRemoteControlService.deactivate(attr.remoteControl);
                            return;
                        }
                        // no break;
                    }
                    case 'right': {
                        num = command === 'right' ? 1 : 4;
                        if(current + num < items.length) {
                            activate(current + num);
                        } else {
                            if(current === items.length - 1 && attr.remoteControl !== 'playlist') {
                                // deaxtivate on next press of last element; but not for playlist
                                appRemoteControlService.deactivate(attr.remoteControl);
                                return;
                            }
                            activate(items.length - 1);
                        }
                        // load more if button with method exists and list is single type
                        if(current + num >= items.length - 8) {
                            if(loadNext && lists.length === 1) {
                                loadNext(function() {
                                    items = element.find('ui-video-list-item');
                                });
                            }
                        }
                        break;
                    }
                    case 'play':
                    case 'enter': {
                        var el = $current.find('a')[0];
                        if(el.hash) {
                            $location.path(el.hash.substring(1));
                        } else {
                            $current.triggerHandler('click');
                            appRemoteControlService.deactivate(attr.remoteControl, 'down');
                        }
                        break;
                    }
                }
            };

            if(attr.remoteControl) {
                appRemoteControlService.register(attr.remoteControl, remoteControl);
            }

            scope.$on('$destroy', function() {
                if(attr.remoteControl) {
                    appRemoteControlService.deregister(attr.remoteControl, remoteControl);
                }
                _unbinder.forEach(function(unbind) {
                  unbind();
                });
            });
		}
	};
};