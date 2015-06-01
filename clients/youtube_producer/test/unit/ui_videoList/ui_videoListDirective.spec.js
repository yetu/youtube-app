'use strict';

describe('Directive: ui-video-list', function () {
    var $compile,
        $rootScope;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should compile element properly', function() {
        var element = $compile('<ui-video-list ng-model="videos" play-link="#/view/expand/:type/:id"></ui-video-list>')($rootScope);
        $rootScope.videos = [{id: 'id123', title: 'Some title', type: 'video', img: 'some.img', description: 'Some description'},
                             {id: 'id333', title: 'Some other title', type: 'playlist', img: 'other.img', description: 'Some other description'}];
        
        $rootScope.$digest();
        expect(element.find('a').eq(0).attr('href')).toBe('#/view/expand/video/id123');
        expect(element.find('a').eq(2).attr('href')).toBe('#/view/expand/playlist/id333');
        expect(element.find('app-send-to-tv').length).toEqual(2);
    });

    it('should react on play link if defined', function() {
        var element = $compile('<ui-video-list ng-model="videos" play-fn="someFunction"></ui-video-list>')($rootScope);
        $rootScope.videos = [{id: 'id123', title: 'Some title', type: 'video', img: 'some.img', description: 'Some description'}];
        $rootScope.$digest();
        $rootScope.someFunction = function(){};
        spyOn($rootScope, 'someFunction');
        expect(element.find('a').eq(0).attr('href')).not.toBeDefined();
        element.find('ui-video-list-item').eq(0).triggerHandler('click');
        expect($rootScope.someFunction).toHaveBeenCalledWith(0);
    });

    it('should log error on play link if defined but doesnt exist', function() {
        var element = $compile('<ui-video-list ng-model="videos" play-fn="someFunction"></ui-video-list>')($rootScope);
        $rootScope.videos = [{id: 'id123', title: 'Some title', type: 'video', img: 'some.img', description: 'Some description'}];
        $rootScope.$digest();
        spyOn(console, 'error');
        expect(element.find('a').eq(0).attr('href')).not.toBeDefined();
        element.find('ui-video-list-item').eq(0).triggerHandler('click');
        expect(console.error).toHaveBeenCalled();
    });
});
