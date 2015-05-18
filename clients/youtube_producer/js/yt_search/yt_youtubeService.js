/* global angular, module, config */
module.exports = (function ($http, $q, ytYoutubeServiceConfig) {
    'use strict';
    var settings = ytYoutubeServiceConfig,
        searchValue,
        categories = [];

    var processResultList = function(type, data){
        var list = [],
            playlists = [],
            playlists_map = [],
            videos = [],
            videos_map = [],
            meta = null;
        
        data.items.forEach(function(item){
            var kind, id;

            if(type === 'playlist') {
                kind = item.snippet.resourceId.kind.replace('youtube#', '');
                id = item.snippet.resourceId[kind+'Id'];
            } else {
                // for search result kind is inside id
                kind = (item.id.kind || item.kind).replace('youtube#', ''),
                id = item.id[kind+'Id'] || item.id;
            }

            var newListItem = {
                type: kind,
                id : id,
                title: item.snippet.title,
                img: item.snippet.thumbnails ? item.snippet.thumbnails.medium.url : null, // deleted videos have no image
                channel: 'video' === kind ? item.snippet.channelTitle : '',
                created: item.snippet.publishedAt,
                description: item.snippet.description,
                views: item.statistics ? item.statistics.viewCount : null
            };

            if(kind === 'playlist') {
                playlists.push(id);
                playlists_map[id] = list.length;
                // gets video id from image in case of video duration need
                // id = item.snippet.thumbnails.medium.url.match(/vi\/(.+?)\//)[1];
            } else if(item.snippet && item.contentDetails && item.statistics) {
                // if already get just use without next request
                newListItem.duration = item.contentDetails.duration;
                newListItem.category = categories[item.snippet.categoryId] ? categories[item.snippet.categoryId].title : null;
                newListItem.views = item.statistics.viewCount;
            } else {
                videos.push(id);
                videos_map[id] = list.length;
            }

            list.push(newListItem);
        });

        if(playlists.length) {
            $http.get(settings.playlists.url, {
                params: {
                    id: playlists.join(','),
                    key: settings.developerToken,
                    part: settings.playlists.part,
                    maxResults: playlists.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[playlists_map[item.id]].channel = item.snippet.channelTitle;
                    list[playlists_map[item.id]].totalItems = item.contentDetails.itemCount;
                });
            });
        }

        if(videos.length) {
            $http.get(settings.video.url, {
                params: {
                    id: videos.join(','),
                    key: settings.developerToken,
                    part: 'snippet,contentDetails,statistics', // needed for duration, categoyId and views
                    maxResults: videos.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[videos_map[item.id]].category = categories[item.snippet.categoryId] ? categories[item.snippet.categoryId].title : null;
                    list[videos_map[item.id]].duration = item.contentDetails.duration;
                    list[videos_map[item.id]].views = item.statistics.viewCount;
                });
            });
        }
                
        meta = {
            etag: data.etag,
            found: data.pageInfo.totalResults,
            perPage: data.pageInfo.resultsPerPage,            
            next: data.nextPageToken,
            prev: data.prevPageToken
        };

        switch(type) {
            case 'search': {
                meta.type = type;
                meta.title = 'Results for "' + searchValue + '"';
                meta.items = list;
                return meta;
            }
            case 'related': {
                meta.type = type;
                meta.title = 'Related videos';
                meta.items = list;
                return meta;
            }
            case 'video': {
                return list[0];
            }
            case 'playlist': {
                meta.type = type;
                meta.title = 'Playlist videos';
                meta.items = list;
                return meta;
            }
        }
    };

    /**
     *
     * @param {String} type Query type: 'search'|'related'
     * @param {String} query Query - searched phrase for search type, video id for related
     * @param {Number} number Optional number of results
     * @returns {Promise} Then data -
     */
    var getResult = function(type, query, number) {
        var deferred = $q.defer(),
            params = {
                maxResults: number || settings.search.maxResults,
                relevanceLanguage: settings.relevanceLanguage,
                regionCode: settings.regionCode,
                part: settings.search.part,
                key: settings.developerToken
            };

        switch(type) {
            case 'search': {
                searchValue = query;
                params.q = query;
                params.type = settings.search.type;
                break;
            }
            case 'related': {
                params.relatedToVideoId = query;
                params.type = 'video';
                break;
            }
        }

        $http.get(settings.search.url, {
            params: params
        }).success(function(data){
            deferred.resolve(processResultList(type, data));
        }).error(function(data){
            console.error("error happening on .getResult:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    var getDetails = function(type, id) {
        var deferred = $q.defer();
        var params = {
            maxResults: settings[type].maxResults,
            part: settings[type].part,
            key: settings.developerToken
        };
        params[settings[type].id] = id;

        $http.get(settings[type].url, {
            params: params
        })
        .success(function(data){
            var items, result;
            items = processResultList(type, data);

            switch(type) {
                case 'playlist': {
                    result = {
                        playlist: items,
                        video: items.items[0]
                    };
                    deferred.resolve(result);
                    break;
                }
                case 'video': {
                    getResult('related', id, 20).then(function(data) {
                        result = {
                            playlist: data,
                            video: items
                        };
                        deferred.resolve(result);
                    });
                    break;
                }
            }
        })
        .error(function(data){
            console.error("error happening on .getDetails:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    var getCategory = function(id) {
        if(categories.length) {
            return categories[id] ? categories[id] : {};
        } else {
            console.error('Categories unitialized - use initialize() first and then()');
        }
    };

    var initialize = function() {
        var promise = $http.get(settings.category.url, {
            params: {
                regionCode: settings.regionCode,
                key: settings.developerToken,
                part: 'snippet'
            }
        })
        .success(function(data){
            data.items.forEach(function(item) {
                categories[item.id] = {
                    title: item.snippet.title
                };
            });
        })
        .error(function(data){
            console.error("error happening on .initCategories:", data);
        });
        return promise;
    };

    return {
        initialize: initialize,
        getResult: getResult,
        getDetails: getDetails,
        getCategory: getCategory
        // TODO:
        // getNext: getNext,
        // getPrev: getPrev
        // setMaxResults
        // setRegionCode
        // setRelevanceLanguage
    };
});