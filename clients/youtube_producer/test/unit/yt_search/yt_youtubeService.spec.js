'use strict';

describe('Service: yt_youtubeService', function () {
    var $httpBackend,
        $rootScope,
        service;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$httpBackend_, _$rootScope_, ytYoutubeService){
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        service = ytYoutubeService;
    }));

    it('should request youtube api for results', function() {
        var respond = {
                search: __fixtures__['yt_search/youtube.search.response'],
                playlist: __fixtures__['yt_search/youtube.playlistList.response'],
                video: __fixtures__['yt_search/youtube.videoList.response']
            },
            expected = {
                search: 'https://www.googleapis.com/youtube/v3/search?maxResults=8&part=snippet&q=yetu&regionCode=GB&relevanceLanguage=en&type=playlist,video',
                playlist: 'https://www.googleapis.com/youtube/v3/playlists?id=playlist-1,playlist-2&maxResults=2&part=snippet,contentDetails',
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=1&part=contentDetails',
                item00: {
                    type: 'playlist', id: 'playlist-1', title: 'Billboard Top Songs 2015', img: 'https://i.ytimg.com/vi/RgKAFK5djSk/mqdefault.jpg',
                    channel: '', description: {
                        createDate: '2011-02-25T17:10:00.000Z',
                        text: 'Billboard Top Songs 2015.'
                    }
                }
            };

        $httpBackend.expectGET(expected.search).respond(200, respond.search);
        $httpBackend.expectGET(expected.playlist).respond(200, respond.playlist);
        $httpBackend.expectGET(expected.video).respond(200, respond.video);
        service.getResult('search', 'yetu').then(function(data) {
            expect(data[0].etag).toBe('some-etag-search');
            expect(data[0].items[0]).toEqual(expected.item00);
            expect(data[1]).not.toBeDefined();
            expect(data[0].items[3]).not.toBeDefined();
        });
        $httpBackend.flush();
    });

    it('should report error if request failed', function() {
        var respond = { error: 'Some error'};
        spyOn(console, 'error');

        $httpBackend.whenGET(/.+/).respond(500, respond);
        service.getResult('search', 'yetu');
        $httpBackend.flush();

        expect(console.error).toHaveBeenCalled();
    });
});
