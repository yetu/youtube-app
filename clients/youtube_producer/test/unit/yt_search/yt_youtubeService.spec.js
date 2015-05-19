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
    
    it('should return category valid if initialized and exists', function() {
        var respond = {
                categories: __fixtures__['yt_search/youtube.videoCategories.response'],
            },
            expected = {
                categories: 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=GB',
                category: {title: 'Film & Animation'}
            };

        $httpBackend.expectGET(expected.categories).respond(200, respond.categories);
        service.initialize().then(function() {
            var cat = service.getCategory(1);
            expect(cat).toEqual(expected.category);
        });
        $httpBackend.flush();
    });

    it('should return empty objects if initialized and doesnt exist', function() {
        var respond = {
                categories: __fixtures__['yt_search/youtube.videoCategories.response'],
            },
            expected = {
                categories: 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=GB',
                category: {}
            };

        $httpBackend.expectGET(expected.categories).respond(200, respond.categories);
        service.initialize().then(function() {
            var cat = service.getCategory(2);
            expect(cat).toEqual(expected.category);
        });
        $httpBackend.flush();
    });

    it('should report error if category requested before initialization', function() {
        spyOn(console, 'error');
        service.getCategory(1);
        expect(console.error).toHaveBeenCalled();
    });

    it('should request youtube api for search results', function() {
        var respond = {
                search: __fixtures__['yt_search/youtube.search.response'],
                playlist: __fixtures__['yt_search/youtube.playlistList.response'],
                video: __fixtures__['yt_search/youtube.videoList.response']
            },
            expected = {
                search: 'https://www.googleapis.com/youtube/v3/search?maxResults=8&part=snippet&q=yetu&regionCode=GB&relevanceLanguage=en&type=playlist,video',
                playlist: 'https://www.googleapis.com/youtube/v3/playlists?id=playlist-1,playlist-2&maxResults=2&part=snippet,contentDetails',
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=1&part=snippet,contentDetails,statistics',
                item00: {
                    type: 'playlist', id: 'playlist-1', title: 'Billboard Top Songs 2015', img: 'https://i.ytimg.com/vi/RgKAFK5djSk/mqdefault.jpg',
                    channel: '', created: '2011-02-25T17:10:00.000Z', description: 'Billboard Top Songs 2015.', views: null}
            };

        $httpBackend.expectGET(expected.search).respond(200, respond.search);
        $httpBackend.expectGET(expected.playlist).respond(200, respond.playlist);
        $httpBackend.expectGET(expected.video).respond(200, respond.video);
        service.getResult('search', 'yetu').then(function(data) {
            expect(data.etag).toBe('some-etag-search');
            expect(data.items[0]).toEqual(expected.item00);
            expect(data.items[3]).not.toBeDefined();
        });
        $httpBackend.flush();
    });

    it('should request youtube api for details of video', function() {
        var respond = {
                video: __fixtures__['yt_search/youtube.videoList.details.response'],
                search: __fixtures__['yt_search/youtube.search.related.response'],
                related: __fixtures__['yt_search/youtube.videoList.related.response']
            },
            expected = {
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=20&part=snippet,contentDetails,statistics',
                search: 'https://www.googleapis.com/youtube/v3/search?maxResults=20&part=snippet&regionCode=GB&relatedToVideoId=first-video-id&relevanceLanguage=en&type=video',
                related: 'https://www.googleapis.com/youtube/v3/videos?id=rel-video-1,rel-video-2&maxResults=2&part=snippet,contentDetails,statistics',
                videoData: {
                    type: 'video', id: 'first-video-id', title: '4 hours Peaceful & Relaxing', img: 'https://i.ytimg.com/vi/first-video-id/mqdefault.jpg',
                    channel: 'utopiansounds', created: '2014-02-05T10:05:04.000Z', description: '4 hours of soothing background music', views: '111', duration: 'PT4H44S',
                    category: null},
                playlistData0: {
                    type : 'video', id : 'rel-video-1', title : '4 hours Peaceful & Relaxing Instrumental Music-Long Playlist',
                    img : 'https://i.ytimg.com/vi/first-video-id/mqdefault.jpg', channel : 'utopiansounds', created : '2014-02-05T10:05:04.000Z',
                    description : '4 hours of soothing background music for rest & relaxation. Follow on Instagram: ...', views : null}
            };

        $httpBackend.expectGET(expected.video).respond(200, respond.video);
        $httpBackend.expectGET(expected.search).respond(200, respond.search);
        $httpBackend.expectGET(expected.related).respond(200, respond.related);
        
        service.getDetails('video', 'first-video-id').then(function(data) {
            expect(data.playlist.etag).toBe('some-etag-search');
            expect(data.video).toEqual(expected.videoData);
            expect(data.playlist.type).toEqual('related');
            expect(data.playlist.items[0]).toEqual(expected.playlistData0);
            expect(data.playlist.items[3]).not.toBeDefined();
        });
        $httpBackend.flush();
    });

    it('should request youtube api for details of playlist', function() {
        var respond = {
                playlistitems: __fixtures__['yt_search/youtube.playlistListItems.response'],
                videos: __fixtures__['yt_search/youtube.videoList.details.response']
            },
            expected = {
                playlistitems: 'https://www.googleapis.com/youtube/v3/playlistItems?maxResults=20&part=snippet&playlistId=some-playlist-id',
                videos: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=1&part=snippet,contentDetails,statistics',
                videoData: {
                    type : 'video', id : 'first-video-id', title : 'Wiz Khalifa - See You Again', img : 'https://i.ytimg.com/vi/first-video-id/mqdefault.jpg',
                    channel : '#PopMusic', created : '2015-05-17T06:32:10.000Z', description : 'See Wiz on tour this summer', views : null },
                playlistData0: {
                    type : 'video', id : 'first-video-id', title : 'Wiz Khalifa - See You Again', img : 'https://i.ytimg.com/vi/first-video-id/mqdefault.jpg',
                    channel : '#PopMusic', created : '2015-05-17T06:32:10.000Z', description : 'See Wiz on tour this summer', views : null }
            };

        $httpBackend.expectGET(expected.playlistitems).respond(200, respond.playlistitems);
        $httpBackend.expectGET(expected.videos).respond(200, respond.videos);
        
        service.getDetails('playlist', 'some-playlist-id').then(function(data) {
            expect(data.playlist.etag).toBe('some-etag-search');
            expect(data.video).toEqual(expected.videoData);
            expect(data.playlist.type).toEqual('playlist');
            expect(data.playlist.items[0]).toEqual(expected.playlistData0);
            expect(data.playlist.items[1]).not.toBeDefined();
        });
        $httpBackend.flush();
    });

    it('should report error if search request failed', function() {
        var respond = { error: 'Some error'};
        spyOn(console, 'error');

        $httpBackend.whenGET(/.+/).respond(500, respond);
        service.getResult('search', 'yetu');
        $httpBackend.flush();

        expect(console.error).toHaveBeenCalled();
    });

    it('should report error if initialize request failed', function() {
        var respond = { error: 'Some error'};
        spyOn(console, 'error');

        $httpBackend.whenGET(/.+/).respond(500, respond);
        service.initialize();
        $httpBackend.flush();

        expect(console.error).toHaveBeenCalled();
    });

    it('should report error if details request failed', function() {
        var respond = { error: 'Some error'};
        spyOn(console, 'error');

        $httpBackend.whenGET(/.+/).respond(500, respond);
        service.getDetails('video', 'any');
        $httpBackend.flush();

        expect(console.error).toHaveBeenCalled();
    });
});
