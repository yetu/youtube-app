'use strict';

describe('Directive: ui-video-list', function () {
    var $compile,
        $rootScope;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$compile_, _$rootScope_){
        $compile = _$compile_;
        $rootScope = _$rootScope_;
    }));

    it('should compile to div with default class', function() {
        var element = $compile('<ui-video-list></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('div').eq(0).attr('class')).toBe('ui-video-list');
    });

    it('should compile to div with specified class', function() {
        var element = $compile('<ui-video-list class="some class"></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('div').eq(0).attr('class')).toBe('some class');
    });

    it('should compile element properly', function() {
        $rootScope.videos = [{id: 'id123', title: 'Some title', type: 'video', img: 'some.img', description: { text: 'Some description'}},
                             {id: 'id333', title: 'Some other title', type: 'playlist', img: 'other.img', description: { text: 'Some other description'}}];
        var element = $compile('<ui-video-list ng-model="videos"></ui-video-list>')($rootScope);
        $rootScope.$digest();
        expect(element.find('a').eq(0).attr('href')).toBe('#/view/expand/video/id123');
        expect(element.find('a').eq(1).attr('href')).toBe('#/view/expand/playlist/id333');
        expect(element.find('app-send-to-tv').eq(0).attr('id')).toBe('id123');
        expect(element.find('app-send-to-tv').eq(0).attr('data-title')).toBe('Some title');
        expect(element.find('app-send-to-tv').eq(0).attr('data-type')).toBe('video');
        expect(element.find('app-send-to-tv').eq(1).attr('id')).toBe('id333');
        expect(element.find('app-send-to-tv').eq(1).attr('data-title')).toBe('Some other title');
        expect(element.find('app-send-to-tv').eq(1).attr('data-type')).toBe('playlist');
    });
});
