module.exports = (function ($rootScope, $http, $location, $filter, serverPathsConfig) {
    'use strict';

    var buildPayload = function (data) {
        var url = $location.protocol() + '://' + $location.host() + ":" + $location.port(),
            actTime = data.actTime - 5 < 0 ? 0 : data.actTime - 5,
            // for localhost testing set target url explicitly
            // url = 'https://youtubeapp-dev.yetu.me',
            payload = {
                action: {
                    url: url + serverPathsConfig.level2Url + "#/view/fullscreen/" + data.type + "/" + data.id + "/" + actTime,
                    type: "open",
                    button: {
                        icon: url + serverPathsConfig.imageUrl + "notification_play.svg",
                        label: "Play" //TODO: add i18n.COMMIT_BUTTON_LABEL
                    }
                },
                headline: encodeURI(data.title),
                stream: {
                    owner: data.channel,
                    title: encodeURI(data.title),
                    image: data.img,
                    duration: $filter('duration')(data.duration),
                    publishDate: $filter('timeAgo')(data.created),
                    viewCount: data.views,
                    resolution: data.resolution
                }
            };

        return payload;

    };

    var sendPayload = function (payload) {

        var sendResult = {
            name: decodeURI(payload.headline || ''),
            sent: true
        };

        $http.post(serverPathsConfig.youtubeUrl, payload)
            .success(function () {
                $rootScope.$broadcast('appSendToTv:send', sendResult);
            })
            .error(function (data, status) {
                // replace default success with error
                sendResult.sent = status === 401 ? 401 : false;
                $rootScope.$broadcast('appSendToTv:send', sendResult);
            });
    };

    var sendToTv = function (data) {
        sendPayload(buildPayload(data));
    };

    return {
        sendToTv: sendToTv
    };
});
