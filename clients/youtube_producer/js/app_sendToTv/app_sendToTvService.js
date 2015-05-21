module.exports = (function ($rootScope, $http, $location, $filter, serverPathsConfig) {
    'use strict';

    var sendPayload = function(payload) {

        var sendResult = {
                name: decodeURI(payload.headline || ''),
                sended: "YES"
            };

        $http.post(serverPathsConfig.youtubeUrl, payload).success(function(){
            $rootScope.$broadcast("appSendToTv:send", sendResult);
        }).error(function(data, status){
            // replace default success with error
            sendResult.sended = status === 401 ? 401 : "ERROR";
            $rootScope.$emit("appSendToTv:send", sendResult);
        });
  };

  var sendToTv = function (data) {
    var url = $location.protocol() + '://' + $location.host() + ":" + $location.port(),
        actTime = data.actTime - 5 < 0 ? 0 : data.actTime - 5;

    var payload = {
      action: {
        url: url + "/#/view/fullscreen/" + data.type + "/" + data.id + "/" + actTime + "/tv",
        // for localhost testing use the one below
        // url: "https://youtubeapp-dev.yetu.me" + "/#/view/fullscreen/" + data.type + "/" + data.id + "/tv",
        type: "open",
        parameter: {
          playlistId: "",
          itemIndex: 0
        },
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

    sendPayload(payload);

  };

  return {
    sendToTv: sendToTv
  };
});
