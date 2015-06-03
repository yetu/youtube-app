'use strict';

describe('Service: yt_youtubeService', function () {
    var $httpBackend, $rootScope, service, localStorageService;

    beforeEach(module('youtubeApp'));

    beforeEach(inject(function(_$httpBackend_, _$rootScope_, ytYoutubeService, _localStorageService_){
        $httpBackend = _$httpBackend_;
        $rootScope = _$rootScope_;
        service = ytYoutubeService;
        localStorageService = _localStorageService_;
    }));
    
    it('should initialize categories', function() {
        var respond = {
                categories: __fixtures__['yt_search/youtube.videoCategories.response'],
            },
            expected = {
                categories: 'https://www.googleapis.com/youtube/v3/videoCategories?part=snippet&regionCode=GB',
                category: {title: 'Film & Animation'}
            };
        spyOn(localStorageService, 'get').and.returnValue(null);
        $httpBackend.expectGET(expected.categories).respond(200, respond.categories);
        service.initialize();
        $httpBackend.flush();
    });

    it('should return empty objects if initialized and doesnt exist', function() {
        var setCategory = {'1': 'some'},
            expectedCategory = {},
            cat;
        spyOn(localStorageService, 'get').and.returnValue(setCategory);
        service.initialize();
        cat = service.getCategory(2);
        expect(cat).toEqual(expectedCategory);
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
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=1&part=contentDetails',
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

    it('should request youtube api for most popular videos', function() {
        var categories = { '1': { 'id': 1, 'title': 'Film & Animation'}, '25': { 'id': 25, 'title': 'News & Politics'} };
        var respond = {
                popular: __fixtures__['yt_search/youtube.video.popular.response'],
                video: __fixtures__['yt_search/youtube.videoList.response']
            },
            expected = {
                popular: 'https://www.googleapis.com/youtube/v3/videos?chart=mostPopular&maxResults=4&part=snippet&regionCode=GB&type=playlist,video&videoCategoryId=25',
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id,second-video-id&maxResults=2&part=contentDetails',
                item0: {
                    type: 'video', id: 'first-video-id', title: 'Alton Towers crash: Four seriously injured - BBC News', img: 'https://i.ytimg.com/vi/first-video-id/mqdefault.jpg',
                    channel: 'BBC News', created: '2015-06-02T14:51:12.000Z', description: 'BBC News descritpion', views: null}
            };

        spyOn(localStorageService, 'get').and.returnValue(categories);
        service.initialize();
        $httpBackend.expectGET(expected.popular).respond(200, respond.popular);
        $httpBackend.expectGET(expected.video).respond(200, respond.video);
        service.getResult('popular', 25).then(function(data) {
            expect(data.type).toBe('popular');
            expect(data.categoryId).toBe(25);
            expect(data.title).toBe('News & Politics');
            expect(data.etag).toBe('some-etag-popular');
            expect(data.items[0]).toEqual(expected.item0);
            expect(data.items[2]).not.toBeDefined();
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
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=16&part=snippet,contentDetails,statistics',
                search: 'https://www.googleapis.com/youtube/v3/search?maxResults=16&part=snippet&regionCode=GB&relatedToVideoId=first-video-id&relevanceLanguage=en&type=video',
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
            expect(data.playlist.etag).toBe('some-etag-search-related');
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
                playlistitems: 'https://www.googleapis.com/youtube/v3/playlistItems?maxResults=16&part=snippet&playlistId=some-playlist-id',
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
            expect(data.playlist.etag).toBe('some-etag-playlist-items');
            expect(data.video).toEqual(expected.videoData);
            expect(data.playlist.type).toEqual('playlist');
            expect(data.playlist.items[0]).toEqual(expected.playlistData0);
            expect(data.playlist.items[1]).not.toBeDefined();
        });
        $httpBackend.flush();
    });

    it('should request youtube api for get next chunk of search results', function() {
        var respond = {
                search: __fixtures__['yt_search/youtube.search.response'],
                playlist: __fixtures__['yt_search/youtube.playlistList.response'],
                video: __fixtures__['yt_search/youtube.videoList.response']
            },
            expected = {
                search: 'https://www.googleapis.com/youtube/v3/search?maxResults=8&part=snippet&q=yetu&regionCode=GB&relevanceLanguage=en&type=playlist,video',
                playlist: 'https://www.googleapis.com/youtube/v3/playlists?id=playlist-1,playlist-2&maxResults=2&part=snippet,contentDetails',
                video: 'https://www.googleapis.com/youtube/v3/videos?id=first-video-id&maxResults=1&part=contentDetails',
                next: 'https://www.googleapis.com/youtube/v3/search?maxResults=8&pageToken=pg-tok&part=snippet&q=yetu&regionCode=GB&relevanceLanguage=en&type=playlist,video',
                item00: {
                    type: 'playlist', id: 'playlist-1', title: 'Billboard Top Songs 2015', img: 'https://i.ytimg.com/vi/RgKAFK5djSk/mqdefault.jpg',
                    channel: '', created: '2011-02-25T17:10:00.000Z', description: 'Billboard Top Songs 2015.', views: null}
            };

        $httpBackend.expectGET(expected.search).respond(200, respond.search);
        $httpBackend.expectGET(expected.playlist).respond(200, respond.playlist);
        $httpBackend.expectGET(expected.video).respond(200, respond.video);
        $httpBackend.expectGET(expected.next).respond(200, respond.search);
        $httpBackend.expectGET(expected.playlist).respond(200, respond.playlist);
        $httpBackend.expectGET(expected.video).respond(200, respond.video);

        service.getResult('search', 'yetu').then(function(data) {
            service.getNext('some-etag-search', 'pg-tok');
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
        spyOn(localStorageService, 'get').and.returnValue(null);

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

    it('should throw exeption if next page token not found', function() {
        expect(function() {
            service.getNext('unknown-etag', 'token');
        }).toThrow();
    });
});
