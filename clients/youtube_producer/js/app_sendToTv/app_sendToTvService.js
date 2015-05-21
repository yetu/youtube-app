module.exports = (function ($http, $location, $filter, serverPathsConfig) {
  'use strict';
  var that = this;
  var sendPayload = function(payload){
  var videoTitle = payload.headline || '';

    $http.post(serverPathsConfig.youtubeUrl, payload).success(function(payload){
      that.playlistSendResult = {
        name: decodeURI(videoTitle),
        sended: "YES"
      };
    }).error(function(data, status){
      if(status === 401){
        that.playlistSendResult = {
          name: decodeURI(videoTitle),
          sended: 401
        };
      }else {
        that.playlistSendResult = {
          name: decodeURI(videoTitle),
          sended: "ERROR"
        };
      }
    });
  };

  var sendToTv = function (data) {
    var url = $location.protocol() + '://' + $location.host() + ":" + $location.port();
    var payload = {
      action: {
        url: url + "/#/view/fullscreen/" + data.type + "/" + data.id + "/tv",
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
