videojs.registerPlugin('telstra-360', function (options) {
    __indexOf = [].indexOf || function (item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };
    var player = this
    if ( player.mediainfo.customFields["content_provider"] == "360" ){
        player.vr({projection: '360'});
    }
});
