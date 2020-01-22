videojs.registerPlugin('simplegtm', function (options) {
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

    if (!dataLayer) {
        console.log("Google GTM is not detected")
    }

    var debug = false;
    var firstPlay = false;
    var _dataLayerArray;

    if (options) {
        debug = (window.localStorage.getItem("sdsat_debug") == 'true') || options.debug;
    }



    var player = this,
        percentsPlayedInterval = options.percentsPlayedInterval,
        percentsAlreadyTracked = []

    function populateData() {
        _dataLayerArray = {};
        if (!options.mapping) {
            debug && console.log('++++ mapping data not provided +++ ');
        } else {
            var mapping = options.mapping.values
            console.log(mapping)
            debug && console.log('++++ Printing mapping Array Pre Sort');
            mapping.sort(function (a, b) {
                return a.rank - b.rank;
            })
            debug && console.log('++++ Printing mapping Array Post Sort');
            console.log(mapping)
            mapping.forEach(item => {
                if (item['location'] == "mediainfo") {
                    _dataLayerArray[item['value']] = player.mediainfo[item['extractValue']] || ''
                }
                else if (item['location'] == "bcAnalytics_client_defaultParams_") {
                    _dataLayerArray[item['value']] = player.bcAnalytics.client.defaultParams_[item['extractValue']] || ''
                }
                else if (item['location'] == "customFields") {
                    _dataLayerArray[item['value']] = player.mediainfo.customFields[item['extractValue']] || ''
                }
                else if (item['location'] == "staticFields") {
                    _dataLayerArray[item['value']] = item['extractValue']
                }
                if (item['modifier']) {
                    debug && console.log('++++ Modifying From "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');
                    _dataLayerArray[item['value']] = modify(item['modifier'], _dataLayerArray[item['value']])
                    debug && console.log('++++ Modifying To "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');
                }
                debug && console.log('++++ added "' + item['value'] + '" : "' + _dataLayerArray[item['value']] + '"}  +++ ');

            })

        }
    }


    player.on('loadedmetadata', function () {
        debug && console.log('++++ loadedmetadata +++ ');
    });

    player.on('play', function () {
        debug && console.log('+++ play +++ ');
        if (firstPlay) {
            debug && console.log('+++ first play +++ ');
            populateData();
            _dataLayerObject = {}
            _dataLayerObject['event'] = 'mediaPlayProgressStarted';
            _dataLayerObject['mediaPlayProgressPosition'] = 0;
            _dataLayerArray = Object.assign(_dataLayerObject,_dataLayerArray)
            dataLayer.push(_dataLayerArray)
            firstPlay = false
        } else {
            debug && console.log('+++ non first play +++ ');
            _dataLayerArray['event'] = 'mediaPlayBackStarted';    
            dataLayer.push(_dataLayerArray)

        }
    });
    //
    player.on('loadstart', function () {
        debug && console.log('+++ loadstart +++ ');
        firstPlay = true;
    });

    player.on('pause', function () {

        var currentTime = Math.round(this.currentTime());
        var duration = Math.round(this.duration());
        var percentPlayed = Math.round(currentTime / duration * 100);
        debug && console.log('+++ Percentage played' + percentPlayed + ' +++ ');
        if (percentPlayed < 99) {
            debug && console.log('+++ pause +++ ');
            _dataLayerArray['event'] = 'mediaPlaybackPaused';    
            dataLayer.push(_dataLayerArray)
        } else {
            debug && console.log('+++ pause at the end detected +++ ');
        }

    });

    player.on('ended', function () {
        debug && console.log('+++ ended +++ ');
        _dataLayerArray['event'] = 'mediaPlaybackFinished';
        _dataLayerArray['mediaPlayProgressPosition'] = 1;
        dataLayer.push(_dataLayerArray)
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
                        _dataLayerArray['event'] = 'mediaPlayProgress';
                        _dataLayerArray['mediaPlayProgressPosition'] = percent / 100;
                        
                        dataLayer.push(_dataLayerArray)
                    }
                }
                if (percentPlayed > 0) {
                    percentsAlreadyTracked.push(percent);
                }
            }
        }
    });

    function modify(object, value) {
        if (object['type'] == 'replace') {
            var regex = new RegExp(atob(object['regexBase64']), "g");
            return value.replace(regex, object['replaceValue'])
        } else if (object['type'] == 'comparator') {
            if (object['operator'] == "==") {
                return (value == object['variable']) ? object['value1'] : object['value2']
            }
        } else {
            return value;
        }

    }

});
