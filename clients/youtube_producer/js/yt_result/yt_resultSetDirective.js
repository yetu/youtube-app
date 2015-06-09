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
module.exports = function (appRemoteControlService, $location) {
	return {
		restrict: 'E',
		template: require('./yt_resultSetTemplate.html'),
        scope: {
            resultLists: '=ngModel',
            playLink: '@playLink',
            displayType: '@display',
            controlType: '@control'
        },
		controller: function($scope) {
		},
		link: function(scope, element, attr){
            var _unbinder = [],
                items, current, $current, lists, loadNext,
                activate = function(act) {
                    if(items[current]) {
                        angular.element(items[current]).attr('activated', false);
                    }
                    current = act;
                    if(current !== null) {
                        var parent = items[current].parentNode,
                            container = parent.parentNode.parentNode,
                            offset;
                        
                        $current = angular.element(items[current]).attr('activated', true);

                        if(lists.length > 1) {
                            offset = parent.offsetTop - 250;
                        } else {
                            offset = items[current].offsetTop - 120;
                        }
                        container.scrollTop = offset; // TODO: animation on scroll?
                    }
                };

            var remoteControl = function(command) {
                
                switch(command) {
                    case 'activate': {
                        var buttons = element.find('button');
                        loadNext = angular.element(buttons[buttons.length - 1]).scope().loadNext;
                        element.attr('activated', true);
                        lists = element.find('ui-video-list');
                        items = element.find('ui-video-list-item');
                        activate(0);
                        break;
                    }
                    case 'deactivate': {
                        element.attr('activated', false);
                        activate(null);
                        break;
                    }
                    case 'left':
                    case 'up': {
                        var num = command === 'left' ? 1 : 4;
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
                    case 'right':
                    case 'down': {
                        var num = command === 'right' ? 1 : 4;
                        if(current + num < items.length) {
                            activate(current + num);
                        } else {
                            if(current === items.length - 1) {
                                // deaxtivate on next press of last element
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
                    case 'enter': {
                        var el = $current.find('a')[0];
                        if(el.hash) {
                            $location.path(el.hash.substring(1));
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