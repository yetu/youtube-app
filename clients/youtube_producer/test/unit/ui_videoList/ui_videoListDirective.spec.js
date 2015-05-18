'use strict';

describe('Directive: ui-video-list', function () {
    var $compile,
        $rootScope;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should compile to ul with default class and type', function() {
        var element = $compile('<ui-video-list></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('ul').eq(0).attr('class')).toBe('ui-video-list ');
    });

    it('should compile to ul with specified class', function() {
        var element = $compile('<ui-video-list class="some-class"></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('ul').eq(0).attr('class')).toBe('some-class ');
    });

    it('should compile to ul with specified class and type', function() {
        var element = $compile('<ui-video-list class="some-class" display="list"></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('ul').eq(0).attr('class')).toBe('some-class list');
    });

    it('should compile element properly', function() {
        $rootScope.videos = [{id: 'id123', title: 'Some title', type: 'video', img: 'some.img', description: 'Some description'},
                             {id: 'id333', title: 'Some other title', type: 'playlist', img: 'other.img', description: 'Some other description'}];
        var element = $compile('<ui-video-list ng-model="videos" play-link="#/view/expand/:type/:id"></ui-video-list>')($rootScope);        
        $rootScope.$digest();
        expect(element.find('a').eq(0).attr('href')).toBe('#/view/expand/video/id123');
        expect(element.find('a').eq(1).attr('href')).toBe('#/view/expand/playlist/id333');
        expect(element.find('app-send-to-tv').length).toEqual(2);
    });
});
