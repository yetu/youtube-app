module.exports = (function ($http, $q) {
	'use strict';
    var searchUrl = 'https://www.googleapis.com/youtube/v3/search',
        channelsUrl = 'https://www.googleapis.com/youtube/v3/channels',
        searchType = 'playlist,video',
        maxResults = 8,
        developerToken = config.youtubeDeveloperToken,
        searchValue;

	var processResultList = function(type, data){
        var list = [],
            channels = [],
            channels_map = [];

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
                channels.push(item.snippet.channelId);
                channels_map[item.snippet.channelId] = list.length;
            }

			list.push(newListItem);
		});

        if(channels.length) {
            $http.get(channelsUrl, {
                params: {
                    id: channels.join(','),
                    key: developerToken,
                    part: 'snippet'
                }
            }).success(function(data){
                data.items.forEach(function(item) {
                    list[channels_map[item.id]].channel = item.snippet.title;
                });
            });
        }

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
        // setRegion
        // getDetails
    };
});