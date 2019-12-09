videojs.registerPlugin('AdobeConviva', function (options) {
    function log(m, p) {
        if (!p) {
            console.log(m)
        }
    }
    var prod = false;
    var adobe = true;
    if (!options) {
        console.log("Options has not been added, please add the options on video cloud")
    } else {
        prod = (options["env"] == "production");
        adobe = options["adobe"];
    }


    var myPlayer = this;
    var isContentLoaded = false;
    var videoDuration;
    var mediaName;
    var mediaPlayerName = window.location.hostname;
    var currentTime;
    var isPlaying = false;
    var videoEnd = false;
    var bitRate = 0;

    var metadata = {};
    var firstPlay = false;
    convivaHelper = new ConvivaHelper(options);
    convivaHelper.initializeConviva();
    convivaHelper._testingEnvironment = prod; // set to false in production 
    var viewerID = "random:" + Math.random() * 1e9;

    if (adobe) {
        viewerID = s.visitor.getMarketingCloudVisitorID();
    }

    function ABDMediaOPEN() {
        log("++ IN ABDMediaOPEN TOP ++", prod);

        //Check the metadata is loaded
        if (isContentLoaded) {
            log("++ IN ABDMediaOPEN content loaded ++", prod);
            //Get all required metadata
            currentTime = myPlayer.currentTime();
            mediaName = myPlayer.mediainfo.name;
            videoDuration = myPlayer.mediainfo.duration;
            metadata = {};

            metadata["id"] = myPlayer.mediainfo.id;
            metadata["title"] = mediaName;
            metadata["url"] = myPlayer.mediainfo.sources[0].src;
            metadata["live"] = false;
            metadata["durationSec"] = videoDuration;
            metadata["streamType"] = myPlayer.mediainfo.sources[0].type;
            metadata["applicationName"] = window.location.hostname;

            //custom 
            metadata["assetID"] = myPlayer.mediainfo.id;
            metadata["channel"] = window.location.hostname;
            metadata["playerName"] = getPlayerName();

            metadata["viewerID"] = viewerID;

            //createConvivaSession
            userData = {}
            userData["id"] = viewerID;
            userData["hostname"] = window.location.hostname;

            //add all custom fields 
            Object.assign(metadata, myPlayer.mediainfo.customFields);

            log(JSON.stringify(metadata), prod)

            //Open adobe Analytics Media Module	

            adobe && s.Media.open(mediaName, videoDuration, mediaPlayerName);

            //Check if video is playing
            if (isPlaying) {
                log("++IN ABDMediaOPEN video is playing " + mediaName + " | " + videoDuration, prod);
                //Play Adobe Analytics Media module from beginning.
                adobe && s.Media.play(mediaName, currentTime);
            }
        }
    }

    //Used to reset the variables as when the next videos play, the play event is called before loadstart ...
    function resetVariables() {
        isContentLoaded = false;
        videoDuration = currentTime = "";
        videoEnd = true;
        bitRate=0;
    }

    myPlayer.on('loadstart', function () {
        log("++loadstart - " + myPlayer.mediainfo.name, prod);
        firstPlay = true;
        //Check that metadata is loaded
        if (myPlayer.mediainfo.name) {
            isContentLoaded = true;
            //Initiate Adobe Analytics Media Module tracking && Conviva Analytics


        }
    });

    myPlayer.on('play', function () {
        log("++Played - " + myPlayer.mediainfo.name, prod);
        isPlaying = true;
        if (firstPlay) {
            log("++ First Play via played - " + myPlayer.mediainfo.name, prod);
            firstPlay = false;
            isContentLoaded = true;
            ABDMediaOPEN();
            convivaHelper.createConvivaSession(userData, metadata);
            convivaHelper.attachPlayerToSession();
            convivaHelper.contentSetBitrateKbps(bitRate);
        }

        if (videoEnd) { //user has restarted video from end 
            videoEnd = false;
            isContentLoaded = true;
            ABDMediaOPEN();
            convivaHelper.createConvivaSession(userData, metadata);
            convivaHelper.attachPlayerToSession();

        }

        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.
        if (isContentLoaded) {
            currentTime = myPlayer.currentTime();
            //Play Adobe Analytics Media module from the current head.
            if (adobe) {
                s.eVar63 = mediaName
                s.Media.play(mediaName, currentTime);

            }

        }
    });

    myPlayer.on("playing", function () {
        log("++ In Playing ++", prod)

        convivaHelper.setPlayerWidthAndHeight(myPlayer.videoWidth(), myPlayer.videoHeight());
        convivaHelper.updatePlayerState("playing");
    });


    myPlayer.on('pause', function () {
        isPlaying = false;
        log("++paused - " + myPlayer.mediainfo.name, prod);
        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.
        if (isContentLoaded) {
            currentTime = myPlayer.currentTime();
            //Play Adobe Analytics Media module from the current head.
            adobe && s.Media.stop(mediaName, currentTime);
            convivaHelper.updatePlayerState("pause");
        }
    });

    myPlayer.on('progress', function () {
        log("progressed - " + myPlayer.mediainfo.name, prod);

    });

    myPlayer.on('resize', function () {
        log("resized - " + myPlayer.mediainfo.name, prod);
    });

    myPlayer.on('seeked', function () {
        log("++seeked - " + myPlayer.mediainfo.name, prod);
        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.
        if (isContentLoaded) {
            currentTime = myPlayer.currentTime();
            //Play Adobe Analytics Media module from the current head.
            adobe && s.Media.play(mediaName, currentTime);
            convivaHelper.contentSeeked();
        }
    });

    myPlayer.on('seeking', function () {
        log("++seeking - " + myPlayer.mediainfo.name, prod);
        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.
        if (isContentLoaded) {
            currentTime = myPlayer.currentTime();
            //Play Adobe Analytics Media module from the current head.
            adobe && s.Media.stop(mediaName, currentTime);
        }
    });

    myPlayer.on('stalled', function () {
        log("++stalled - " + myPlayer.mediainfo.name, prod);
        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.

    });


    myPlayer.on('timeupdate', function () {
        log("++timeupdate - " + myPlayer.mediainfo.name, prod);
    });

    myPlayer.on('volumechange', function () {
        log("++volumechange - " + myPlayer.mediainfo.name, prod);
    });

    myPlayer.on('waiting', function () {
        log("++waiting - " + myPlayer.mediainfo.name, prod);
        if (isContentLoaded) {
            convivaHelper.updatePlayerState("waiting");
        }
    });

    myPlayer.on('durationchange', function () {
        log("++durationchange - " + myPlayer.mediainfo.name, prod);
    });

    myPlayer.on('ended', function () {
        log("++ended - " + myPlayer.mediainfo.description, prod);
        //Check if metadata loaded - needed to make sure correct video media module instance is tracked.
        if (isContentLoaded) {
            currentTime = myPlayer.currentTime();
            //Play Adobe Analytics Media module from the current head.
            adobe && s.Media.stop(mediaName, currentTime);
            adobe && s.Media.close(mediaName);
            convivaHelper.updatePlayerState("ended");
            convivaHelper.cleanupConvivaSession();
            resetVariables();
        }
    });

    myPlayer.on("bc-catalog-error", function () {
        log("++ In Catalog Error ++", prod);
        const error = myPlayer.error_;
        const code = error.code;
        const message = error.message;
        const type = error.type;
        convivaHelper.contentReportError(code + ": " + message + " " + type, Conviva.Client.ErrorSeverity.FATAL);
        convivaHelper.cleanupConvivaSession();
    });

    myPlayer.on("error", function () {
        log("++ In Error ++", prod);
        const error = myPlayer.error_;
        const code = error.code;
        const message = error.message;
        const type = error.type;
        convivaHelper.contentReportError(code + ": " + message + " " + type, Conviva.Client.ErrorSeverity.FATAL);
        convivaHelper.cleanupConvivaSession();
    });

    myPlayer.on('fullscreenchange', function () {
        log("++fullscreenchange - " + myPlayer.mediainfo.name, prod);
    });

    myPlayer.on('loadedalldata', function () {
        log("++loadedalldata - " + myPlayer.mediainfo.name, prod);

    });

    myPlayer.on('loadeddata', function () {
        log("++loadeddata - " + myPlayer.mediainfo.name, prod);
        const tech_ = myPlayer.tech_;
        if (tech_) {
            const hls = tech_.hls; // Brightcove hls plugin
            if (hls && hls.playlists && hls.playlists.media) {
                const media = hls.playlists.media();
                if (media && media.attributes && media.attributes.BANDWIDTH) {
                    bitRate = media.attributes.BANDWIDTH/1e3;
                    //convivaHelper.contentSetBitrateKbps(media.attributes.BANDWIDTH / 1000);
                    log(bitRate, prod);
                }
            }
        }
    });

    myPlayer.on('loadedmetadata', function () {
        log("++loadedmetadata - " + myPlayer.mediainfo.name, prod);
        if (myPlayer.mediainfo.name) {
            isContentLoaded = true;
            //Initiate Adobe Analytics Media Module tracking && Conviva Analytics
            ABDMediaOPEN();
        }
    });

    function getPlayerName() {
        var hostname = window.location.hostname.replace(/^(www\.|m\.)/, '');

        aflSitesArray = new Object();
        aflSitesArray['afl.com.au'] = 'AFL Network';
        aflSitesArray['fantasy.afl.com.au'] = 'AFL Fantasy';
        aflSitesArray['tipping.afl.com.au'] = 'AFL Tipping';
        aflSitesArray['afc.com.au'] = 'Adelaide Crows';
        aflSitesArray['lions.com.au'] = 'Brisbane Lions';
        aflSitesArray['carltonfc.com.au'] = 'Carlton Blues';
        aflSitesArray['collingwoodfc.com.au'] = 'Collingwood Magpies';
        aflSitesArray['essendonfc.com.au'] = 'Essendon Bombers';
        aflSitesArray['fremantlefc.com.au'] = 'Fremantle';
        aflSitesArray['geelongcats.com.au'] = 'Geelong Cats';
        aflSitesArray['goldcoastfc.com.au'] = 'Gold Coast';
        aflSitesArray['gwsgiants.com.au'] = 'GWS';
        aflSitesArray['hawthornfc.com.au'] = 'Hawthorn Hawks';
        aflSitesArray['melbournefc.com.au'] = 'Melbourne Demons';
        aflSitesArray['nmfc.com.au'] = 'Kangaroos';
        aflSitesArray['portadelaidefc.com.au'] = 'Port Adelaide';
        aflSitesArray['richmondfc.com.au'] = 'Richmond Tigers';
        aflSitesArray['saints.com.au'] = 'St.Kilda Saints';
        aflSitesArray['sydneyswans.com.au'] = 'Sydney Swans';
        aflSitesArray['westcoasteagles.com.au'] = 'West Coast Eagles';
        aflSitesArray['westernbulldogs.com.au'] = 'Western Bulldogs';
        aflSitesArray[''] = 'AFL W';

        return aflSitesArray[hostname] || "test";
    }

});
