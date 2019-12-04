videojs.registerPlugin('simplegtm', function (options) {

    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var debug = false;

    if (options) {
        debug = options.debug;
    }

    var player = this,
        percentsPlayedInterval = 25,
        percentsAlreadyTracked = [],
        mediaAssetAccount,
        pageName,
        mediaPlatformVersion,
        mediaPlayer,
        mediaPlayerName,
        mediaAssetSessionID,
        mediaAssetID,
        mediaAssetTitle,
        mediaAssetDuration,
        competition,
        matchSeasonName,
        matchChampionID,
        matchRoundName,
        mediaProgramCategory,
        mediaProgramType,
        mediaAssetPubisherName,
        mediaAdStatus


    player.on('loadedmetadata', function () {

        debug && console.log('++++ loadedmetadata +++ ');
        if (player.mediainfo) {
            mediaAssetAccount = player.mediainfo.accountId
            pageName = player.bcAnalytics.client.defaultParams_.destination
            mediaPlayerName = player.bcAnalytics.client.defaultParams_.player_name
            mediaAssetSessionID = player.bcAnalytics.client.defaultParams_.session
            mediaAssetID = player.mediainfo.id
            mediaAssetTitle = player.mediainfo.name
            mediaAssetDuration = player.mediainfo.duration
            mediaPlatformVersion = player.bcAnalytics.client.defaultParams_.platform_version
            competition = player.mediainfo.customFields.competition
            matchSeasonName = player.mediainfo.customFields.season_name
            matchChampionID = player.mediainfo.customFields.match_champion_id
            matchRoundName = player.mediainfo.customFields.round_name
            mediaProgramCategory = player.mediainfo.customFields.program_category
            mediaProgramType = player.mediainfo.customFields.program_type
            mediaAssetPubisherName = player.mediainfo.customFields.content_provider
            mediaAdStatus = player.mediainfo.customFields.no_ads
        }

        dataLayer.push({
            "mediaAssetAccount": mediaAssetAccount,
            "pageName": pageName,
            "mediaPlayerName": mediaPlayerName,
            "mediaAssetSessionID": mediaAssetSessionID,
            "mediaAssetID": mediaAssetID,
            "mediaAssetTitle": mediaAssetTitle,
            "mediaAssetDuration": mediaAssetDuration,
            "mediaPlatformVersion": mediaPlatformVersion,
            "competition": competition,
            "matchSeasonName": matchSeasonName,
            "matchChampionID": matchChampionID,
            "matchRoundName": matchRoundName,
            "mediaProgramCategory": mediaProgramCategory,
            "mediaProgramType": mediaProgramType,
            "mediaAssetPubisherName": mediaAssetPubisherName,
            "mediaAdStatus":mediaAdStatus
        }
        )

    });


    player.on('play', function () {

        debug && console.log('+++ play +++ ');
        dataLayer.push({ "event": "mediaPlayProgressStarted" })



    });

    player.on('ended', function () {

        debug && console.log('+++ ended +++ ');
        dataLayer.push({ "event": "mediaPlaybackFinished" })


    });

    player.on('timeupdate', function () {

        debug && console.log('+++ timeupdate +++ ');
        var currentTime = Math.round(this.currentTime());
        var duration = Math.round(this.duration());
        var percentPlayed = Math.round(currentTime / duration * 100);
        for (percent = _i = 0; _i <= 99; percent = _i += percentsPlayedInterval) {
            if (percentPlayed >= percent && __indexOf.call(percentsAlreadyTracked, percent) < 0) {
                if (percentPlayed !== 0) {
                    if (percent > 0) {
                        debug && console.log(percent + '% Milestone Passed');
                        dataLayer.push({
                            "event": "mediaPlayProgress",
                            "mediaPlayProgressPosition": percent/100
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