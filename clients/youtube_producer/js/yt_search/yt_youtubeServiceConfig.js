/* global module */
module.exports = ({
    search: {
        url: 'https://www.googleapis.com/youtube/v3/search',
        type: 'playlist,video',
        part: 'snippet',
        maxResults: config.maxSearchResults || 8
    },
    playlists: {
        url: 'https://www.googleapis.com/youtube/v3/playlists',
        part: 'snippet,contentDetails'
    },
    playlist: {
        id: 'playlistId',
        url: 'https://www.googleapis.com/youtube/v3/playlistItems',
        part: 'snippet',
        maxResults: 20
    },
    video: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet,contentDetails,statistics',
        maxResults: 20
    },
    category: {
        id: 'id',
        url: 'https://www.googleapis.com/youtube/v3/videoCategories',
        part: 'snippet',
        maxResults: 20
    },
    popular: {
        id: 'videoCategoryId',
        url: 'https://www.googleapis.com/youtube/v3/videos',
        part: 'snippet'
    },
    regionCode: config.regionCode || 'GB',
    relevanceLanguage: config.relevanceLanguage || 'en',
    developerToken: config.youtubeDeveloperToken
});