/* global module */
module.exports = ({
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
});