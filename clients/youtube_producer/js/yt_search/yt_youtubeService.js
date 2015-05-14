/* global angular, module, config */
module.exports = (function ($http, $q, ytYoutubeServiceConfig) {
    'use strict';
    var settings = ytYoutubeServiceConfig || {
            search: {
                url: 'https://www.googleapis.com/youtube/v3/search',
                type: 'playlist,video',
                part: 'snippet'
            },
            playlists: {
                url: 'https://www.googleapis.com/youtube/v3/playlists',
                part: 'snippet,contentDetails'
            },
            videos: {
                url: 'https://www.googleapis.com/youtube/v3/videos',
                part: 'contentDetails'
            },
            maxResults: 8,
            regionCode: 'GB',
            relevanceLanguage: 'en',
            developerToken: config.youtubeDeveloperToken
        },
        searchValue;

    var processResultList = function(type, data){
        var list = [],
            playlists = [],
            playlists_map = [],
            durations = [],
            durations_map = [];
        
        data.items.forEach(function(item){
            var kind = item.id.kind.replace('youtube#', ''),
                id = item.id[kind+'Id'];
                
            var newListItem = {
                type: kind,
                id : id,
                title: item.snippet.title,
                img: item.snippet.thumbnails.medium.url,
                channel: 'video' === kind ? item.snippet.channelTitle : '',
                description: {
                    createDate: item.snippet.publishedAt,
                    text: item.snippet.description
                }
            };

            if(kind === 'playlist') {
                playlists.push(id);
                playlists_map[id] = list.length;
                // gets video id from image in case of video duration need
                // id = item.snippet.thumbnails.medium.url.match(/vi\/(.+?)\//)[1];
            } else {
                durations.push(id);
                durations_map[id] = list.length;
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

        if(durations.length) {
            $http.get(settings.videos.url, {
                params: {
                    id: durations.join(','),
                    key: settings.developerToken,
                    part: settings.videos.part,
                    maxResults: durations.length
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[durations_map[item.id]].duration = item.contentDetails.duration;
                });
            });
        }

        // TODO: distinguish result set depending on type
        return [
            {
                etag: data.etag,
                found: data.pageInfo.totalResults,
                perPage: data.pageInfo.resultsPerPage,
                type: type,
                title: 'Results for "' + searchValue + '"',
                next: data.nextPageToken,
                prev: data.prevPageToken,
                items: list
            }
        ];
    };

    var getResult = function(type, query, number) {
        var deferred = $q.defer();
        
        searchValue = query;
        $http.get(settings.search.url, {
            params: {
                maxResults: number || settings.maxResults,
                relevanceLanguage: settings.relevanceLanguage,
                regionCode: settings.regionCode,
                q: query,
                part: settings.search.part,
                key: settings.developerToken,
                type: settings.search.type
            }
        }).success(function(data){
            deferred.resolve(processResultList(type, data));
        }).error(function(data){
            console.error("error happening on .setSearchResult:", data);
            deferred.reject();
        });

        return deferred.promise;
    };

    return {
        getResult: getResult
        // TODO:
        // getNext: getNext,
        // getPrev: getPrev
        // setMaxResults
        // setRegionCode
        // setRelevanceLanguage
        // getDetails
    };
});