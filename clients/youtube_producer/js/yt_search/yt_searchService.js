module.exports = (function ($http, $q) {
	'use strict';
    var searchUrl = 'https://www.googleapis.com/youtube/v3/search',
        playlistsUrl = 'https://www.googleapis.com/youtube/v3/playlists',
        videosUrl = 'https://www.googleapis.com/youtube/v3/videos',
        searchType = 'playlist,video',
        maxResults = 8,
        regionCode = 'GB',
        relevanceLanguage = 'en',
        developerToken = config.youtubeDeveloperToken,
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
            $http.get(playlistsUrl, {
                params: {
                    id: playlists.join(','),
                    key: developerToken,
                    part: 'snippet,contentDetails'
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[playlists_map[item.id]].channel = item.snippet.channelTitle;
                    list[playlists_map[item.id]].totalItems = item.contentDetails.itemCount;
                });
            });
        }

        if(durations.length) {
            $http.get(videosUrl, {
                params: {
                    id: durations.join(','),
                    key: developerToken,
                    part: 'contentDetails'
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[durations_map[item.id]].duration = item.contentDetails.duration;
                });
            });
        }

        console.debug(list);

        // TODO: distinguish result set depending on type
        return [
            {
                type: type,
                title: 'Results for "' + searchValue + '"',
                next: null, // future
                prev: null, // future
                items: list
            }
        ];
	};

	var getResult = function(type, query) {
        var deferred = $q.defer();
        
        searchValue = query;
		$http.get(searchUrl, {
			params: {
				maxResults: maxResults,
                relevanceLanguage: relevanceLanguage,
                regionCode: regionCode,
				q: query,
				part: 'snippet',
				key: developerToken,
				type: searchType
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