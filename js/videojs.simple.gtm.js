videojs.registerPlugin('simplegtm', function (options) {

    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var player = this;
    var videoId;
    var percentsPlayedInterval = 25;
    var percentsAlreadyTracked = [];
    var mediaAssetAccount,
        pageName,
        mediaPlatformVersion,
        mediaPlayer,
        mediaPlayerName,
        mediaAssetSessionID,
        mediaAssetID,
        mediaAssetTitle,
        mediaAssetDuration

    eventsTracked = ['loadedmetadata', 'play', 'pause', 'ended', 'timeupdate'];

    player.on('loadedmetadata', function () {

        console.log('++++ loadedmetadata +++ ');
        if (player.mediainfo) {
            mediaAssetAccount = player.mediainfo.accountId
            pageName = player.bcAnalytics.client.defaultParams_.destination
            mediaPlayerName = player.bcAnalytics.client.defaultParams_.player_name
            mediaAssetSessionID = player.bcAnalytics.client.defaultParams_.session
            mediaAssetID = player.mediainfo.id
            mediaAssetTitle = player.mediainfo.name
            mediaAssetDuration = player.mediainfo.duration
            mediaPlatformVersion = player.bcAnalytics.client.defaultParams_.platform_version
        }

        dataLayer.push({
            "mediaAssetAccount": mediaAssetAccount,
            "pageName": pageName,
            "mediaPlayerName": mediaPlayerName,
            "mediaAssetSessionID": mediaAssetSessionID,
            "mediaAssetID": mediaAssetID,
            "mediaAssetTitle": mediaAssetTitle,
            "mediaAssetDuration": mediaAssetDuration,
            "mediaPlatformVersion": mediaPlatformVersion
        }
        )

    });


    player.on('play', function () {

        console.log('+++ play +++ ');
        dataLayer.push({ "event": "mediaPlayProgressStarted" })



    });

    player.on('ended', function () {

        console.log('+++ ended +++ ');
        dataLayer.push({ "event": "mediaPlaybackFinished" })


    });

    player.on('timeupdate', function () {

        console.log('+++ timeupdate +++ ');
        var currentTime = Math.round(this.currentTime());
        var duration = Math.round(this.duration());
        var percentPlayed = Math.round(currentTime / duration * 100);
        for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
            if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
                if (percentPlayed !== 0) {
                    if (percent > 0) {
                        console.log(percent + '% Milestone Passed');
                        dataLayer.push({
                            "event": "mediaPlayProgress",
                            "mediaPlayProgressPosition": `0.${percent}`
                        })
                    }

                }
                if (percentPlayed > 0) {
                    percentsAlreadyTracked.push(percent);
                }
            }
        }
    });

});